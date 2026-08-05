package handler

import (
	"encoding/json"
	"net/http"

	"github.com/avigium/kds-backend/internal/model"
	"github.com/avigium/kds-backend/internal/service"
)

type OrderHandler struct {
	orderSvc *service.OrderService
	batchSvc *service.BatchService
}

func NewOrderHandler(orderSvc *service.OrderService, batchSvc *service.BatchService) *OrderHandler {
	return &OrderHandler{
		orderSvc: orderSvc,
		batchSvc: batchSvc,
	}
}

func (h *OrderHandler) HandleCreateOrder(w http.ResponseWriter, r *http.Request) {
	var req struct {
		DisplayID string            `json:"displayId"`
		Origin    model.OrderOrigin `json:"origin"`
		Items     []model.OrderItem `json:"items"`
		StationID string            `json:"stationId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	order := model.NewOrder(req.DisplayID, req.Origin, req.Items, req.StationID)

	if err := h.orderSvc.CreateOrder(r.Context(), order); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

func (h *OrderHandler) HandleMarkReady(w http.ResponseWriter, r *http.Request) {
	stationID := r.PathValue("stationId")
	orderID := r.PathValue("orderId")

	if err := h.orderSvc.MarkReady(r.Context(), stationID, orderID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (h *OrderHandler) HandleGetOrders(w http.ResponseWriter, r *http.Request) {
	stationID := r.PathValue("stationId")

	orders, err := h.orderSvc.GetStationOrders(r.Context(), stationID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if orders == nil {
		orders = []model.Order{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func (h *OrderHandler) HandleGetBatch(w http.ResponseWriter, r *http.Request) {
	stationID := r.PathValue("stationId")

	batch, err := h.batchSvc.GetBatchedItems(r.Context(), stationID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if batch == nil {
		batch = []model.BatchGroup{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(batch)
}
