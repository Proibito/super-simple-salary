<script lang="ts">
  import '../app.css'
  import { pwaInfo } from 'virtual:pwa-info'
  import { onMount, setContext } from 'svelte'
  import { AppBar } from '@skeletonlabs/skeleton'
  import IconAccessibility from '~icons/solar/hamburger-menu-outline'
  import { daysOBS } from '../lib/store'
  import { setDefaultOptions } from 'date-fns'
  import { it } from 'date-fns/locale'
  import Portal from './Portal.svelte'
  import Aggiungi from './aggiungi.svelte'
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  let visibleAdd = $state(false)
  let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '')
  let loaded: boolean = $state(false)
  let showPortal: boolean = $state(false)

  type menuItem = { label: string; link: string }
  const links: menuItem[] = [
    { label: 'home', link: 'home' },
    { label: 'storico', link: 'storico' },
    { label: 'statistiche', link: 'statistiche' },
    { label: 'Payment History', link: 'PaymentHistory' }
  ]

  function toggleAggiungi() {
    visibleAdd = !visibleAdd
  }

  setDefaultOptions({ locale: it })
  setContext('vision', { toggleAggiungi })

  onMount(async () => {
    const DB = (await import('$lib/database')).DB
    DB.startDatabase().then(() => (loaded = true))
    daysOBS.set([])
    const giorniLavorati = await DB.getWorkedDays(true)
    if (giorniLavorati && giorniLavorati.length > 0) {
      daysOBS.update((giorniEsistenti) => {
        return [...giorniEsistenti, ...giorniLavorati]
      })
    }
  })
</script>

<svelte:head>
  {@html webManifest}
  <title>Super simple Salary</title>
</svelte:head>

{#if !loaded}
  <h1>Caricamento in corso...</h1>
{:else}
  {#if visibleAdd}
    <Aggiungi />
  {/if}

  <AppBar
    gridColumns="grid-cols-3"
    slotDefault="place-self-center"
    slotTrail="place-content-end"
    class="dark:bg-slate-950 dark:text-white"
  >
    {#snippet lead()}
      
        <button onclick={() => (showPortal = !showPortal)}>
          <IconAccessibility />
        </button>
      
      {/snippet}
    Stipendio
    {#snippet trail()}
      
        <button class="btn-suc btn" onclick={() => (visibleAdd = true)}
          >Aggiungi</button
        >
      
      {/snippet}
  </AppBar>
  <main class="m-auto px-2 lg:w-1/2">
    {@render children?.()}
  </main>
{/if}

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
  <ReloadPrompt />
{/await}

<!-- Portal stuff for menu -->
{#if showPortal}
  <Portal>
    <div
      class="min-h-[50%] w-[90%] rounded bg-white p-5 dark:bg-slate-950 dark:text-white"
    >
      <button onclick={() => (showPortal = false)}>Chiudi</button>

      <div class="mt-5 flex flex-col gap-2">
        <hr />
        {#each links as single}
          <a
            href={`./${single.link == 'home' ? '' : single.link}`}
            class="font-bold"
            onclick={() => (showPortal = false)}>{single.label}</a
          >
          <hr />
        {/each}
      </div>
    </div>
  </Portal>
{/if}
