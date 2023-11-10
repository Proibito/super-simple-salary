<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import { onMount, setContext } from 'svelte';
  import Init from './init.svelte';
  import type { IDBPDatabase } from 'idb';
  import '../app.css';
  import { AppBar } from '@skeletonlabs/skeleton';
  import IconAccessibility from '~icons/solar/hamburger-menu-outline';
  import Aggiungi from './aggiungi.svelte';
  import { type DB, type MyDB, initializeDB, ottieniDateASC } from '../inizializzaDb';
  import { daysOBS } from './store';
  import { setDefaultOptions } from 'date-fns';
  import it from 'date-fns/locale/it/index.js';

  setDefaultOptions({ locale: it });
  setContext('vision', { toggleAggiungi });
  setContext('db', {
    db: (): DB => db
  });

  function toggleAggiungi() {
    visibleAdd = !visibleAdd;
  }

  let visibleAdd = false;
  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
  let esiste: boolean = true;
  let db: IDBPDatabase<MyDB>;

  onMount(async () => {
    db = await initializeDB();
    esiste = (await db.get('paga_base', 'main')) != undefined;
    const giorniLavorati = await ottieniDateASC();

    daysOBS.update((giorniEsistenti) => {
      // Assumi che `giorniLavorati` sia un array di giorni lavorati che vuoi aggiungere
      return [...giorniEsistenti, ...giorniLavorati];
    });
  });
</script>

<svelte:head>
  {@html webManifest}
</svelte:head>

{#if !esiste}
  <Init bind:salvato={esiste} />
{:else}
  {#if visibleAdd}
    <Aggiungi {db} />
  {/if}

  <AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
    <svelte:fragment slot="lead">
      <IconAccessibility />
    </svelte:fragment>
    Stipendio
    <svelte:fragment slot="trail">
      <button
        class="font-bold bg-green-700 text-white py-2 px-3 text-sm rounded-md shadow-md"
        on:click={() => (visibleAdd = true)}>aggiungi</button
      >
    </svelte:fragment>
  </AppBar>
  <main class="px-2">
    <slot />
  </main>
{/if}

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
  <ReloadPrompt />
{/await}

<span class="fixed bottom-0 w-full text-center text-xs bg-white z-[999]">
  Fatto con il ❤️ da <span class="font-bold">Edoardo Balzano</span>
</span>
