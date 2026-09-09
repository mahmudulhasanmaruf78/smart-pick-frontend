import { VerificationStatus } from './user';

export interface DashboardStats {
  users: {
    total: number;
    customers: number;
    riders: number;
    admins: number;
  };
  orders: {
    total: number;
    pending: number;
    accepted: number;
    delivered: number;
    cancelled: number;
  };
  revenue: number;
}

export interface VerifyRiderPayload {
  status: VerificationStatus.Approved | VerificationStatus.Rejected;
}
