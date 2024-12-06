import {
  Timestamp,
  doc,
  DocumentReference,
  writeBatch,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import {
  WorkLocations,
  type TimeRange,
  type TimeSlot,
  type WorkShift
} from './../types'
import { db } from './firebase.svelte'

type CreateWorkShiftParams = Omit<Partial<WorkShift>, 'date'> & {
  date: Timestamp
}

export async function addWorkingShift(workShiftData: WorkShift) {
  const workShiftId = workShiftData.id

  try {
    const shiftsRef = doc(
      db,
      `workShifts/`,
      workShiftId
    ) as DocumentReference<WorkShift>

    const batch = writeBatch(db)

    batch.set(shiftsRef, workShiftData)

    const userRef = doc(db, 'users', workShiftData.userId)
    batch.update(userRef, {
      id: workShiftData.id,
      workShifts: arrayUnion(shiftsRef)
    })

    if (workShiftData.eventId) {
      const eventRef = doc(db, 'events', workShiftData.eventId)
      batch.update(eventRef, {
        WorkShifts: arrayUnion(workShiftData.id)
      })
    }

    await batch.commit()
    return true
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
    return false
  }
}

export async function deleteWorkShift(workShiftData: WorkShift) {
  const docRef = doc(db, 'users', workShiftData.userId)

  await updateDoc(docRef, {
    workShifts: arrayRemove(doc(db, 'workShifts', workShiftData.id))
  })

  await deleteDoc(doc(db, 'workShifts', workShiftData.id))
  return true
}

export class WorkShiftFactory {
  static create(params: CreateWorkShiftParams): WorkShift {
    const now = Timestamp.now()

    return {
      id: params.id ?? crypto.randomUUID(),
      userId: params.userId ?? '',
      eventId: params.eventId ?? '',
      date: params.date ?? now,
      locationId: params.locationId ?? WorkLocations.VILLA_SASSI,
      status: params.status ?? 'DRAFT',
      timeRanges: params.timeRanges ?? [],
      travel: params.travel ?? params.locationId == WorkLocations.BAROLO,
      usePersonalCar: params.usePersonalCar ?? false,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
      validatedBy: params.validatedBy ?? ''
    }
  }

  static createTimeRange(slot: TimeSlot, date: Date | string): TimeRange {
    const baseDate = typeof date === 'string' ? new Date(date) : date

    const start = new Date(
      `${baseDate.toISOString().split('T')[0]}T${slot.start}`
    )
    const end = new Date(`${baseDate.toISOString().split('T')[0]}T${slot.end}`)

    if (end < start) {
      end.setDate(end.getDate() + 1)
    }

    return {
      start: Timestamp.fromDate(start),
      end: Timestamp.fromDate(end)
    }
  }

  static createFromTimeSlots(params: WorkShift): WorkShift {
    return this.create({
      date: params.date,
      userId: params.userId,
      locationId: params.locationId,
      status: params.status,
      usePersonalCar: params.usePersonalCar,
      timeRanges: params.timeRanges,
      travel: params.locationId === WorkLocations.BAROLO
    })
  }
}
