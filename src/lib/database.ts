import { writable } from 'svelte/store'
import { openDB, type IDBPDatabase } from 'idb'
import type { MyDB, TimeSlot, WorkedDay, PaymentHistory } from '../types'
import { ErrorResponse, SuccessResponse } from './logger'
import { addDays, differenceInHours, parse, format } from 'date-fns'
import { calculateTotalHours } from '$lib/utils/timeTrackingUtils'

class DatabaseManager {
  _workedDays = writable<WorkedDay[]>([])
  dbPromise!: Promise<IDBPDatabase<MyDB>>

  constructor() {}

  async startDatabase() {
    this.dbPromise = this.initializeDB()
  }

  async addWorkedDay(workedDay: WorkedDay) {
    const db = await this.dbPromise
    workedDay.timeSlots = JSON.parse(JSON.stringify(workedDay.timeSlots))
    if (!db) {
      new ErrorResponse(
        'No database loaded. You should call startDatabase() first.'
      )
      return
    }
    try {
      const tx = db.transaction('workedDays', 'readwrite')
      const store = tx.objectStore('workedDays')
      const key = format(workedDay.date, 'yyyy-MM-dd')
      await store.put(workedDay, key)
      new SuccessResponse(`Successfully added ${workedDay} with key ${key}`)
      await tx.done
      this._workedDays.update((val) => {
        val.push(workedDay)
        return val
      })
    } catch (error) {
      new ErrorResponse(error)
    }
  }

  async getWorkedDays(asc?: boolean) {
    const db = await this.dbPromise
    if (!db) {
      return
    }
    const workedDays = await db.getAll('workedDays')
    // console.log(workedDays)
    if (!workedDays) return []

    const sortedResult = workedDays.sort((a, b) =>
      asc
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime()
    )

    return sortedResult
  }

  getBaseWage() {
    return 10
  }

  async getHoursWorkedMonth(month: Date): Promise<number> {
    const db = await this.dbPromise
    const tx = db.transaction('workedDays', 'readonly')
    const store = tx.objectStore('workedDays')
    const index = store.index('date')

    // Get first and last day of the month
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDayOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    const range = IDBKeyRange.bound(firstDayOfMonth, lastDayOfMonth)

    let totalWorked = 0
    const allDaysWorked = await index.getAll(range)

    for (const day of allDaysWorked) {
      totalWorked += calculateTotalHours(day.timeSlots)
    }
    return totalWorked
  }

  async deleteWorkedDay(workedDay: WorkedDay) {
    const db = await this.dbPromise
    const tx = db.transaction('workedDays', 'readwrite')
    const store = tx.objectStore('workedDays')
    await store.delete(format(workedDay.date, 'yyyy-MM-dd'))
    await tx.done
    // this._workedDays.update(workedDay);
  }

  calculateTimeSlot(timeSlot: TimeSlot): number {
    const startDate = new Date()
    const startTime = parse(timeSlot.start, 'HH:mm', startDate)
    const endTime = parse(timeSlot.end, 'HH:mm', startDate)

    const hoursWorked = differenceInHours(endTime, startTime)
    if (hoursWorked < 0) {
      const newEndTime = parse(timeSlot.end, 'HH:mm', addDays(startDate, 1))
      return differenceInHours(newEndTime, startTime)
    }
    return hoursWorked
  }

  async getWorkWithTravelOfMonth(month: Date) {
    const db = await this.dbPromise
    const tx = db.transaction('workedDays', 'readonly')
    const store = tx.objectStore('workedDays')
    const index = store.index('date')

    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDayOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    const range = IDBKeyRange.bound(firstDayOfMonth, lastDayOfMonth)

    let totalTravel = 0
    const allDaysWorked = await index.getAll(range)
    for (const day of allDaysWorked) {
      totalTravel += day.travel ? 1 : 0
    }
    return totalTravel
  }

  async getCarUsageOfMonth(month: Date) {
    const db = await this.dbPromise
    const tx = db.transaction('workedDays', 'readonly')
    const store = tx.objectStore('workedDays')
    const index = store.index('date')

    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDayOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    const range = IDBKeyRange.bound(firstDayOfMonth, lastDayOfMonth)

    let totalCarUsage = 0
    const allDaysWorked = await index.getAll(range)
    for (const day of allDaysWorked) {
      totalCarUsage += day.carUsage ? 40 : 0
    }
    return totalCarUsage
  }

  async getTotalCompensationOfMouth(month: Date) {
    const hourlyWage = this.getBaseWage()
    const totalHoursWorked = await this.getHoursWorkedMonth(month)
    const travelTotal = await this.getWorkWithTravelOfMonth(month)
    const carUsage = await this.getCarUsageOfMonth(month)
    return totalHoursWorked * hourlyWage + travelTotal * 20 + carUsage
  }

  async getPaymentHistory() {
    const db = await this.dbPromise
    const tx = db.transaction('monthlyPayments', 'readonly')
    const store = tx.objectStore('monthlyPayments')
    return store.getAll()
  }

  async getSinglePaymentHistory(id: string) {
    const db = await this.dbPromise
    const tx = db.transaction('monthlyPayments', 'readonly')
    const store = tx.objectStore('monthlyPayments')
    return store.get(id)
  }

  async updatePaymentHistory(key: string, val: number) {
    const db = await this.dbPromise
    const tx = db.transaction('monthlyPayments', 'readwrite')
    const store = tx.objectStore('monthlyPayments')
    if (!store) throw Error('Error in the database')
    const paymentRecord: PaymentHistory = {
      monthYear: key,
      payment: val
    }
    return await store.put(paymentRecord)
  }

  private async initializeDB(): Promise<IDBPDatabase<MyDB>> {
    return openDB<MyDB>('MyDB', 4, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log('qui')

        if (!db.objectStoreNames.contains('workedDays')) {
          const workedDaysStore = db.createObjectStore('workedDays')
          workedDaysStore.createIndex('date', 'date')
        }
        if (!db.objectStoreNames.contains('baseWage')) {
          db.createObjectStore('baseWage')
          transaction.objectStore('baseWage').put(10, 'main')
        }
        if (!db.objectStoreNames.contains('travel')) {
          db.createObjectStore('travel')
          transaction.objectStore('travel').put(2, 'main')
        }
        if (!db.objectStoreNames.contains('monthlyPayments')) {
          const monthlyPaymentsStore = db.createObjectStore('monthlyPayments', {
            keyPath: 'monthYear'
          })
          monthlyPaymentsStore.createIndex('monthYear', 'monthYear', {
            unique: false
          })
        }

        // Check if the old object store exists before trying to access it
        if (db.objectStoreNames.contains('giorni_lavorati')) {
          const giorniLavoratiStore = transaction.objectStore('giorni_lavorati')
          console.log('qui')

          giorniLavoratiStore
            .openCursor()
            .then(function processCursor(cursor) {
              if (!cursor) {
                console.log('No more entries!')
                return
              }

              const record = cursor.value
              const newTimeSlots: TimeSlot[] = record.fasce_orarie.map(
                (element: any) => ({
                  start: element.inizio,
                  end: element.fine
                })
              )

              const newRecord: WorkedDay = {
                date: record.giorno,
                timeSlots: newTimeSlots,
                travel: record.viaggio,
                carUsage: record.yourCar
              }

              const key = format(newRecord.date, 'yyyy-MM-dd')
              const newStore = transaction.objectStore('workedDays')

              newStore
                .put(newRecord, key)
                .then(() => {
                  cursor
                    .delete()
                    .then(() => {
                      cursor.continue().then(processCursor)
                    })
                    .catch((error) => {
                      console.error('Error deleting old record:', error)
                    })
                })
                .catch((error) => {
                  console.error('Error adding new record:', error)
                })
            })
            .catch((error) => {
              console.error('Error opening cursor:', error)
            })
        }
      }
    })
  }
}

const DB = new DatabaseManager()

export { DB, type DatabaseManager }
