package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/avigium/kds-backend/internal/firebase"
	"github.com/avigium/kds-backend/internal/handler"
	"github.com/avigium/kds-backend/internal/service"
)

func findExistingPath(paths ...string) string {
	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

func loadEnv(filepathName string) {
	envPath := findExistingPath(
		filepathName,
		filepath.Join("..", filepathName),
		filepath.Join("..", "..", filepathName),
	)

	if envPath == "" {
		log.Printf("Warning: failed to find %s, using existing environment variables", filepathName)
		return
	}

	data, err := os.ReadFile(envPath)
	if err != nil {
		log.Printf("Warning: failed to read %s, using environment variables", envPath)
		return
	}

	envDir := filepath.Dir(envPath)
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			if key == "FIREBASE_CREDENTIALS_PATH" && !filepath.IsAbs(val) {
				resolved := filepath.Join(envDir, val)
				if _, err := os.Stat(resolved); err == nil {
					val = resolved
				}
			}
			os.Setenv(key, val)
		}
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	loadEnv(".env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8585"
	}

	credsPath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	if credsPath != "" && !filepath.IsAbs(credsPath) {
		if found := findExistingPath(credsPath, filepath.Join("..", credsPath), filepath.Join("..", "..", credsPath)); found != "" {
			credsPath = found
		}
	}
	dbURL := os.Getenv("FIREBASE_DATABASE_URL")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	fbClient, err := firebase.NewClient(ctx, credsPath, dbURL)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase client: %v", err)
	}

	orderSvc := service.NewOrderService(fbClient)
	batchSvc := service.NewBatchService(fbClient)
	orderHandler := handler.NewOrderHandler(orderSvc, batchSvc)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", handler.HandleHealth)
	mux.HandleFunc("POST /api/orders", orderHandler.HandleCreateOrder)
	mux.HandleFunc("GET /api/orders/{stationId}", orderHandler.HandleGetOrders)
	mux.HandleFunc("PATCH /api/orders/{stationId}/{orderId}/ready", orderHandler.HandleMarkReady)
	mux.HandleFunc("GET /api/orders/{stationId}/batch", orderHandler.HandleGetBatch)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: corsMiddleware(mux),
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctxShutDown, cancelShutDown := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelShutDown()

	if err := srv.Shutdown(ctxShutDown); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
}
