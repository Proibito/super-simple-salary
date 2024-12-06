<script lang="ts">
  import { db } from '$lib/firebase.svelte'
  import { doc, getDoc } from 'firebase/firestore'
  import type { PageData } from './$types'
  import WorkshitsEvent from '$lib/components/event/WorkshitsEvent.svelte'
  import type { Event } from '../../../types'
  const { data }: { data: PageData } = $props()

  async function loadEvent(eventId: string): Promise<Event> {
    const docRef = doc(db, 'events', eventId)
    const dataRef = await getDoc(docRef)
    if (dataRef.exists()) {
      return dataRef.data() as Event
    } else {
      throw new Error('non esiste questo evento')
    }
  }
</script>

{#await loadEvent(data.eventId)}
  <span>Caricamento</span>
{:then event}
  <WorkshitsEvent date={event.date} location={event.location}></WorkshitsEvent>
{/await}
