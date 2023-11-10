import { differenceInMinutes, setHours, setMinutes } from "date-fns";
import type { WORKEDDAY } from "../inizializzaDb";

export function calcolaOre(fasce: WORKEDDAY["fasce_orarie"]): number {
    let tot = 0;
    fasce.forEach(fascia => {
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

        const differenzaMinuti = differenceInMinutes(dataFine, dataInizio);
        tot += differenzaMinuti / 60;
    })
    return tot;
}