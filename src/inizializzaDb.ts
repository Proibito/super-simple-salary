// database.ts
import { format } from 'date-fns';
import { daysOBS } from '$lib/store';
import type { MyDB, workedDay } from './types';
import { ResponseType, sendResponse } from '$lib/logger';
import { error } from '@sveltejs/kit';
import type { IDBPDatabase } from 'idb';

let db: IDBPDatabase<MyDB>;
export type DB = IDBPDatabase<MyDB>;

export async function eliminaRecord(day: workedDay): Promise<object> {
  if (!db) {
    return sendResponse(ResponseType.ERROR, 'Database not loaded');
  }

  const key = format(day.giorno, 'yyyy-MM-dd');

  try {
    const record = await db.get('giorni_lavorati', key);

    if (record) {
      await db.delete('giorni_lavorati', key);

      daysOBS.update((old) => {
        return old.filter((item) => item.giorno !== day.giorno);
      });

      return sendResponse(ResponseType.SUCCESS);
    } else {
      return { esito: 1, errore: 'Record non trovato' };
    }
  } catch (errore) {
    return sendResponse(ResponseType.ERROR, error);
  }
}

export async function updateRecord(day: workedDay): Promise<object> {
  if (!db) {
    return { esito: 1, errore: 'database non caricato' };
  }

  await db.put('giorni_lavorati', day, format(day.giorno, 'yyyy-MM-dd'));

  daysOBS.update((old) => {
    return old.map((item) => {
      if (item.giorno === day.giorno) {
        return day;
      } else return item;
    });
  });
  return {};
}

export async function ottieniDateASC(): Promise<workedDay[]> {
  if (!db) return [];

  const transaction = db.transaction('giorni_lavorati', 'readonly');
  const store = transaction.objectStore('giorni_lavorati');
  const index = store.index('giorno');

  const giorniLavorati = [];
  let cursor = await index.openCursor(null, 'prev');

  while (cursor) {
    giorniLavorati.push(cursor.value);
    cursor = await cursor.continue();
  }

  await transaction.done;

  return giorniLavorati;
}
