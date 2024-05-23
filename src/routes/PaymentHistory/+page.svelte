<script lang="ts">
  import { DB } from '$lib/database';
  import { format, parse } from 'date-fns';
  import { onMount } from 'svelte';

  let guadagniMensili: Map<string, number> = new Map();
  let totaleWageMap: Map<string, { totalWage: number }> = new Map();

  async function calcolaGuadagniMensili() {
    guadagniMensili = new Map<string, number>();
    for (const wage of (await DB.getWorkedDays()) ?? []) {
      const data = format(wage.date, 'yyyy-MM');
      if (guadagniMensili.get(data)) continue;
      const payment = await DB.getSinglePaymentHistory(data);
      guadagniMensili.set(data, payment?.payment || 0);
    }

    guadagniMensili = guadagniMensili;
  }

  async function totalMonthWage() {
    totaleWageMap = new Map<string, { totalWage: number }>();
    for (const wage of (await DB.getWorkedDays()) ?? []) {
      const data = format(wage.date, 'yyyy-MM');
      if (totaleWageMap.get(data)) continue;
      totaleWageMap.set(data, {
        totalWage: await DB.getTotalCompensationOfMouth(wage.date)
      });
    }

    totaleWageMap = totaleWageMap;
  }

  onMount(async () => {
    await totalMonthWage();
    await calcolaGuadagniMensili();
  });

  async function updateWage(el: Event, data: string) {
    const inputElement = el.target as HTMLInputElement;
    const value = parseInt(inputElement.value) || 0;

    await DB.updatePaymentHistory(data, value);

    guadagniMensili.set(data, value);
    guadagniMensili = guadagniMensili;
  }
</script>

<div class="m-auto my-2 flex flex-col gap-5 lg:w-1/3">
  {#each guadagniMensili.entries() as [k, v]}
    <div class="flex flex-col gap-2 rounded border p-3">
      <div>
        <p class="text-xl font-bold">Mese: {format(parse(k, 'yyyy-MM', new Date()), 'MMMM')}</p>
        {#if totaleWageMap.get(k)}
          <span>Rimanenti: € {totaleWageMap.get(k).totalWage - v}</span>
        {/if}
      </div>
      <hr />
      <div>
        <span>Ti hanno già dato:</span>
        <div class="flex items-center gap-2 align-middle">
          <span>€</span>
          <input
            type="number"
            on:keyup={(event) => updateWage(event, k)}
            value={v}
            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  {/each}
</div>
