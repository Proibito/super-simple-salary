<script lang="ts">
  import { db } from '$lib/firebase.svelte'
  import {
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    updateDoc,
    doc
  } from 'firebase/firestore'
  import { WorkedHoursStatus, WorkLocations } from '../../../types'
  import type { WorkShift } from '../../../types'
  import { format } from 'date-fns'

  const {
    location,
    date
  }: { location: keyof typeof WorkLocations; date: Timestamp } = $props()

  let editingWorkShift: string | null = null

  async function loadTempworkshifts(): Promise<WorkShift[]> {
    const workShiftsRef = collection(db, 'workShifts')

    const startOfDay = date.toDate()
    startOfDay.setHours(0, 0, 0, 0)

    const startOfNextDay = date.toDate()
    startOfNextDay.setDate(startOfNextDay.getDate() + 1)
    startOfNextDay.setHours(0, 0, 0, 0)

    const q = query(
      workShiftsRef,
      where('locationId', '==', location),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<', Timestamp.fromDate(startOfNextDay)),
      where('status', '==', WorkedHoursStatus.DRAFT)
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    })) as WorkShift[]
  }

  async function handleConfirm(
    workshift: WorkShift,
    status: WorkedHoursStatus
  ) {
    const docRef = doc(db, 'workShifts', workshift.id)

    await updateDoc(docRef, {
      status
    })
  }

  function timestampToTimeString(timestamp: Timestamp): string {
    return format(timestamp.toDate(), 'HH:mm')
  }

  function timeStringToTimestamp(timeStr: string, baseDate: Date): Timestamp {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date(baseDate)
    date.setHours(hours, minutes, 0, 0)
    return Timestamp.fromDate(date)
  }

  async function updateTimeRange(
    workshift: WorkShift,
    rangeIndex: number,
    newStart: string,
    newEnd: string
  ) {
    try {
      const baseDate = workshift.date.toDate()
      const updatedTimeRanges = [...workshift.timeRanges]
      updatedTimeRanges[rangeIndex] = {
        ...updatedTimeRanges[rangeIndex],
        start: timeStringToTimestamp(newStart, baseDate),
        end: timeStringToTimestamp(newEnd, baseDate)
      }

      // Calcola il nuovo totale delle ore
      const totalHours = updatedTimeRanges.reduce((total, range) => {
        const startTime = range.start.toDate()
        const endTime = range.end.toDate()
        const hours =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        return total + hours
      }, 0)

      const workshiftRef = doc(db, 'workShifts', workshift.id)
      await updateDoc(workshiftRef, {
        timeRanges: updatedTimeRanges,
        totalHours,
        updatedAt: Timestamp.now()
      })

      editingWorkShift = null
    } catch (error) {
      console.error("Errore nell'aggiornamento degli orari:", error)
    }
  }
</script>

{#await loadTempworkshifts() then shifts}
  <div class="space-y-2">
    {#if shifts.length === 0}
      <div class="text-center text-sm text-gray-500">Nessun turno trovato</div>
    {:else}
      <div class="grid gap-2">
        {#each shifts as workshift (workshift.id)}
          <div class="rounded bg-white p-3 shadow-sm">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 space-y-1">
                <!-- Time Ranges in una riga -->
                <div class="flex flex-wrap gap-2">
                  {#each workshift.timeRanges as timeRange, index (index)}
                    <div class="flex items-center text-sm">
                      {#if editingWorkShift === `${workshift.id}-${index}`}
                        <div class="flex items-center space-x-1">
                          <input
                            type="time"
                            value={timestampToTimeString(timeRange.start)}
                            class="h-6 w-24 rounded border px-1 text-sm"
                            onchange={(e) => {
                              updateTimeRange(
                                workshift,
                                index,
                                e.currentTarget.value,
                                timestampToTimeString(timeRange.end)
                              )
                            }}
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={timestampToTimeString(timeRange.end)}
                            class="h-6 w-24 rounded border px-1 text-sm"
                            onchange={(e) => {
                              updateTimeRange(
                                workshift,
                                index,
                                timestampToTimeString(timeRange.start),
                                e.currentTarget.value
                              )
                            }}
                          />
                          <button
                            class="ml-1 text-gray-400 hover:text-gray-600"
                            onclick={() => (editingWorkShift = null)}
                          >
                            ✓
                          </button>
                        </div>
                      {:else}
                        <span>
                          {timestampToTimeString(
                            timeRange.start
                          )}-{timestampToTimeString(timeRange.end)}
                        </span>
                        <button
                          class="ml-1 text-gray-400 hover:text-gray-600"
                          onclick={() =>
                            (editingWorkShift = `${workshift.id}-${index}`)}
                        >
                          ✎
                        </button>
                      {/if}
                    </div>
                  {/each}
                </div>
                <!-- Info aggiuntive in una riga -->
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span>{workshift.totalHours}h</span>
                  {#if workshift.travel}
                    <span>
                      Trasferta {workshift.usePersonalCar
                        ? '(Auto personale)'
                        : '(Auto az.)'}
                    </span>
                  {/if}
                </div>
              </div>
              <button
                onclick={() =>
                  handleConfirm(workshift, WorkedHoursStatus.VALIDATED)}
                class="rounded bg-green-50 px-3 py-1 text-sm text-green-600 hover:bg-green-100"
              >
                Conferma
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/await}
