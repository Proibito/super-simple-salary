<script lang="ts">
  import '../app.css';
  import { pwaInfo } from 'virtual:pwa-info';
  import { onMount, setContext } from 'svelte';
  import Init from './init.svelte';
  import type { IDBPDatabase } from 'idb';
  import { AppBar } from '@skeletonlabs/skeleton';
  import IconAccessibility from '~icons/solar/hamburger-menu-outline';
  import { type DB, type MyDB, initializeDB, ottieniDateASC } from '../inizializzaDb';
  import { daysOBS } from '../lib/store';
  import { setDefaultOptions } from 'date-fns';
  import it from 'date-fns/locale/it/index.js';
  import Portal from './Portal.svelte';
  import Aggiungi from './aggiungi.svelte';

  let visibleAdd = false;
  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
  let esiste: boolean = true;
  let db: IDBPDatabase<MyDB>;
  let showPortal: boolean = false;
  const links = ['home', 'storico', 'statistiche'];

  function toggleAggiungi() {
    visibleAdd = !visibleAdd;
  }

  setDefaultOptions({ locale: it });
  setContext('vision', { toggleAggiungi });
  setContext('db', {
    db: (): DB => db
  });

  onMount(async () => {
    db = await initializeDB();
    esiste = (await db.get('paga_base', 'main')) != undefined;
    const giorniLavorati = await ottieniDateASC();
    if (giorniLavorati.length > 0)
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
      <button on:click={() => (showPortal = !showPortal)}>
        <IconAccessibility />
      </button>
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

<!-- Portal stuff for menu -->
{#if showPortal}
  <Portal>
    <div class="bg-white w-[90%] min-h-[50%] rounded">
      <button on:click={() => (showPortal = false)}>Chiudi</button>

      <div class="flex flex-col">
        {#each links as link}
          <a
            href={`./${link == 'home' ? '' : link}`}
            class="font-bold underline"
            on:click={() => (showPortal = false)}>{link}</a
          >
        {/each}
      </div>
    </div>
  </Portal>
{/if}
