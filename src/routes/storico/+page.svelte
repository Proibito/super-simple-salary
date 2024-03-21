<script lang="ts">
  import { onMount } from 'svelte';
  import { parse, format } from 'date-fns';
  import type { workedDay } from '../types';
  import { DB } from '$lib/database';

  let guadagniMensili: Map<string, { totalWage: number }> = new Map();

  async function calcolaGuadagniMensili() {
    guadagniMensili = new Map<string, { totalWage: number }>();
    for (const wage of (await DB.getWorkedDays()) ?? []) {
      const data = format(wage.giorno, 'yyyy-MM');
      if (guadagniMensili.get(data)) continue;
      guadagniMensili.set(data, {
        totalWage: await DB.getTotalCompensationOfMouth(wage.giorno)
      });
    }
    guadagniMensili = guadagniMensili;
  }

  // Initial calculation on mount
  onMount(() => {
    calcolaGuadagniMensili();
  });
</script>

<ul>
  {#each guadagniMensili.entries() as [k, v]}
    <div class="bg-white p-5 m-5 border rounded flex flex-col">
      <span class="text-bold text-xl">{format(parse(k, 'yyyy-MM', new Date()), 'MMMM')}</span>
      <span
        >Totale per questo mese:
        <span class="text-green-600 text-lg">€ {v.totalWage}</span>
      </span>
    </div>
  {/each}
</ul>
