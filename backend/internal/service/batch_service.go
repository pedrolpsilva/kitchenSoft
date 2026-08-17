package service

import (
	"context"

	"github.com/avigium/kds-backend/internal/firebase"
	"github.com/avigium/kds-backend/internal/model"
)

type BatchService struct {
	fbClient *firebase.Client
}

func NewBatchService(fbClient *firebase.Client) *BatchService {
	return &BatchService{fbClient: fbClient}
}

func (s *BatchService) GetBatchedItems(ctx context.Context, tenantID, stationID string) ([]model.BatchGroup, error) {
	orders, err := s.fbClient.GetOrders(ctx, tenantID, stationID)
	if err != nil {
		return nil, err
	}

	groups := make(map[string]*model.BatchGroup)

	for _, order := range orders {
		for _, item := range order.Items {
			if _, exists := groups[item.Name]; !exists {
				groups[item.Name] = &model.BatchGroup{
					ItemName: item.Name,
					TotalQty: 0,
					Sources:  []model.BatchSource{},
				}
			}

			group := groups[item.Name]
			group.TotalQty += item.Quantity
			group.Sources = append(group.Sources, model.BatchSource{
				OrderID:   order.ID,
				DisplayID: order.DisplayID,
				Quantity:  item.Quantity,
			})
		}
	}

	var result []model.BatchGroup
	for _, bg := range groups {
		result = append(result, *bg)
	}

	return result, nil
}
