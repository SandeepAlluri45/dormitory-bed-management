export interface Bed {
  id: number;
  bedNumber: string;
  roomNumber: string;
  floorNumber: number;
  bedType: string;
  status: 'IDLE' | 'ALLOCATED' | 'MAINTENANCE';
  hourlyRate: number;
  dailyRate: number;
  customerName?: string;
  allocationId?: number;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idProofType: string;
  idProofNumber: string;
  address: string;
}

export interface Allocation {
  id: number;
  bedId: number;
  bedNumber: string;
  roomNumber: string;
  customerId: number;
  customerName: string;
  checkInTime: string;
  checkOutTime: string | null;
  expectedCheckout: string | null;
  hourlyRate: number;
  dailyRate: number;
  totalHours: number | null;
  totalCost: number | null;
  currentCost: number;
  paymentStatus: string;
  notes: string;
  active: boolean;
}

export interface AllocationRequest {
  bedId: number;
  customerId: number;
  expectedCheckout?: string;
  notes?: string;
}

export interface DashboardStats {
  totalBeds: number;
  idleBeds: number;
  allocatedBeds: number;
  maintenanceBeds: number;
  activeAllocations: number;
  todayRevenue: number;
  monthRevenue: number;
  occupancyRate: number;
}
