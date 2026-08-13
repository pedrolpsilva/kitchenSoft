package firebase

import (
	"context"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/db"
	"github.com/avigium/kds-backend/internal/model"
	"google.golang.org/api/option"
)

type Client struct {
	dbClient *db.Client
}

func NewClient(ctx context.Context, credentialsPath, databaseURL string) (*Client, error) {
	opt := option.WithCredentialsFile(credentialsPath)
	config := &firebase.Config{DatabaseURL: databaseURL}
	
	app, err := firebase.NewApp(ctx, config, opt)
	if err != nil {
		return nil, err
	}

	dbClient, err := app.Database(ctx)
	if err != nil {
		return nil, err
	}

	return &Client{dbClient: dbClient}, nil
}

func (c *Client) SetOrder(ctx context.Context, tenantID, stationID, orderID string, order model.Order) error {
	ref := c.dbClient.NewRef("tenants/" + tenantID + "/stations/" + stationID + "/orders/" + orderID)
	return ref.Set(ctx, order)
}

func (c *Client) GetOrders(ctx context.Context, tenantID, stationID string) ([]model.Order, error) {
	ref := c.dbClient.NewRef("tenants/" + tenantID + "/stations/" + stationID + "/orders")
	var data map[string]model.Order
	if err := ref.Get(ctx, &data); err != nil {
		return nil, err
	}
	
	var orders []model.Order
	for _, o := range data {
		orders = append(orders, o)
	}
	return orders, nil
}

func (c *Client) DeleteOrder(ctx context.Context, tenantID, stationID, orderID string) error {
	ref := c.dbClient.NewRef("tenants/" + tenantID + "/stations/" + stationID + "/orders/" + orderID)
	return ref.Delete(ctx)
}

func (c *Client) GetAllStationOrders(ctx context.Context, tenantID string) (map[string][]model.Order, error) {
	ref := c.dbClient.NewRef("tenants/" + tenantID + "/stations")
	var data map[string]map[string]map[string]model.Order
	
	// Data structure expected: stations -> stationId -> "orders" -> orderId -> Order
	if err := ref.Get(ctx, &data); err != nil {
		return nil, err
	}
	
	result := make(map[string][]model.Order)
	for stationID, stationData := range data {
		if ordersMap, ok := stationData["orders"]; ok {
			var orders []model.Order
			for _, o := range ordersMap {
				orders = append(orders, o)
			}
			result[stationID] = orders
		}
	}
	
	return result, nil
}
