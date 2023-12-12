<script lang="ts">
  import { onDestroy } from 'svelte';
  import { daysOBS } from '../lib/store';
  import { format } from 'date-fns';
  import { calcolaOre, calculateEarningDat } from '../lib/helper';
  import { type WORKEDDAY, eliminaRecord, updateRecord } from '../inizializzaDb';

  let giorniLavorati: WORKEDDAY[] = [];

  const obs = daysOBS.subscribe((value) => {
    giorniLavorati = value;
  });

  onDestroy(obs);

  let editandoIndex = -1;
  let editDate = -1;
  let giornoPerFasce = -1;

  function modificaFasciaOraria(index: number, giorno: number) {
    editandoIndex = index;
    giornoPerFasce = giorno;
  }

  function modificaData(index: number) {
    editDate = index;
  }

  async function salvaModifiche(giorno: WORKEDDAY) {
    if (typeof giorno.giorno === 'string') giorno.giorno = new Date(giorno.giorno);

    await updateRecord(giorno);

    // Logica per salvare le modifiche...
    editandoIndex = -1; // Resetta l'indice dopo il salvataggio
    editDate = -1;
    giornoPerFasce = -1;
  }
</script>

<div>
  <p>se devi modificare le fasce orarie o la data schiacciaci sopra!</p>
  {#each giorniLavorati as giorno, idx}
    <div class=" bg-white shadow-md mb-4 p-4">
      <div class="flex justify-between items-center rounded-lg">
        <!-- Sezione Sinistra: Data e Ore lavorate -->
        <div>
          {#if idx !== editDate}
            <span
              class="block text-sm font-medium text-gray-700"
              on:click={() => modificaData(idx)}
              role="button"
              tabindex="0"
              aria-pressed="true"
              on:click={() => modificaData(idx)}
              on:keypress={() => {
                console.log('sium');
              }}>{format(giorno.giorno, 'iiii d/M/y')}</span
            >
          {:else}
            <div class="mb-4">
              <label for="giorno" class="block text-gray-700 text-sm font-bold mb-2">Giorno:</label>
              <input
                type="date"
                bind:value={giorno.giorno}
                id="giorno"
                class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              on:click={() => salvaModifiche(giorno)}
            >
              Salva
            </button>
          {/if}

          <span class="block text-sm font-light text-gray-500"
            >ore lavorate: {calcolaOre(giorno.fasce_orarie)}</span
          >
          <span
            class="block text-sm font-light text-gray-500"
            on:click={() => {
              giorno.viaggio = !giorno.viaggio;
              salvaModifiche(giorno);
            }}
            on:keypress={() => (giorno.viaggio = !giorno.viaggio)}
            role="button"
            tabindex="0"
            aria-pressed={giorno.viaggio ? 'true' : 'false'}
            >viaggio: {giorno.viaggio ? 'si' : 'no'}</span
          >
        </div>

        <div class="text-right flex items-center">
          <span class="text-lg font-bold text-green-500 mr-4">€ {calculateEarningDat(giorno)}</span>
        </div>
      </div>
      {#each giorno.fasce_orarie as fascia, index}
        <div class="flex justify-between items-center">
          {#if editandoIndex !== index || giornoPerFasce !== idx}
            <!-- Visualizza come testo -->

            <button on:click={() => modificaFasciaOraria(index, idx)}>
              {fascia.inizio} - {fascia.fine}
            </button>
          {:else}
            <!-- Visualizza come input per la modifica -->
            <div class="block gap-2">
              <input
                type="time"
                class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                bind:value={fascia.inizio}
              />
              <input
                type="time"
                class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                bind:value={fascia.fine}
              />
              <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                on:click={() => salvaModifiche(giorno)}
              >
                Salva
              </button>
              <button
                class="bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                on:click={() => {
                  giorno.fasce_orarie.splice(index);
                  salvaModifiche(giorno);
                }}
              >
                Elimina
              </button>
            </div>
          {/if}
        </div>
      {/each}

      <button
        on:click={() => eliminaRecord(giorno)}
        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-5 mt-2 rounded focus:outline-none focus:shadow-outline"
      >
        Elimina
      </button>
    </div>
  {/each}
</div>
