import { differenceInMinutes, getMonth, setHours, setMinutes } from 'date-fns';
import type { fascia_oraria, workedDay } from '../types';

export function calcolaOre(fasce: workedDay['fasce_orarie']): number {
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

export function getHoursOfMonth(days: workedDay[], month: number): number {
  let tot: number = 0;
  days.forEach((day) => {
    if (getMonth(day.giorno) == month) {
      tot += calcolaOre(day.fasce_orarie);
    }
  });
  return tot;
}

export function getDayWorkedMonth(days: workedDay[], month: number): number {
  let tot: number = 0;
  days.forEach((day) => {
    if (getMonth(day.giorno) == month) {
      tot += 1;
    }
  });
  return tot;
}

export function getDayWithTravel(days: workedDay[], month: number): number {
  let tot: number = 0;
  days.forEach((day) => {
    if (getMonth(day.giorno) == month && day.viaggio) {
      tot += 1;
    }
  });
  return tot;
}

/**
 * @deprecated  do not utilize
 *  */
export function calcolaGuadagnoMensile(days: workedDay[], month: number): number {
  const oreLavorate = getHoursOfMonth(days, month);
  const pagaTotale = oreLavorate * 10;

  const giorniDiViaggio = getDayWithTravel(days, month);
  const extraViaggio = giorniDiViaggio * 10;

  return pagaTotale + extraViaggio;
}

export function sumToCompensation(days: workedDay[]): number {
  let totalWorked = 0;
  let travelTotal = 0;
  let yourCar = 0;
  for (const day of days) {
    travelTotal += day.viaggio ? 2 : 0;
    totalWorked += calcolaOre(day.fasce_orarie);
    yourCar += day.yourCar ? 40 : 0;
  }

  return (totalWorked + travelTotal) * 10 + yourCar;
}

export function calcolaYourCar(days: workedDay[], month: number): number {
  let tot: number = 0;
  days.forEach((day) => {
    if (getMonth(day.giorno) == month && day.yourCar) {
      tot += 1;
    }
  });
  return tot;
}

export function calculateEarningDat(giorno: workedDay): number {
  return (
    calcolaOre(giorno.fasce_orarie) * 10 + (giorno.viaggio ? 2 * 10 : 0) + (giorno.yourCar ? 40 : 0)
  );
}
