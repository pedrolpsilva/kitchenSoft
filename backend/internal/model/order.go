package model

import (
	"fmt"
	"time"
)

type ModifierType string

const (
	ModifierAdd    ModifierType = "add"
	ModifierRemove ModifierType = "remove"
)

type OrderStatus string

const (
	StatusPending OrderStatus = "pending"
	StatusReady   OrderStatus = "ready"
)

type OrderOrigin string

const (
	OriginSalao  OrderOrigin = "SalÃ£o"
	OriginIFood  OrderOrigin = "iFood"
	OriginBalcao OrderOrigin = "BalcÃ£o"
)

type Modifier struct {
	ID   string       `json:"id"`
	Name string       `json:"name"`
	Type ModifierType `json:"type"`
}

type OrderItemStatus string

const (
	ItemStatusPending OrderItemStatus = "pending"
	ItemStatusReady   OrderItemStatus = "ready"
)

type OrderItem struct {
	ID        string          `json:"id"`
	Quantity  int             `json:"quantity"`
	Name      string          `json:"name"`
	Status    OrderItemStatus `json:"status,omitempty"`
	Modifiers []Modifier      `json:"modifiers,omitempty"`
}

type Order struct {
	ID        string      `json:"id"`
	TenantID  string      `json:"tenantId"`
	DisplayID string      `json:"displayId"`
	Origin    OrderOrigin `json:"origin"`
	CreatedAt int64       `json:"createdAt"`
	Items     []OrderItem `json:"items"`
	Status    OrderStatus `json:"status"`
	StationID string      `json:"stationId"`
}

type BatchGroup struct {
	ItemName   string        `json:"itemName"`
	TotalQty   int           `json:"totalQty"`
	Sources    []BatchSource `json:"sources"`
}

type BatchSource struct {
	OrderID   string `json:"orderId"`
	DisplayID string `json:"displayId"`
	Quantity  int    `json:"quantity"`
}

func NewOrder(tenantID, displayID string, origin OrderOrigin, items []OrderItem, stationID string) Order {
	return Order{
		ID:        generateID(),
		TenantID:  tenantID,
		DisplayID: displayID,
		Origin:    origin,
		CreatedAt: time.Now().UnixMilli(),
		Items:     initializeItemStatuses(items),
		Status:    StatusPending,
		StationID: stationID,
	}
}

func generateID() string {
	return fmt.Sprintf("ord_%d", time.Now().UnixNano())
}

func initializeItemStatuses(items []OrderItem) []OrderItem {
	for i := range items {
		if items[i].Status == "" {
			items[i].Status = ItemStatusPending
		}
	}
	return items
}
