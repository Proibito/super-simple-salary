<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { daysOBS } from './store';
  import SummaryDays from './summaryDays.svelte';
  import { initializeDB, type WORKEDDAY } from '../inizializzaDb';
  import { calcolaOre, getDayWithTravel, getDayWorkedMonth, getHoursOfMonth } from './helper';
  import { format, getMonth } from 'date-fns';

  let salaryH = 0;
  let pagaOraria = 0;
  let currMonth = getMonth(new Date());
  let oreViaggio = 0;
  let giorni: WORKEDDAY[] = [];
  const OBS = daysOBS.subscribe((value) => {
    salaryH = 0;
    giorni = value;
    value.forEach((giorno) => {
      salaryH += calcolaOre(giorno.fasce_orarie);
    });
  });

  onMount(async () => {
    const db = await initializeDB();
    pagaOraria = (await db.get('paga_base', 'main')) ?? 0;
    oreViaggio = (await db.get('viaggio', 'main')) ?? 0;
  });

  onDestroy(() => {
    OBS();
  });
</script>

<div>
  <p class="text-xl my-5">
    Il tuo stipendio di {format(new Date(), 'MMMM')} fino ad ora: <br />€
    {getHoursOfMonth(giorni, currMonth) * pagaOraria +
      getDayWithTravel(giorni, currMonth) * oreViaggio * pagaOraria} 🤑
  </p>
  <hr />

  <SummaryDays />
</div>
