<script lang="ts">
  import { onMount } from 'svelte';
  import { count } from './store';
  import SummaryDays from './summaryDays.svelte';
  import { initializeDB } from '../inizializzaDb';
  import { differenceInMinutes, setHours, setMinutes } from 'date-fns';
  import { calcolaOre } from './helper';

  let salaryH = 0;
  let pagaOraria = 0;
  let aggiuntivo = 0;
  let oreViaggio = 0;
  const sium = count.subscribe((value) => {
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
</script>

<div>
  <p class="text-xl my-5">
    Il tuo stipendio fino ad ora: <br />€ {salaryH * pagaOraria +
      aggiuntivo * oreViaggio * pagaOraria} 🤑
  </p>
  <hr />

  <SummaryDays />
</div>
