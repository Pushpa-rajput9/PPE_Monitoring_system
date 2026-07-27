export type Role = "admin" | "supervisor";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  site: string;
}

export interface Worker {
  _id: string;
  name: string;
  workerId: string;
  jobProfile: string;
  department: string;
  mobileNumber: string;
  aadharNumber: string;
  site: string;
  isActive: boolean;
}

export type ViolationStatus = "open" | "acknowledged" | "escalated";
export type ViolationSeverity = "low" | "medium" | "high";

export interface Violation {
  _id: string;
  worker: Worker | string;
  deviceId: string;
  ppeType: string;
  severity: ViolationSeverity;
  site: string;
  department: string;
  location: string;
  status: ViolationStatus;
  detectedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: { _id: string; name: string } | string;
  escalatedAt?: string;
}

export interface Supervisor {
  _id: string;
  name: string;
  email: string;
  role: Role;
  site: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminDashboardMetrics {
  totalWorkers: number;
  totalSupervisors: number;
  violationsToday: number;
  openViolations: number;
  escalatedAlerts: number;
  totalViolations: number;
  acknowledgedTotal: number;
  complianceRate: number;
}

export interface SupervisorDashboardMetrics {
  violationsToday: number;
  pendingAck: number;
  acknowledgedToday: number;
  escalatedToday: number;
  avgResponseMinutes: number;
}

export interface InsightBucket {
  label: string;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface Insights {
  byDepartment: InsightBucket[];
  byPpeType: InsightBucket[];
  byStatus: InsightBucket[];
  bySeverity: InsightBucket[];
  trend: TrendPoint[];
}
