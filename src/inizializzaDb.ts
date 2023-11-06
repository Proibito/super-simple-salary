// database.ts
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';


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
