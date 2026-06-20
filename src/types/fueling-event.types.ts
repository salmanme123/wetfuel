export type FuelingStep = 'arrival' | 'qr_scan' | 'meter_connect' | 'volume_capture' | 'price_calculated' | 'tax_calculated' | 'completed' | 'synced';

export interface FuelingEventStep {
  step: FuelingStep;
  label: string;
  timestamp: string;
  data: Record<string, string | number> | null;
}

export interface FuelingEvent {
  id: string;
  tenantId: string;
  organizationId: string;
  jobId: string;
  jobNumber: string;
  driverId: string;
  driverName: string;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  equipmentId: string;
  equipmentName: string;
  qrCode: string;
  fuelType: string;
  gallonsDelivered: number;
  pricePerGallon: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  meterStartReading: number;
  meterEndReading: number;
  latitude: number;
  longitude: number;
  steps: FuelingEventStep[];
  createdAt: string;
}
