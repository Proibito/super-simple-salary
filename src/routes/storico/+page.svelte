<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { WORKEDDAY } from '../../inizializzaDb';
  import { calcolaGuadagnoMensile, calcolaYourCar } from '../../lib/helper';
  import { daysOBS } from '../../lib/store';

  let guadagniMensili: { mese: number; guadagno: number; yourCar: number }[] = [];

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
        guadagno: calcolaGuadagnoMensile(giorni, mese),
        yourCar: calcolaYourCar(giorni, mese)
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
    <li class="flex justify-between items-center max-w-xl m-auto">
      <span class="w-[calculated-width]">
        Mese: {guadagnoMensile.mese}, Guadagno: €{guadagnoMensile.guadagno} + viaggi € {40 *
          guadagnoMensile.yourCar} =
      </span>
      <span class="tabular-nums">
        💶 {guadagnoMensile.guadagno + 40 * guadagnoMensile.yourCar}
      </span>
    </li>
  {/each}
</ul>
