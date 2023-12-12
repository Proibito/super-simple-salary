<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { WORKEDDAY } from '../../inizializzaDb';
  import { calcolaGuadagnoMensile } from '../../lib/helper';
  import { daysOBS } from '../../lib/store';

  let guadagniMensili: { mese: number; guadagno: number }[] = [];

  let giorni: WORKEDDAY[] = [];

  // Reactive statement to update giorni whenever daysOBS changes
  $: if ($daysOBS) {
    giorni = $daysOBS;
    calcolaGuadagniMensili();
  }

  function calcolaGuadagniMensili() {
    guadagniMensili = [];
    for (let mese = 0; mese < 12; mese++) {
      guadagniMensili.push({
        mese: mese,
        guadagno: calcolaGuadagnoMensile(giorni, mese)
      });
    }
  }

  // Initial calculation on mount
  onMount(() => {
    calcolaGuadagniMensili();
  });

</script>
<ul>
  {#each guadagniMensili as guadagnoMensile}
    <li>Mese: {guadagnoMensile.mese}, Guadagno: € {guadagnoMensile.guadagno}</li>
  {/each}
</ul>
