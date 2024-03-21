<script lang="ts">
  import { onMount } from 'svelte';
  import SummaryDays from './summaryDays.svelte';
  import { format } from 'date-fns';
  import { DB } from '$lib/database';

  let totalWageMonth = 0;

  onMount(async () => {
    update();
  });

  async function update() {
    totalWageMonth = await DB.getTotalCompensationOfMouth(new Date());
  }

  DB._workedDays.subscribe(async () => {
    update();
  });
</script>

<div>
  <p class="my-5 text-xl">
    Il tuo stipendio di {format(new Date(), 'MMMM')} fino ad ora: <br />€
    {totalWageMonth} 🤑
  </p>
  <hr />

  <SummaryDays />
</div>
