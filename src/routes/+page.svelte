<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { daysOBS } from './store';
  import SummaryDays from './summaryDays.svelte';
  import { initializeDB } from '../inizializzaDb';
  import { calcolaOre } from './helper';

  let salaryH = 0;
  let pagaOraria = 0;
  let aggiuntivo = 0;
  let oreViaggio = 0;
  const OBS = daysOBS.subscribe((value) => {
    salaryH = 0;
    aggiuntivo = value.length;

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
    Il tuo stipendio fino ad ora: <br />€ {salaryH * pagaOraria +
      aggiuntivo * oreViaggio * pagaOraria} 🤑
  </p>
  <hr />

  <SummaryDays />
</div>
