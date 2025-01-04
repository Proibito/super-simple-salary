<script lang="ts">
  import { db } from '$lib/firebase.svelte'
  import { collection, query, where, getDocs } from 'firebase/firestore'
  import type { User } from '../sharedTypes'
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte'

  let workers: User[] = $state([])
  let loading = $state(true)

  async function loadWorkers() {
    try {
      const q = query(collection(db, 'users'))

      const querySnapshot = await getDocs(q)
      workers = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
            lastLoginAt: doc.data().lastLoginAt?.toDate()
          }) as User
      )
    } catch (error) {
      console.error('Error loading workers:', error)
    } finally {
      loading = false
    }
  }

  onMount(loadWorkers)
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-2 text-2xl font-bold dark:text-white">Dipendenti Gourmet</h1>

  <div>
    <a
      href="/workers/addWorker"
      class="mb-6 inline-flex items-center gap-1 rounded-md bg-green-600 p-3 px-3 text-sm font-bold text-white shadow-md"
    >
      <Icon icon="material-symbols:add" width="20px" />
      <span> Aggiungi dipendente </span>
    </a>
  </div>

  {#if loading}
    <div class="flex justify-center">
      <div
        class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"
      ></div>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each workers as worker}
        <a
          class="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800"
          href={`workers/${worker.id}`}
        >
          <div class="flex items-center gap-4">
            {#if worker.avatar}
              <img
                src={worker.avatar}
                alt={worker.firstName}
                class="h-12 w-12 rounded-full"
              />
            {:else}
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
              >
                <span
                  class="text-xl font-medium text-gray-600 dark:text-gray-300"
                >
                  {worker.firstName[0]}{worker.lastName[0]}
                </span>
              </div>
            {/if}
            <div>
              <h2 class="text-lg font-semibold dark:text-white">
                {worker.firstName}
                {worker.lastName}
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {worker.email}
              </p>
            </div>
          </div>

          {#if worker.phoneNumber}
            <div class="mt-4 text-sm text-gray-600 dark:text-gray-300">
              📱 {worker.phoneNumber}
            </div>
          {/if}

          <div class="mt-4 flex items-center gap-2">
            <span
              class="rounded-full px-2 py-1 text-xs
              {worker.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : worker.status === 'INACTIVE'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}"
            >
              {worker.status}
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
