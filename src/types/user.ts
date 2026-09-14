export enum Role {
  Customer = "customer",
  Rider = "rider",
  Admin = "admin",
}

export enum VerificationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface RiderVerification {
  id: number;
  userId: number;
  nidNumber: string;
  nidImagePath: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  riderVerification?: RiderVerification;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  identity: string;
  password: string;
}

export interface RegisterCustomerPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterRiderPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  nidNumber: string;
  nidImage: File;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
}
