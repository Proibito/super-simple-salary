<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { daysOBS } from '../lib/store';
  import SummaryDays from './summaryDays.svelte';
  import { initializeDB, type WORKEDDAY } from '../inizializzaDb';
  import { getDayWithTravel, getHoursOfMonth } from '../lib/helper';
  import { format, getMonth } from 'date-fns';

  let pagaOraria = 0;
  let currMonth = getMonth(new Date());
  let oreViaggio = 0;
  let giorni: WORKEDDAY[] = [];
  const OBS = daysOBS.subscribe((value) => {
    giorni = value;
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
