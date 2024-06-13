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

export interface DetailedWage {
  totalHours: number,
  totalTravel: number
  dailyAllowance: number
}
