<script lang="ts">
  import { onMount } from 'svelte'
  import SummaryDays from './summaryDays.svelte'
  import { format } from 'date-fns'
  import { DB } from '$lib/database'
  import AddWorkedDay from '$lib/components/AddWorkedDay.svelte'
  import WorkShifts from '$lib/components/WorkShifts.svelte'

  let totalWageMonth = $state(0)

  onMount(async () => {
    update()
  })

  async function update() {
    totalWageMonth = await DB.getTotalCompensationOfMouth(new Date())
  }

  DB._workedDays.subscribe(async () => {
    update()
  })
</script>

<div class="m-auto lg:w-1/2">
  <p class="my-5 text-xl">
    Il tuo stipendio di {format(new Date(), 'MMMM')} fino ad ora: <br />€
    {totalWageMonth} 🤑
  </p>
  <hr />

  <WorkShifts></WorkShifts>
  <!-- <SummaryDays /> -->
</div>
