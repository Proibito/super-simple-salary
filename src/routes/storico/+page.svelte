<script lang="ts">
  import { onMount } from 'svelte';
  import { parse, format } from 'date-fns';
  import { DB } from '$lib/database';

  let guadagniMensili: Map<string, { totalWage: number }> = $state(new Map());

  async function calcolaGuadagniMensili() {
    guadagniMensili = new Map<string, { totalWage: number }>();
    for (const wage of (await DB.getWorkedDays()) ?? []) {
      const data = format(wage.date, 'yyyy-MM');
      if (guadagniMensili.get(data)) continue;
      guadagniMensili.set(data, {
        totalWage: await DB.getTotalCompensationOfMouth(wage.date)
      });
    }
    console.log(guadagniMensili);

    guadagniMensili = guadagniMensili;
  }

  // Initial calculation on mount
  onMount(() => {
    calcolaGuadagniMensili();
  });
</script>

<ul>
  {#each guadagniMensili.entries() as [k, v]}
    <div class="m-5 flex flex-col rounded border bg-white p-5">
      <span class="text-bold text-xl">{format(parse(k, 'yyyy-MM', new Date()), 'MMMM')}</span>
      <span
        >Totale per questo mese:
        <span class="text-lg text-green-600">€ {v.totalWage}</span>
      </span>
    </div>
  {/each}
</ul>
