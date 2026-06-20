export type EquipmentType = 'tank' | 'generator' | 'pump' | 'other';
export type EquipmentStatus = 'active' | 'inactive' | 'needs_service';

export interface Equipment {
  id: string;
  tenantId: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  name: string;
  type: EquipmentType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacityGallons: number | null;
  fuelType: string;
  qrCode: string;
  status: EquipmentStatus;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  lastFueledDate: string | null;
  totalFuelingEvents: number;
  totalGallonsDelivered: number;
  installDate: string;
  createdAt: string;
  updatedAt: string;
}
