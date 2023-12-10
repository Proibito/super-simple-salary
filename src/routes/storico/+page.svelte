<script lang="ts">
    import { onDestroy } from 'svelte';
  import type { WORKEDDAY } from '../../inizializzaDb';
  import { calcolaGuadagnoMensile, calcolaOre } from '../helper';
  import { daysOBS } from '../store';

  let giorni: WORKEDDAY[] = [];
  const OBS = daysOBS.subscribe((value) => {
    giorni = value;
  });

  onDestroy(() => {
    OBS();
  });

  let guadagniMensili: { mese: number; guadagno: number }[] = [];

  // Calcola il guadagno per ogni mese
  for (let mese = 0; mese < 12; mese++) {
    guadagniMensili.push({
      mese: mese + 1,
      guadagno: calcolaGuadagnoMensile(giorni, mese)
    });
  }
</script>

<ul>
  {#each guadagniMensili as guadagnoMensile}
    <li>Mese: {guadagnoMensile.mese}, Guadagno: € {guadagnoMensile.guadagno}</li>
  {/each}
</ul>
