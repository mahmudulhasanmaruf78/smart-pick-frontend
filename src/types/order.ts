import { User } from './user';

export enum OrderStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  PickedUp = 'picked_up',
  InTransit = 'in_transit',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export enum DeliveryType {
  Regular = 'regular',
  Express = 'express',
}

export enum ParcelType {
  Document = 'document',
  Parcel = 'parcel',
  Fragile = 'fragile',
}

export interface Order {
  id: number;
  customerId: number;
  customer?: User;
  riderId?: number | null;
  rider?: User | null;
  pickupZone: string;
  pickupArea: string;
  dropZone: string;
  dropArea: string;
  parcelType: ParcelType;
  weight: number;
  deliveryType: DeliveryType;
  fare: number;
  status: OrderStatus;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  pickupZone: string;
  pickupArea: string;
  dropZone: string;
  dropArea: string;
  parcelType: ParcelType;
  weight: number;
  deliveryType: DeliveryType;
}

export type UpdateOrderPayload = Partial<CreateOrderPayload>;

export interface UpdateOrderStatusPayload {
  status: OrderStatus.PickedUp | OrderStatus.InTransit | OrderStatus.Delivered;
}

export interface FindAvailableOrdersQuery {
  pickupZoneId?: number;
  dropZoneId?: number;
  status?: OrderStatus;
}
