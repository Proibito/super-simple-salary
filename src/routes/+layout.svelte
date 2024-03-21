<script lang="ts">
  import '../app.css';
  import { pwaInfo } from 'virtual:pwa-info';
  import { onMount, setContext } from 'svelte';
  import { AppBar } from '@skeletonlabs/skeleton';
  import IconAccessibility from '~icons/solar/hamburger-menu-outline';
  import { daysOBS } from '../lib/store';
  import { setDefaultOptions } from 'date-fns';
  import { it } from 'date-fns/locale';
  import Portal from './Portal.svelte';
  import Aggiungi from './aggiungi.svelte';

  let visibleAdd = false;
  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
  let loaded: boolean = false;
  let showPortal: boolean = false;
  const links = ['home', 'storico', 'statistiche'];

  function toggleAggiungi() {
    visibleAdd = !visibleAdd;
  }

  setDefaultOptions({ locale: it });
  setContext('vision', { toggleAggiungi });

  onMount(async () => {
    const DB = (await import('$lib/database')).DB;
    DB.startDatabase().then(() => (loaded = true));

    const giorniLavorati = await DB.getWorkedDays(true);
    if (giorniLavorati && giorniLavorati.length > 0)
      daysOBS.update((giorniEsistenti) => {
        return [...giorniEsistenti, ...giorniLavorati];
      });
  });
</script>

<svelte:head>
  {@html webManifest}
</svelte:head>

{#if !loaded}
  <h1>Caricamento in corso...</h1>
{:else}
  {#if visibleAdd}
    <Aggiungi />
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
        class="rounded-md bg-green-700 px-3 py-2 text-sm font-bold text-white shadow-md"
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
    <div class="min-h-[50%] w-[90%] rounded bg-white">
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
