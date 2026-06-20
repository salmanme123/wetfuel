export type JobStatus = 'draft' | 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type FuelType = 'diesel' | 'gasoline_regular' | 'gasoline_premium' | 'propane' | 'kerosene';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Job {
  id: string;
  tenantId: string;
  organizationId: string;
  jobNumber: string;
  status: JobStatus;
  priority: JobPriority;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  driverId: string | null;
  driverName: string | null;
  vehicleId: string | null;
  vehicleName: string | null;
  fuelType: FuelType;
  requestedGallons: number;
  deliveredGallons: number | null;
  scheduledDate: string;
  scheduledTimeWindow: string;
  completedAt: string | null;
  notes: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}
