<script lang="ts">
  import { collection, addDoc, getDocs } from 'firebase/firestore'
  import { WorkLocations } from '../../types'
  import { db } from '$lib/firebase.svelte'

  let title = ''
  let date = ''
  let location = WorkLocations.VILLA_SASSI
  let selectedEmployees: string[] = []
  let description = ''

  // State per gli utenti caricati da Firebase
  let employees: Array<{ id: string; name: string; email: string }> = []
  let loading = true
  let error = ''

  // Carica gli utenti da Firebase
  async function loadEmployees() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      employees = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { name: string; email: string })
      }))
      loading = false
    } catch (err) {
      error = 'Errore nel caricamento degli utenti'
      loading = false
      console.error('Errore:', err)
    }
  }

  // Carica gli utenti quando il componente viene montato
  $: {
    loadEmployees()
  }

  // Gestisce la selezione/deselezione dei dipendenti
  function toggleEmployee(employeeId: string) {
    if (selectedEmployees.includes(employeeId)) {
      selectedEmployees = selectedEmployees.filter((id) => id !== employeeId)
    } else {
      selectedEmployees = [...selectedEmployees, employeeId]
    }
  }

  // Gestisce l'invio del form
  async function handleSubmit() {
    if (!title || !date || !location || selectedEmployees.length === 0) {
      error = 'Per favore compila tutti i campi richiesti'
      return
    }

    try {
      const eventData = {
        title,
        date,
        location,
        employeeIds: selectedEmployees,
        description,
        createdAt: new Date()
      }

      await addDoc(collection(db, 'events'), eventData)

      // Reset del form
      title = ''
      date = ''
      location = WorkLocations.VILLA_SASSI
      selectedEmployees = []
      description = ''
      error = ''

      alert('Evento creato con successo!')
    } catch (err) {
      error = "Errore durante la creazione dell'evento"
      console.error('Errore:', err)
    }
  }
</script>

<div class="mx-auto max-w-2xl rounded-lg p-6 shadow-md">
  <h2 class="mb-6 text-2xl font-bold">Nuovo Evento</h2>

  {#if error}
    <div
      class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
    >
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Titolo -->
    <div>
      <label for="title" class="block text-sm font-medium">Titolo</label>
      <input
        type="text"
        id="title"
        bind:value={title}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>

    <!-- Data -->
    <div>
      <label for="date" class="block text-sm font-medium">Data</label>
      <input
        type="datetime-local"
        id="date"
        bind:value={date}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>

    <!-- Location -->
    <div>
      <label for="location" class="block text-sm font-medium">Location</label>
      <select
        id="location"
        bind:value={location}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-200"
        required
      >
        {#each Object.values(WorkLocations) as loc}
          <option value={loc}>{loc}</option>
        {/each}
      </select>
    </div>

    <!-- Dipendenti -->
    <div>
      <label class="mb-2 block text-sm font-medium">Dipendenti</label>
      {#if loading}
        <p>Caricamento dipendenti...</p>
      {:else}
        <div class="max-h-48 overflow-y-auto rounded-md border p-2">
          {#each employees as employee}
            <label class="flex items-center space-x-2 p-2 hover:bg-gray-50">
              <input
                type="checkbox"
                value={employee.id}
                checked={selectedEmployees.includes(employee.id)}
                on:change={() => toggleEmployee(employee.id)}
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{employee.name} ({employee.email})</span>
            </label>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Descrizione -->
    <div>
      <label for="description" class="block text-sm font-medium"
        >Descrizione (opzionale)</label
      >
      <textarea
        id="description"
        bind:value={description}
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      ></textarea>
    </div>

    <!-- Pulsante Submit -->
    <div class="pt-4">
      <button
        type="submit"
        class="w-full rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Crea Evento
      </button>
    </div>
  </form>
</div>
