<script lang="ts">
  import { format, getMonth } from 'date-fns';
  import { calcolaOre, calculateEarningDat } from '../lib/helper';
  import type { workedDay } from '../types';
  import { DB } from '$lib/database';

  let workedDays: workedDay[] = [];
  DB._workedDays.subscribe((value) => {
    workedDays = value;
    workedDays.sort((a, b) => b.giorno.getTime() - a.giorno.getTime());
  });

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

  async function deleteWorkedDay(workedDay: workedDay) {
    await DB.deleteWorkedDay(workedDay);
    workedDays = (await DB.getWorkedDays()) ?? [];
  }

  async function salvaModifiche(giorno: workedDay) {
    if (typeof giorno.giorno === 'string') giorno.giorno = new Date(giorno.giorno);

    DB.addWorkedDay(giorno);

    // Logica per salvare le modifiche...
    editandoIndex = -1; // Resetta l'indice dopo il salvataggio
    editDate = -1;
    giornoPerFasce = -1;
  }
</script>

<div>
  <p>se devi modificare le fasce orarie o la data schiacciaci sopra!</p>
  {#each workedDays as giorno, idx}
    {#if !workedDays[idx - 1] || getMonth(workedDays[idx - 1].giorno) != getMonth(workedDays[idx].giorno)}
      <div class="mb-2 mt-6 p-2">
        <span class="text-xl font-medium">{format(giorno.giorno, 'MMMM yy')}</span>
        <hr />
      </div>
    {/if}

    <div class=" mb-4 bg-white p-4 shadow-md">
      <div class="flex items-center justify-between rounded-lg">
        <div>
          {#if idx !== editDate}
            <span
              class="block text-sm font-medium text-gray-700"
              on:click={() => modificaData(idx)}
              role="button"
              tabindex="0"
              aria-pressed="true"
              on:click={() => modificaData(idx)}
              on:keypress={() => {}}>{format(giorno.giorno, 'iiii d/M/y')}</span
            >
          {:else}
            <div class="mb-4">
              <label for="giorno" class="mb-2 block text-sm font-bold text-gray-700">Giorno:</label>
              <input
                type="date"
                bind:value={giorno.giorno}
                id="giorno"
                class="focus:shadow-outline rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              />
            </div>
            <button
              class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
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

          <span
            class="block text-sm font-light text-gray-500"
            on:click={() => {
              giorno.yourCar = !giorno.yourCar;
              salvaModifiche(giorno);
            }}
            on:keypress={() => (giorno.yourCar = !giorno.yourCar)}
            role="button"
            tabindex="0"
            aria-pressed={giorno.yourCar ? 'true' : 'false'}
            >Con la tua macchina: {giorno.yourCar ? 'si' : 'no'}</span
          >
        </div>

        <div class="flex items-center text-right">
          <span class="mr-4 text-lg font-bold text-green-500">€ {calculateEarningDat(giorno)}</span>
        </div>
      </div>
      {#each giorno.fasce_orarie as fascia, index}
        <div class="flex items-center justify-between">
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
                class="focus:shadow-outline rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                bind:value={fascia.inizio}
              />
              <input
                type="time"
                class="focus:shadow-outline rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                bind:value={fascia.fine}
              />
              <button
                class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                on:click={() => salvaModifiche(giorno)}
              >
                Salva
              </button>
              <button
                class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
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
        on:click={() => deleteWorkedDay(giorno)}
        class="focus:shadow-outline mt-2 rounded bg-red-500 px-5 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
      >
        Elimina
      </button>
    </div>
  {/each}
</div>
