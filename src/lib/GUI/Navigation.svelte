<script lang="ts">
  import { currentUser } from '$lib/store.svelte'
  import Icon from '@iconify/svelte'
  import type { User } from '../../sharedTypes'
  import { get } from 'svelte/store'
  import { getAuth, signOut } from 'firebase/auth'
  import { goto } from '$app/navigation'

  let isSidebarOpen = $state(true)

  let user = $state<User | null>(null)

  let isMenuVisible = $state(false)

  $effect(() => {
    user = $currentUser
  })

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen
  }

  let { children } = $props()

  const Menu = [
    { icon: 'material-symbols:home-outline', link: '/', label: 'Home' },
    {
      icon: 'material-symbols:person-add',
      link: '/addWorker',
      label: 'Aggiungi dipendente'
    },
    { icon: 'mdi:events', link: '/events', label: 'Eventi' },
  ]

  const TopMenu = [
    { icon: 'material-symbols:settings', link: 'settings' },
    { icon: 'mdi:bell', link: 'settings' }
  ]

  async function logOut() {
    const auth = getAuth()
    await signOut(auth)
    currentUser.set(null)
    goto('/login')
  }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
  <!-- Header -->
  <header
    class="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="flex h-full items-center justify-between px-4">
      <!-- Left side -->
      <div class="flex items-center space-x-4">
        <button
          class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          onclick={toggleSidebar}
          aria-label="menu"
        >
          <Icon icon="material-symbols:menu-rounded" width="25" />
        </button>
        <div class="text-xl font-semibold text-gray-800 dark:text-white">
          Gourmet
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        {#each TopMenu as menuitem}
          <button
            class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="temp"
          >
            <Icon icon={menuitem.icon} height="24" />
          </button>
        {/each}
        <!-- Profile -->
        <div>
          <button
            class="block h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600"
            onclick={() => (isMenuVisible = !isMenuVisible)}
            aria-label="menu-profile"
          ></button>
          <div
            class={`absolute right-4 top-14 flex w-56 flex-col border dark:border-gray-700 dark:bg-gray-900 ${isMenuVisible ? 'visible' : 'hidden'}`}
          >
            <div class="flex flex-col border-b p-3 py-5">
              <span class="font-bold">{user?.firstName} {user?.lastName}</span>
            </div>

            <div class="flex flex-col border-b p-2 py-5">
              <span>Impostazioni utente</span>
            </div>

            <div class="flex flex-col p-2">
              <button onclick={logOut}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Sidebar and Main Content -->
  <div class="flex h-screen pt-16">
    <!-- Sidebar -->
    <aside
      class={`fixed left-0 top-16 h-full border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full'} overflow-auto`}
    >
      <nav class="space-y-2 p-4">
        {#each Menu as menuitem}
          <a
            href={menuitem.link}
            class="flex items-center space-x-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Icon icon={menuitem.icon} height="24" />
            <span>{menuitem.label}</span>
          </a>
        {/each}
      </nav>
    </aside>

    <!-- Main Content -->
    <main
      class={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}
    >
      <div class="mx-auto max-w-7xl">
        {@render children()}
      </div>
    </main>
  </div>
</div>
