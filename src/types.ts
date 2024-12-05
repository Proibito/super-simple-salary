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

export interface WorkLocation {
  date: Timestamp
  location: string
  locationId?: string
  eventType?: string
}

export interface WorkedHours {
  id: string
  userId: string

  // Informazioni sulla location/evento
  workLocation: WorkLocation

  // Orari di lavoro
  timeSlots: {
    startTime: Timestamp
    endTime: Timestamp
    notes?: string
  }[]

  status: WorkedHoursStatus
  totalHours: number

  // Riferimento all'evento se esiste
  eventId?: string

  // Campi di validazione
  validatedBy?: string
  validatedAt?: Timestamp
  validatedHours?: number
  adjustmentNotes?: string

  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DetailedWage {
  totalHours: number
  totalTravel: number
  dailyAllowance: number
}
