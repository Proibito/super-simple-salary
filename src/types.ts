import type { Timestamp } from 'firebase/firestore'
import type { DBSchema } from 'idb'

export interface WorkedDay {
  date: Date
  timeSlots: TimeSlot[]
  travel: boolean
  carUsage: boolean
}

export interface TimeSlot {
  start: string
  end: string
}

export interface PaymentHistory {
  monthYear: string
  payment: number
}

export interface MyDB extends DBSchema {
  workedDays: {
    value: WorkedDay
    key: string
    indexes: { date: Date }
  }
  baseWage: {
    key: string
    value: number
  }
  travel: {
    key: string
    value: number
  }
  monthlyPayments: {
    key: string
    value: PaymentHistory
    indexes: { monthYear: string }
  }
}

export enum WorkedHoursStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export enum WorkLocations {
  VILLA_SASSI = 'Villa Sassi',
  VILLA_BRIA = 'Villa Bria',
  BAROLO = 'Barolo',
  CLOUD = 'Cloud',
  MUMA = 'Muma'
}


export interface WorkLocation {  // Rinominato da Location a WorkLocation
  id: string;
  name: string;
  active: boolean;
}

export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
  notes?: string;
}

export interface WorkShift {
  id: string;
  userId: string;
  eventId?: string;
  date: Timestamp;
  locationId: string;
  status: 'DRAFT' | 'VALIDATED' | 'COMPLETED' | 'REJECTED';
  timeRanges: TimeRange[];
  totalHours: number;
  travel: boolean;
  usePersonalCar: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  validatedBy?: string;
  validatedAt?: Timestamp;
  validatedHours?: number;
}

export interface DetailedWage {
  totalHours: number
  totalTravel: number
  dailyAllowance: number
}
