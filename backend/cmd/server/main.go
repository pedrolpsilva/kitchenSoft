package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/avigium/kds-backend/internal/firebase"
	"github.com/avigium/kds-backend/internal/handler"
	"github.com/avigium/kds-backend/internal/service"
)

func loadEnv(filepath string) {
	data, err := os.ReadFile(filepath)
	if err != nil {
		log.Printf("Warning: failed to read %s, using environment variables", filepath)
		return
	}
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			os.Setenv(parts[0], parts[1])
		}
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
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
		fmt.Printf("KDS PedroLPS Backend running on :%s\n", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down server...")

	ctxShutDown, cancelShutDown := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelShutDown()

	if err := srv.Shutdown(ctxShutDown); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Println("Server gracefully stopped")
}
