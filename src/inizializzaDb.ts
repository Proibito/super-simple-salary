// database.ts
import { format } from 'date-fns';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { count } from './routes/store';


export interface WORKEDDAY {
  giorno: Date;
  fasce_orarie: {
    inizio: string;
    fine: string;
  }[];
};

export interface MyDB extends DBSchema {
  giorni_lavorati: {
    value: WORKEDDAY
    key: string;
    indexes: { 'giorno': Date };
  };
  paga_base: {
    key: string;
    value: number;
  };
  viaggio: {
    key: string;
    value: number;
  };
}

let db: IDBPDatabase<MyDB>;
export type DB = IDBPDatabase<MyDB>;

export async function initializeDB(): Promise<IDBPDatabase<MyDB>> {
  db = await openDB<MyDB>('MyDB', 1, {
    upgrade(db, old, newVersion, transition) {
      // Create "giorni_lavorati" store with "giorno" index
      if (!db.objectStoreNames.contains('giorni_lavorati')) {
        const giorniLavoratiStore = db.createObjectStore('giorni_lavorati');
        giorniLavoratiStore.createIndex('giorno', 'giorno');
      }
      // Create other stores
      if (!db.objectStoreNames.contains('paga_base')) {
        db.createObjectStore('paga_base');
        transition.objectStore("paga_base").put(10, "main")
      }
      if (!db.objectStoreNames.contains('viaggio')) {
        db.createObjectStore('viaggio');
        transition.objectStore("viaggio").put(2, "main")
      }
    },
  });
  return db;
};

export async function eliminaRecord(day: WORKEDDAY): Promise<any> {
  if (!db) {
    return { esito: 1, errore: "database non caricato" };
  }

  // Formatta la chiave nel formato YYYY-MM-DD
  const key = format(day.giorno, "yyyy-MM-dd");

  try {
    // Cerca la chiave nello store 'giorni_lavorati'
    const record = await db.get('giorni_lavorati', key);

    // Se il record esiste, elimina il record
    if (record) {
      await db.delete('giorni_lavorati', key);

      count.update((old) => {
        // remove record with the same date;
        return old.filter((item) => item.giorno !== day.giorno)
      })

      return { esito: 0, messaggio: "Record eliminato con successo" };
    } else {
      return { esito: 1, errore: "Record non trovato" };
    }
  } catch (errore) {
    console.error('Errore nell\'eliminazione del record:', errore);
    return { esito: 1, errore: "Errore nell'eliminazione del record" };
  }
}


export async function updateRecord(day: WORKEDDAY): Promise<any> {
  if (!db) {
    return { esito: 1, errore: "database non caricato" };
  }

  await db.put('giorni_lavorati', day, format(day.giorno, "yyyy-MM-dd"));

  count.update((old) => {
    // remove record with the same date;
    return old.map((item) => {
      if (item.giorno === day.giorno) {
        return day;
      } else return item
    })
  })
}
