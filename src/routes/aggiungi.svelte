<script lang="ts">
  import { getContext } from 'svelte';
  // import { daysOBS } from '../lib/store';
  import { format } from 'date-fns';
  import { DB } from '$lib/database';

  const { toggleAggiungi } = getContext<{ toggleAggiungi: () => void }>('vision');
  let giorno = format(new Date(), 'yyyy-MM-dd');
  let viaggio = false;
  let yourCar = false;
  let fasceOrarie = [{ inizio: '', fine: '' }];

  // Funzione per aggiungere una nuova fascia oraria
  function aggiungiFasciaOraria() {
    fasceOrarie = [...fasceOrarie, { inizio: '', fine: '' }];
  }

  // Funzione per rimuovere una fascia oraria
  function rimuoviFasciaOraria(index: number) {
    fasceOrarie = fasceOrarie.filter((_, i) => i !== index);
  }

  // Funzione per salvare il giorno lavorativo nel DB
  async function salvaGiornoLavorato() {
    const parseGiorno = new Date(giorno); // todo da cambiare
    console.log(parseGiorno);

    await DB.addWorkedDay({
      giorno: parseGiorno,
      fasce_orarie: fasceOrarie,
      viaggio,
      yourCar
    });

    toggleAggiungi();
  }
</script>

<div class="fixed z-50 flex h-full w-full items-center overflow-y-auto bg-white">
  <form
    on:submit|preventDefault={salvaGiornoLavorato}
    class="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-md"
  >
    <button
      class="mb-5 rounded-md border px-3 py-2 text-sm font-bold shadow-md"
      on:click={toggleAggiungi}>chiudi</button
    >
    <div class="mb-4">
      <label for="giorno" class="mb-2 block text-sm font-bold text-gray-700">Giorno:</label>
      <input
        type="date"
        bind:value={giorno}
        id="giorno"
        class="focus:shadow-outline rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
      />
    </div>

    <!-- add radio viaggio -->
    <div class="mb-4">
      <label for="viaggio" class="mb-2 block text-sm font-bold text-gray-700">Viaggio:</label>
      <input
        type="checkbox"
        bind:checked={viaggio}
        id="viaggio"
        class="focus:shadow-outline h-5 w-5 rounded border px-5 py-2 leading-tight text-gray-700 shadow focus:outline-none"
      />

      <!-- add radio viaggio -->
      <div class="mb-4">
        <label for="yourCar" class="mb-2 block text-sm font-bold text-gray-700"
          >Con la tua macchina:</label
        >
        <input
          type="checkbox"
          bind:checked={yourCar}
          id="yourcar"
          class="focus:shadow-outline h-5 w-5 rounded border px-5 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        />

        {#each fasceOrarie as fascia, index}
          <div class="mb-4 grid grid-cols-3 gap-2">
            <div>
              <label for={`inizio-${index}`} class="mb-2 block text-sm font-bold text-gray-700"
                >Inizio:</label
              >
              <input
                type="time"
                bind:value={fascia.inizio}
                id={`inizio-${index}`}
                step="900"
                class="focus:shadow-outline block w-full rounded border py-2 leading-tight text-gray-700 shadow focus:outline-none"
                required
              />
            </div>
            <div>
              <label for={`fine-${index}`} class="mb-2 block text-sm font-bold text-gray-700"
                >Fine:</label
              >
              <input
                type="time"
                bind:value={fascia.fine}
                id={`fine-${index}`}
                class="focus:shadow-outline block w-full rounded border py-2 leading-tight text-gray-700 shadow focus:outline-none"
                step="900"
                required
              />
            </div>
            {#if index > 0}
              <div class="flex items-end justify-center">
                <button
                  on:click={() => rimuoviFasciaOraria(index)}
                  class="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                  >Rimuovi</button
                >
              </div>
            {/if}
          </div>
        {/each}

        <div class="flex items-center justify-between">
          <button
            on:click={() => aggiungiFasciaOraria()}
            type="button"
            class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            Aggiungi Fascia Oraria
          </button>
          <button
            type="submit"
            class="focus:shadow-outline rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none"
          >
            Salva Giorno Lavorato
          </button>
        </div>
      </div>
    </div>
  </form>
</div>
