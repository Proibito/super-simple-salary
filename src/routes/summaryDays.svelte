<script lang="ts">
  import { format, getMonth } from 'date-fns'
  import {
    calculateTotalHours,
    calculateDailyEarnings
  } from '$lib/utils/timeTrackingUtils'
  import type { WorkedDay } from '../types'
  import { DB } from '$lib/database'

  let workedDays: WorkedDay[] = $state([])
  DB._workedDays.subscribe(async () => {
    workedDays = (await DB.getWorkedDays()) ?? []
    workedDays.sort((a, b) => b.date.getTime() - a.date.getTime())
  })

  let editandoIndex = $state(-1)
  let editDate = $state(-1)
  let giornoPerFasce = $state(-1)

  function modificaFasciaOraria(index: number, giorno: number) {
    editandoIndex = index
    giornoPerFasce = giorno
  }

  function modificaData(index: number) {
    editDate = index
  }

  async function deleteWorkedDay(workedDay: WorkedDay) {
    await DB.deleteWorkedDay(workedDay)
    workedDays = (await DB.getWorkedDays()) ?? []
  }

  async function salvaModifiche(giorno: WorkedDay) {
    if (typeof giorno.date === 'string') giorno.date = new Date(giorno.date)

    DB.addWorkedDay(giorno)

    // Logica per salvare le modifiche...
    editandoIndex = -1
    editDate = -1
    giornoPerFasce = -1
  }
</script>

<div class="">
  <p>se devi modificare le fasce orarie o la data schiacciaci sopra!</p>
  {#each workedDays as giorno, idx}
    {#if !workedDays[idx - 1] || getMonth(workedDays[idx - 1].date) != getMonth(workedDays[idx].date)}
      <div class="mb-2 mt-6 p-2">
        <span class="text-xl font-medium">{format(giorno.date, 'MMMM yy')}</span
        >
        <hr />
      </div>
    {/if}

    <div
      class="mb-4 flex bg-white p-4 shadow-md dark:border dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    >
      <div class="">
        <div class="flex items-center justify-between rounded-lg">
          <div>
            {#if idx !== editDate}
              <span
                class="block text-sm font-medium text-gray-700 dark:text-white"
                onclick={() => modificaData(idx)}
                role="button"
                tabindex="0"
                aria-pressed="true"
                onkeypress={() => {}}>{format(giorno.date, 'iiii d/M/y')}</span
              >
            {:else}
              <div class="mb-4">
                <label
                  for="giorno"
                  class="mb-2 block text-sm font-bold text-gray-700"
                  >Giorno:</label
                >
                <input
                  type="date"
                  bind:value={giorno.date}
                  id="giorno"
                  class="focus:shadow-outline rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                />
              </div>
              <button
                class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                onclick={() => salvaModifiche(giorno)}
              >
                Salva
              </button>
            {/if}

            <span
              class="block text-sm font-light text-gray-500 dark:text-gray-300"
              >ore lavorate: {calculateTotalHours(giorno.timeSlots)}</span
            >
            <span
              class="block text-sm font-light text-gray-500 dark:text-gray-300"
              onclick={() => {
                giorno.travel = !giorno.travel
                salvaModifiche(giorno)
              }}
              onkeypress={() => (giorno.travel = !giorno.travel)}
              role="button"
              tabindex="0"
              aria-pressed={giorno.travel ? 'true' : 'false'}
              >viaggio: {giorno.travel ? 'si' : 'no'}</span
            >

            <span
              class="block text-sm font-light text-gray-500 dark:text-gray-300"
              onclick={() => {
                giorno.carUsage = !giorno.carUsage
                salvaModifiche(giorno)
              }}
              onkeypress={() => (giorno.carUsage = !giorno.carUsage)}
              role="button"
              tabindex="0"
              aria-pressed={giorno.carUsage ? 'true' : 'false'}
              >Con la tua macchina: {giorno.carUsage ? 'si' : 'no'}</span
            >
          </div>
        </div>

        {#each giorno.timeSlots as fascia, index}
          <div class="flex items-center justify-between">
            {#if editandoIndex !== index || giornoPerFasce !== idx}
              <button onclick={() => modificaFasciaOraria(index, idx)}>
                {fascia.start} - {fascia.end}
              </button>
            {:else}
              <!-- Visualizza come input per la modifica -->
              <div class="block gap-2">
                <input
                  type="time"
                  class="focus:shadow-outline rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none
                  "
                  bind:value={fascia.start}
                />
                <input
                  type="time"
                  class="focus:shadow-outline rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  bind:value={fascia.end}
                />
                <button
                  class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                  onclick={() => salvaModifiche(giorno)}
                >
                  Salva
                </button>
                <button
                  class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                  onclick={() => {
                    giorno.timeSlots.splice(index)
                    salvaModifiche(giorno)
                  }}
                >
                  Elimina
                </button>
              </div>
            {/if}
          </div>
        {/each}

        <button
          onclick={() => deleteWorkedDay(giorno)}
          class="focus:shadow-outline mt-2 rounded bg-red-500 px-5 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
        >
          Elimina
        </button>
      </div>

      <div class="ml-auto flex items-stretch text-right">
        <div class="flex flex-col text-green-500">
          <span>Paga base: € {calculateTotalHours(giorno.timeSlots) * 10}</span>
          {#if giorno.travel}
            <span>+ viaggio: € 20</span>
          {/if}
          {#if giorno.carUsage}
            <span>+ macchina: € 40</span>
          {/if}
          <div class="mt-auto text-xl font-bold">
            <span>Totale</span>
            <span>
              € {calculateDailyEarnings(giorno)}
            </span>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
