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

    await DB.addWorkedDay(
      {
        giorno: parseGiorno,
        fasce_orarie: fasceOrarie,
        viaggio,
        yourCar
      },
      giorno
    );

    // daysOBS.update((giorno) => {
    //   return [
    //     ...giorno,
    //     {
    //       giorno: parseGiorno,
    //       fasce_orarie: fasceOrarie,
    //       viaggio,
    //       yourCar
    //     }
    //   ];
    // });
    toggleAggiungi();
  }
</script>

<div class="z-50 fixed bg-white w-full h-full overflow-y-auto flex items-center">
  <form
    on:submit|preventDefault={salvaGiornoLavorato}
    class="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg"
  >
    <button
      class="font-bold py-2 px-3 text-sm rounded-md shadow-md border mb-5"
      on:click={toggleAggiungi}>chiudi</button
    >
    <div class="mb-4">
      <label for="giorno" class="block text-gray-700 text-sm font-bold mb-2">Giorno:</label>
      <input
        type="date"
        bind:value={giorno}
        id="giorno"
        class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>

    <!-- add radio viaggio -->
    <div class="mb-4">
      <label for="viaggio" class="block text-gray-700 text-sm font-bold mb-2">Viaggio:</label>
      <input
        type="checkbox"
        bind:checked={viaggio}
        id="viaggio"
        class="shadow border rounded py-2 px-5 w-5 h-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <!-- add radio viaggio -->
      <div class="mb-4">
        <label for="yourCar" class="block text-gray-700 text-sm font-bold mb-2"
          >Con la tua macchina:</label
        >
        <input
          type="checkbox"
          bind:checked={yourCar}
          id="yourcar"
          class="shadow border rounded py-2 px-5 w-5 h-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />

        {#each fasceOrarie as fascia, index}
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div>
              <label for={`inizio-${index}`} class="block text-gray-700 text-sm font-bold mb-2"
                >Inizio:</label
              >
              <input
                type="time"
                bind:value={fascia.inizio}
                id={`inizio-${index}`}
                step="900"
                class="shadow w-full block border rounded py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label for={`fine-${index}`} class="block text-gray-700 text-sm font-bold mb-2"
                >Fine:</label
              >
              <input
                type="time"
                bind:value={fascia.fine}
                id={`fine-${index}`}
                class="shadow w-full block border rounded py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                step="900"
                required
              />
            </div>
            {#if index > 0}
              <div class="flex items-end justify-center">
                <button
                  on:click={() => rimuoviFasciaOraria(index)}
                  class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Aggiungi Fascia Oraria
          </button>
          <button
            type="submit"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Salva Giorno Lavorato
          </button>
        </div>
      </div>
    </div>
  </form>
</div>
