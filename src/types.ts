import type { DBSchema } from 'idb';

export interface workedDay {
  giorno: Date;
  fasce_orarie: fascia_oraria[];
  viaggio: boolean;
  yourCar: boolean;
}

export interface fascia_oraria {
  inizio: string;
  fine: string;
}

export interface PaymentHistory {
  month_year: string,
  payment: number
}


export interface MyDB extends DBSchema {
  giorni_lavorati: {
    value: workedDay;
    key: string;
    indexes: { giorno: Date };
  };
  paga_base: {
    key: string;
    value: number;
  };
  viaggio: {
    key: string;
    value: number;
  };
  MonthlyPayments: {
    key: string,
    value: PaymentHistory,
    indexes: { month_year: string }
  };
}
