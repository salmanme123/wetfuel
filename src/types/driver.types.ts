export type DriverStatus = 'active' | 'inactive' | 'on_leave';
export type LicenseType = 'CDL-A' | 'CDL-B' | 'CDL-C' | 'standard';
export type ShiftStatus = 'clocked_in' | 'clocked_out' | 'on_break';

export interface DriverLicense {
  type: LicenseType;
  number: string;
  state: string;
  expiryDate: string;
}

export interface DriverCertification {
  id: string;
  name: string;
  issuedDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface Driver {
  id: string;
  tenantId: string;
  organizationId: string;
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: DriverStatus;
  shiftStatus: ShiftStatus;
  license: DriverLicense;
  certifications: DriverCertification[];
  assignedVehicleId: string | null;
  assignedVehicleName: string | null;
  totalDeliveries: number;
  totalGallonsDelivered: number;
  hoursThisWeek: number;
  complianceScore: number;
  hireDate: string;
  lastClockIn: string | null;
  createdAt: string;
  updatedAt: string;
}
