<script lang="ts">
  import { db } from '$lib/firebase.svelte'
  import { currentUser } from '$lib/store.svelte'
  import { format } from 'date-fns'
  import {
    arrayUnion,
    doc,
    DocumentReference,
    Timestamp,
    writeBatch
  } from 'firebase/firestore'
  import { getContext } from 'svelte'
  import { get } from 'svelte/store'
  import { WorkLocations, type WorkShift } from '../../types'
  import { addWorkingShift, WorkShiftFactory } from '$lib/workShifts'

  const { toggleAggiungi } = getContext<{ toggleAggiungi: () => void }>(
    'vision'
  )

  // Stati
  let date = $state(format(new Date(), 'yyyy-MM-dd'))
  let selectedLocationId = $state('')
  let usePersonalCar = $state(false)
  let timeSlots = $state([{ start: '', end: '', notes: '' }])

  function addTimeSlot() {
    timeSlots = [...timeSlots, { start: '', end: '', notes: '' }]
  }

  function removeTimeSlot(index: number) {
    timeSlots = timeSlots.filter((_, i) => i !== index)
  }

  async function saveWorkShift(e: Event) {
    e.preventDefault()
    const user = get(currentUser)
    if (!user) throw Error('User not logged')

    const workShiftId = crypto.randomUUID()

    const workShiftData: WorkShift = WorkShiftFactory.create({
      id: workShiftId,
      date: Timestamp.fromDate(new Date(date)),
      userId: user.id,
      locationId: selectedLocationId,
      usePersonalCar,
      timeRanges: timeSlots.map((slot) => ({
        start: Timestamp.fromDate(new Date(`${date}T${slot.start}`)),
        end: Timestamp.fromDate(new Date(`${date}T${slot.end}`)),
        notes: slot.notes
      }))
    })

    await addWorkingShift(workShiftData)
  }
</script>

<div class="z-50 flex h-full w-full items-center overflow-y-auto">
  <form
    onsubmit={saveWorkShift}
    class="mx-auto max-w-lg rounded-lg p-6 shadow-md"
  >
    <button
      type="button"
      class="mb-5 rounded-md border px-3 py-2 text-sm font-bold shadow-md"
      onclick={toggleAggiungi}
    >
      chiudi
    </button>

    <div class="mb-4">
      <label
        for="date"
        class="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-100"
      >
        Giorno:
      </label>
      <input
        type="date"
        bind:value={date}
        id="date"
        class="focus:shadow-outline w-full rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        required
      />
    </div>

    <div class="mb-4">
      <label
        for="location"
        class="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-100"
      >
        Luogo:
      </label>
      <select
        bind:value={selectedLocationId}
        id="location"
        class="focus:shadow-outline w-full rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        required
      >
        {#each Object.values(WorkLocations) as loc}
          <option value={loc}>{loc}</option>
        {/each}
      </select>
    </div>

    {#if selectedLocationId == WorkLocations.BAROLO}
      <div class="mb-4">
        <label
          class="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-100"
        >
          <input
            type="checkbox"
            bind:checked={usePersonalCar}
            class="mr-2 h-5 w-5 rounded border shadow"
          />
          Con la tua macchina
        </label>
      </div>
    {/if}

    {#each timeSlots as slot, index}
      <div class="mb-4 grid grid-cols-3 gap-2">
        <div>
          <label
            for={`start-${index}`}
            class="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-100"
          >
            Inizio:
          </label>
          <input
            type="time"
            bind:value={slot.start}
            id={`start-${index}`}
            class="focus:shadow-outline w-full rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            required
          />
        </div>
        <div>
          <label
            for={`end-${index}`}
            class="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-100"
          >
            Fine:
          </label>
          <input
            type="time"
            bind:value={slot.end}
            id={`end-${index}`}
            class="focus:shadow-outline w-full rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            required
          />
        </div>
        {#if index > 0}
          <div class="flex items-end">
            <button
              type="button"
              onclick={() => removeTimeSlot(index)}
              class="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
            >
              Rimuovi
            </button>
          </div>
        {/if}
      </div>
    {/each}

    <div class="flex items-center justify-between">
      <button
        type="button"
        onclick={addTimeSlot}
        class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Aggiungi Fascia Oraria
      </button>
      <button
        type="submit"
        class="focus:shadow-outline rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none"
      >
        Salva
      </button>
    </div>
  </form>
</div>
