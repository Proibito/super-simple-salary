<script lang="ts">
  import { onMount } from 'svelte';
  import { count } from './store';
  import SummaryDays from './summaryDays.svelte';
  import { initializeDB } from '../inizializzaDb';
  import moment from 'moment';

  let salaryH    = 0;
  let pagaOraria = 0;
  let aggiuntivo = 0;
  let oreViaggio = 0;
  const sium = count.subscribe((value) => {
    salaryH = 0;
    aggiuntivo = value.length;
    
    value.forEach((giorno) => {
      giorno.fasce_orarie.forEach((fascia) => {
        let inizio = moment(fascia.inizio, 'HH:mm');
        let fine = moment(fascia.fine, 'HH:mm');

        // Se l'orario di inizio è dopo l'orario di fine, assumiamo che si tratti del giorno seguente
        if (inizio.isAfter(fine)) {
          fine.add(1, 'day');
        }

        // Calcola la differenza in ore, inclusi i decimali
        salaryH += fine.diff(inizio, 'hours', true);

      });
    });
  });

  onMount(async () => {
    const db = await initializeDB();
    pagaOraria = await db.get('paga_base', 'main') ?? 0;
    oreViaggio = await db.get("viaggio", "main") ?? 0;    
  });
</script>

<div>
  <p class="text-xl my-5">Il tuo stipendio fino ad ora: <br />€ {salaryH * pagaOraria + (aggiuntivo * oreViaggio * pagaOraria) } 🤑</p>
  <hr />

  <SummaryDays />
</div>
