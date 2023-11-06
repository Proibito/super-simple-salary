<script lang="ts">
  import { initializeDB, type DB } from '../inizializzaDb';
  import { getContext } from 'svelte';
  import moment from 'moment';
  import { count } from './store';

  const { toggleAggiungi } = getContext<{ toggleAggiungi: any }>('vision');

  const aggiorna = getContext('update');

  export let db: DB;
  let giorno = moment().format('YYYY-MM-DD');
  let fasceOrarie = [{ inizio: '', fine: '' }];

  // Funzione per aggiungere una nuova fascia oraria
  function aggiungiFasciaOraria() {
    fasceOrarie = [...fasceOrarie, { inizio: '', fine: '' }];
  }

  // Funzione per rimuovere una fascia oraria
  function rimuoviFasciaOraria(index: any) {
    fasceOrarie = fasceOrarie.filter((_, i) => i !== index);
  }

  // Funzione per salvare il giorno lavorativo nel DB
  async function salvaGiornoLavorato() {
    if (!db) {
      db = await initializeDB();
    }

    const parseGiorno = moment(giorno).toDate();

    await db.put(
      'giorni_lavorati',
      {
        giorno: parseGiorno,
        fasce_orarie: fasceOrarie
      },
      giorno
    );
    console.log('Giorno lavorativo salvato!');
    count.update((giorno) => {
      return [
        ...giorno,
        {
          giorno: parseGiorno,
          fasce_orarie: fasceOrarie
        }
      ];
    });
    toggleAggiungi();
  }
</script>

<div class="z-50 fixed bg-white w-full h-full overflow-y-auto">
  <button on:click={toggleAggiungi}>chiudi</button>
  <form
    on:submit|preventDefault={salvaGiornoLavorato}
    class="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg"
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
            class="shadow border rounded py-2 px-7 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            class="shadow border rounded py-2 px-7 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        on:click={aggiungiFasciaOraria}
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
  </form>
</div>

<style>
  /* Aggiungi qui eventuali stili specifici */
</style>
