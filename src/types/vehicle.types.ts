export type VehicleStatus = 'active' | 'maintenance' | 'out_of_service';

export interface VehicleMaintenance {
  id: string;
  type: string;
  scheduledDate: string;
  completedDate: string | null;
  status: 'scheduled' | 'overdue' | 'completed';
  notes: string;
}

export interface Vehicle {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  fuelCapacityGallons: number;
  currentFuelGallons: number;
  status: VehicleStatus;
  registrationExpiry: string;
  insuranceExpiry: string;
  lastInspectionDate: string;
  nextInspectionDue: string;
  mileage: number;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  maintenanceHistory: VehicleMaintenance[];
  createdAt: string;
  updatedAt: string;
}
