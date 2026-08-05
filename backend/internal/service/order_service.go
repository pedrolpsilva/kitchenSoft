package service

import (
	"context"

	"github.com/avigium/kds-backend/internal/firebase"
	"github.com/avigium/kds-backend/internal/model"
)

type OrderService struct {
	fbClient *firebase.Client
}

func NewOrderService(fbClient *firebase.Client) *OrderService {
	return &OrderService{fbClient: fbClient}
}

func (s *OrderService) CreateOrder(ctx context.Context, order model.Order) error {
	// Add validation if necessary
	return s.fbClient.SetOrder(ctx, order.StationID, order.ID, order)
}

func (s *OrderService) MarkReady(ctx context.Context, stationID, orderID string) error {
	return s.fbClient.DeleteOrder(ctx, stationID, orderID)
}

func (s *OrderService) GetStationOrders(ctx context.Context, stationID string) ([]model.Order, error) {
	return s.fbClient.GetOrders(ctx, stationID)
}
