<script lang="ts">
  import { db } from '$lib/firebase.svelte'
  import { currentUser } from '$lib/store.svelte'
  import { format, getMonth } from 'date-fns'
  import {
    Timestamp,
    arrayRemove,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
  } from 'firebase/firestore'
  import { onDestroy } from 'svelte'
  import {
    WorkedHoursStatus,
    type TimeRange,
    type WorkShift
  } from '../../types'
  import { deleteWorkShift } from '$lib/workShifts'

  let workShifts: WorkShift[] = $state([])
  let editingTimeRange = { index: -1, shiftId: '' }
  let editingDate = ''
  let totalHours = $state(0)

  let userId: string | null = null
  let unsubscribeStore = currentUser.subscribe(async (user) => {
    if (!user) return

    userId = user.id

    if (user.workShifts) {
      const workShiftsData = await Promise.all(
        user.workShifts.map((workShiftRef) => getDoc(workShiftRef))
      )

      workShifts = workShiftsData
        .map((doc) => {
          const format = doc.data() as WorkShift
          format.totalHours = calculateTotalHours(format.timeRanges)
          return format
        })
        .sort((a, b) => {
          return b.date.seconds - a.date.seconds
        })
    }
  })

  // Cleanup on component destroy
  onDestroy(() => {
    unsubscribeStore()
  })

  function calculateTotalHours(timeRanges: TimeRange[]): number {
    return timeRanges.reduce((total, range) => {
      const startDate = range.start.toDate()
      const endDate = range.end.toDate()
      const diffInHours =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      return total + diffInHours
    }, 0)
  }

  function calculateDailyEarnings(workShift: WorkShift): string {
    let total = workShift.totalHours ? workShift.totalHours * 10 : 0
    if (workShift.travel) total += 20
    if (workShift.usePersonalCar) total += 40
    return total.toFixed(2)
  }

  async function delWorkShift(shift: WorkShift) {
    await deleteWorkShift(shift)
  }

  async function updateWorkShift(shiftId: string, updates: Partial<WorkShift>) {
    if (userId) console.log(updates)

    await updateDoc(doc(db, 'users', userId, 'workshifts', shiftId), {
      ...updates,
      updatedAt: Timestamp.now()
    })
    editingTimeRange = { index: -1, shiftId: '' }
    editingDate = ''
  }

  function getStatusColor(status: WorkShift['status']): string {
    switch (status) {
      case 'DRAFT':
        return 'text-yellow-500'
      case 'VALIDATED':
        return 'text-green-500'
      case 'COMPLETED':
        return 'text-blue-500'
      case 'REJECTED':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }
</script>

<div class="p-4">
  {#each workShifts as shift, idx}
    {#if idx === 0 || getMonth(workShifts[idx - 1].date.toDate()) !== getMonth(shift.date.toDate())}
      <div class="mb-2 mt-6 p-2">
        <span class="text-xl font-medium">
          {format(shift.date.toDate(), 'MMMM yy')}
        </span>
        <hr class="mt-2" />
      </div>
    {/if}

    <div
      class="mb-4 flex bg-white p-4 shadow-md dark:border dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div>
            {#if editingDate === shift.id}
              <div class="mb-4">
                <span class="mb-2 block text-sm font-bold">Data:</span>
                <input
                  type="date"
                  value={format(shift.date.toDate(), 'yyyy-MM-dd')}
                  onchange={(e) => {
                    const newDate = new Date(e.currentTarget.value)
                    updateWorkShift(shift.id, {
                      date: Timestamp.fromDate(newDate)
                    })
                  }}
                  class="rounded border px-3 py-2 text-gray-700"
                />
              </div>
            {:else}
              <button
                class="block text-sm font-medium"
                onclick={() => (editingDate = shift.id)}
              >
                {format(shift.date.toDate(), 'EEEE d/M/y')}
              </button>
            {/if}

            <span class="text-sm {getStatusColor(shift.status)}">
              Status: {shift.status}
            </span>

            <span class="mt-1 block text-sm text-gray-500">
              Ore lavorate: {shift.totalHours.toFixed(2)}
            </span>

            <span class="mt-1 block text-sm text-gray-500">
              Luogo di lavoro: {shift.locationId}
            </span>

            <button
              class="mt-1 block text-sm text-gray-500"
              onclick={() =>
                updateWorkShift(shift.id, { travel: !shift.travel })}
            >
              Viaggio: {shift.travel ? 'Si' : 'No'}
            </button>

            <button
              class="mt-1 block text-sm text-gray-500"
              onclick={() =>
                updateWorkShift(shift.id, {
                  usePersonalCar: !shift.usePersonalCar
                })}
            >
              Auto personale: {shift.usePersonalCar ? 'Si' : 'No'}
            </button>
          </div>
        </div>

        {#each shift.timeRanges as range}
          <div class="">
            <span class="text-sm text-gray-700 dark:text-gray-400">
              {format(range.start.toDate(), 'HH:mm')} - {format(
                range.end.toDate(),
                'HH:mm'
              )}
            </span>
          </div>
        {/each}

        {#if shift.status != WorkedHoursStatus.VALIDATED}
          <button
            onclick={() => delWorkShift(shift)}
            class="mt-4 rounded bg-red-500 px-4 py-2 text-white"
          >
            Elimina
          </button>
        {/if}
      </div>

      <div class="ml-auto text-right">
        <div class="flex flex-col text-green-500">
          <span>Paga base: € {(shift.totalHours * 10).toFixed(2)}</span>
          {#if shift.travel}
            <span>+ viaggio: € 20</span>
          {/if}
          {#if shift.usePersonalCar}
            <span>+ auto: € 40</span>
          {/if}
          <div class="mt-auto text-xl font-bold">
            <span>Totale</span>
            <span> € {calculateDailyEarnings(shift)}</span>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
