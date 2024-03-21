import { writable } from 'svelte/store';
import { openDB, type IDBPDatabase } from 'idb';
import type { MyDB, fascia_oraria, workedDay } from '../types';
import { ErrorResponse, SuccessResponse } from './logger';
import { addDays, differenceInHours, parse, format } from 'date-fns';

class DatabaseManager {
  private dbPromise!: Promise<IDBPDatabase<MyDB>>;

  _workedDays = writable<workedDay[]>([]);
  constructor() {}

  async startDatabase() {
    this.dbPromise = this.initializeDB();
  }

  private async initializeDB(): Promise<IDBPDatabase<MyDB>> {
    return openDB<MyDB>('MyDB', 2, {
      upgrade(db, old, newVersion, transition) {
        if (!db.objectStoreNames.contains('giorni_lavorati')) {
          const giorniLavoratiStore = db.createObjectStore('giorni_lavorati');
          giorniLavoratiStore.createIndex('giorno', 'giorno');
        }
        if (!db.objectStoreNames.contains('paga_base')) {
          db.createObjectStore('paga_base');
          transition.objectStore('paga_base').put(10, 'main');
        }
        if (!db.objectStoreNames.contains('viaggio')) {
          db.createObjectStore('viaggio');
          transition.objectStore('viaggio').put(2, 'main');
        }

        if (old < 2) {
          const giorniLavoratiStore = transition.objectStore('giorni_lavorati');

          giorniLavoratiStore.openCursor().then((cursor) => {
            if (!cursor) return;
            do {
              const record = cursor.value;
              record.viaggio = true;
              cursor.update(record);
            } while (cursor.continue());
          });
        }
      }
    });
  }

  async addWorkedDay(workedDay: workedDay) {
    const db = await this.dbPromise;

    if (!db) {
      new ErrorResponse('No database loaded you should call startDatabase() first');
      return;
    }
    try {
      const tx = db.transaction('giorni_lavorati', 'readwrite');
      const store = tx.objectStore('giorni_lavorati');
      const key = format(workedDay.giorno, 'yyyy-MM-dd');
      await store.put(workedDay, key);
      new SuccessResponse(`Successfully added ${workedDay} with key ${key}`);
      await tx.done;
      this._workedDays.update((val) => {
        val.push(workedDay);
        return val;
      });
    } catch (error) {
      new ErrorResponse(error);
    }
  }

  async getWorkedDays(asc?: boolean) {
    const DB = await this.dbPromise;
    if (!DB) {
      return;
    }
    const workedDay = await DB.getAll('giorni_lavorati');

    const sortedResult = workedDay.sort((a, b) =>
      asc ? a.giorno.getTime() - b.giorno.getTime() : b.giorno.getTime() - a.giorno.getTime()
    );

    this._workedDays.set(sortedResult);
    return sortedResult;
  }

  getBaseWage() {
    return 10;
  }

  async getHoursWorkedMonth(month: Date) {
    const db = await this.dbPromise;
    const tx = db.transaction('giorni_lavorati', 'readonly');
    const store = tx.objectStore('giorni_lavorati');
    const index = store.index('giorno');

    // Get first and last day
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    // Utilizza IDBKeyRange per definire il range di ricerca basato su date
    const range = IDBKeyRange.bound(firstDayOfMonth, lastDayOfMonth);

    let totalWorked = 0;
    const allDaysWorked = await index.getAll(range);
    for (const day of allDaysWorked) {
      for (const timeSlot of day.fasce_orarie) {
        totalWorked += this.calculateTimeSlot(timeSlot);
      }
    }
    return totalWorked;
  }

  async deleteWorkedDay(workedDay: workedDay) {
    const db = await this.dbPromise;
    const tx = db.transaction('giorni_lavorati', 'readwrite');
    const store = tx.objectStore('giorni_lavorati');
    await store.delete(format(workedDay.giorno, 'yyyy-MM-dd'));
    await tx.done;
    // this.workedDays.update(workedDay);
  }

  calculateTimeSlot(timeSlot: fascia_oraria): number {
    const startDate = new Date();
    const startTime = parse(timeSlot.inizio, 'HH:mm', startDate);
    const endTime = parse(timeSlot.fine, 'HH:mm', startDate);

    const hoursWorked = differenceInHours(endTime, startTime);
    if (hoursWorked < 0) {
      const endTime = parse(timeSlot.fine, 'HH:mm', addDays(startDate, 1));
      return differenceInHours(endTime, startTime);
    }
    return hoursWorked;
  }

  async getWorkWithTravelOfMouth(month: Date) {
    const db = await this.dbPromise;
    const tx = db.transaction('giorni_lavorati', 'readonly');
    const store = tx.objectStore('giorni_lavorati');
    const index = store.index('giorno');

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    const range = IDBKeyRange.bound(firstDayOfMonth, lastDayOfMonth);

    let totalTravel = 0;
    const allDaysWorked = await index.getAll(range);
    for (const day of allDaysWorked) {
      totalTravel += day.viaggio ? 1 : 0;
    }
    return totalTravel;
  }

  async getTotalCompensationOfMouth(month: Date) {
    const hourlyWage = DB.getBaseWage();
    const totalHoursWorked = await DB.getHoursWorkedMonth(month);
    const travelTotal = await DB.getWorkWithTravelOfMouth(month);
    return totalHoursWorked * hourlyWage + travelTotal * 20;
  }
}

const DB = new DatabaseManager();

export { DB, type DatabaseManager };
