export interface DeliveryZone {
  id: number;
  name: string;
  baseRegularFare: number;
  baseExpressFare: number;
  weightLimitKg: number;
  extraWeightRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZonePayload {
  name: string;
  baseRegularFare: number;
  baseExpressFare: number;
  weightLimitKg: number;
  extraWeightRate: number;
}

export type UpdateZonePayload = Partial<CreateZonePayload>;
