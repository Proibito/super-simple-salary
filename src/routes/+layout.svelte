<script lang="ts">
  import '../app.css'
  // import { pwaInfo } from 'virtual:pwa-info'
  import { onMount, setContext } from 'svelte'
  import { AppBar } from '@skeletonlabs/skeleton'
  import IconAccessibility from '~icons/solar/hamburger-menu-outline'
  import { currentUser, daysOBS } from '$lib/store.svelte'
  import { setDefaultOptions } from 'date-fns'
  import { it } from 'date-fns/locale'
  import Menu from '$lib/components/Menu.svelte'
  import type { User } from '../sharedTypes'
  import { goto } from '$app/navigation'
  import { getAuth, signOut } from 'firebase/auth'
  import Portal from '$lib/components/Portal.svelte'
  import AddWorkedDay from '$lib/components/AddWorkedDay.svelte'
  import { migrateDB } from '$lib/database'
  import { get } from 'svelte/store'
  import Navigation from '$lib/GUI/Navigation.svelte'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  let visibleAdd = $state(false)

  let loaded: boolean = $state(false)
  let user: User | null = $state(null)
  currentUser.subscribe((us) => (user = us))

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



  async function migrate() {
    const user = get(currentUser)

    if (user) await migrateDB(user.id)
  }
</script>

<!-- <svelte:head>
  {@html webManifest}
  <title>Super simple Salary</title>
</svelte:head> -->

{#if !loaded}
  <h1>Caricamento in corso...</h1>
{:else}
  <Navigation>
    <!-- <button onclick={migrate}>Migrate</button> -->
    <!-- <AppBar
      gridColumns="grid-cols-3"
      slotDefault="place-self-center"
      slotTrail="place-content-end"
      class="dark:bg-slate-950 dark:text-white"
    >
      {#snippet lead()}
        <button onclick={() => (openMenu = !openMenu)}>
          <IconAccessibility />
        </button>
      {/snippet}
      Benvenuto {user?.firstName}
      {#snippet trail()}
        <button class="btn-suc btn" onclick={() => (visibleAdd = true)}>
          Aggiungi
        </button>

        <button onclick={logOut}>Logout</button>
      {/snippet}
    </AppBar> -->

    {@render children?.()}
  </Navigation>
{/if}

{#if visibleAdd}
  <Portal target="body">
    <div class="bg-slate-300 dark:bg-slate-950">
      <AddWorkedDay></AddWorkedDay>
    </div>
  </Portal>
{/if}
