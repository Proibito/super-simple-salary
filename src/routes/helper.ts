import { differenceInMinutes, getMonth, setHours, setMinutes } from 'date-fns';
import type { WORKEDDAY, fascia_oraria } from '../inizializzaDb';

export function calcolaOre(fasce: WORKEDDAY['fasce_orarie']): number {
  let tot = 0;
  fasce.forEach((fascia) => {
    tot += calcolaOreSingolo(fascia) / 60;
  });
  return tot;
}

function calcolaOreSingolo(fascia: fascia_oraria): number {
  const [oraInizio, minutiInizio] = fascia.inizio.split(':').map(Number);
  const [oraFine, minutiFine] = fascia.fine.split(':').map(Number);

  let dataInizio = new Date();
  dataInizio = setHours(dataInizio, oraInizio);
  dataInizio = setMinutes(dataInizio, minutiInizio);

  let dataFine = new Date();
  dataFine = setHours(dataFine, oraFine);
  dataFine = setMinutes(dataFine, minutiFine);

  if (dataFine < dataInizio) {
    dataFine.setDate(dataFine.getDate() + 1);
  }

  return differenceInMinutes(dataFine, dataInizio);
}

export function getHoursOfMonth(days: WORKEDDAY[], month: number): number {
  let tot: number = 0;
  days.forEach((day) => {
    if (getMonth(day.giorno) == month) {
      tot += calcolaOre(day.fasce_orarie);
    }
  });
  return tot;
}

export function getDayWorkedMonth(days: WORKEDDAY[], month: number): number {
  let tot: number = 0;
  days.forEach((day) => {
    if (getMonth(day.giorno) == month) {
      tot += 1;
    }
  });
  return tot;
}

export function ottieniMesiLavorati(fasce: WORKEDDAY['fasce_orarie']) {}
