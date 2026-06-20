export type FuelInventoryType = 'bulk_tank' | 'truck';
export type TransferType = 'tank_to_truck' | 'truck_to_truck' | 'truck_to_tank' | 'purchase' | 'return';

export interface FuelStorage {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  type: FuelInventoryType;
  fuelType: string;
  capacityGallons: number;
  currentGallons: number;
  location: string;
  lastUpdated: string;
  status: 'active' | 'inactive';
}

export interface FuelTransfer {
  id: string;
  tenantId: string;
  organizationId: string;
  transferNumber: string;
  type: TransferType;
  fromStorageId: string | null;
  fromStorageName: string;
  toStorageId: string | null;
  toStorageName: string;
  fuelType: string;
  gallons: number;
  performedBy: string;
  notes: string;
  createdAt: string;
}
