// database.ts
import { format } from 'date-fns';
import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import { daysOBS } from '$lib/store';


export interface WORKEDDAY {
  giorno: Date;
  fasce_orarie: fascia_oraria[];
  viaggio: boolean;
};

export interface fascia_oraria {
  inizio: string;
  fine: string;
}

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
  db = await openDB<MyDB>('MyDB', 2, {
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

      // Aggiunta per aggiornare i record esistenti
      if (old < 2) { // Verifica se stai facendo l'upgrade dalla versione 1 alla 2
        const giorniLavoratiStore = transition.objectStore('giorni_lavorati');

        giorniLavoratiStore.openCursor().then(cursor => {
          if (!cursor) return;
          do {
            const record = cursor.value;
            // Aggiungi la nuova proprietà viaggio con valore true
            record.viaggio = true;
            cursor.update(record);
          } while (cursor.continue());
        });
      }
    },
  });
  return db;
};

export async function eliminaRecord(day: WORKEDDAY): Promise<object> {
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

      daysOBS.update((old) => {
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


export async function updateRecord(day: WORKEDDAY): Promise<object> {
  if (!db) {
    return { esito: 1, errore: "database non caricato" };
  }

  await db.put('giorni_lavorati', day, format(day.giorno, "yyyy-MM-dd"));

  daysOBS.update((old) => {
    // remove record with the same date;
    return old.map((item) => {
      if (item.giorno === day.giorno) {
        return day;
      } else return item
    })
  })
  return {};
}


export async function ottieniDateASC(): Promise<WORKEDDAY[]> {
  if (!db) return []

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