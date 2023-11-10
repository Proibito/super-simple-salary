<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import { onMount, setContext } from 'svelte';
  import Init from './init.svelte';
  import type { IDBPDatabase } from 'idb';
  import '../app.css';
  import { AppBar } from '@skeletonlabs/skeleton';
  import IconAccessibility from '~icons/solar/hamburger-menu-outline';
  import Aggiungi from './aggiungi.svelte';
  import { initializeDB, type DB, type MyDB } from '../inizializzaDb';
  import { count } from './store';
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
    const giorniLavorati = await db.getAll('giorni_lavorati');
    count.update((giorniEsistenti) => {
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
      <button on:click={() => (visibleAdd = true)}>aggiungi</button>
    </svelte:fragment>
  </AppBar>
  <main class="px-2">
    <slot />
  </main>
{/if}

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
  <ReloadPrompt />
{/await}
