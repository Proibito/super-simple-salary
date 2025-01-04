<script lang="ts">
  import { db } from '$lib/firebase.svelte'
  import type { User } from '../../../sharedTypes'
  import { format } from 'date-fns'
  import { it } from 'date-fns/locale'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'

  import type { PageData } from './$types'
  import { error } from '@sveltejs/kit'

  let { data }: { data: PageData } = $props()
  let worker: User | null = $state(null)

  $effect(() => {
    form.map((el) => {
      if (worker) el.value = worker[el.fieldName] as any
    })
  })

  async function loadWorker(id: string): Promise<User> {
    const docRef = doc(db, 'users', id)

    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw error(404, 'Dipendente non trovato')
    }

    const data = docSnap.data()
    worker = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      lastLoginAt: data.lastLoginAt?.toDate()
    } as User
    return worker
  }

  let isSaving = $state(false)
  let saveError = $state<string | null>(null)
  let saveSuccess = $state(false)

  async function saveWorker() {
    if (!worker) return

    try {
      isSaving = true
      saveError = null
      saveSuccess = false

      const docRef = doc(db, 'users', worker.id)

      const updateData = {
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        phoneNumber: worker.phoneNumber || '-',
        status: worker.status,
        avatar: worker.avatar || null,
        updatedAt: new Date()
      }

      // Aggiorna il documento
      await updateDoc(docRef, updateData)

      saveSuccess = true

      // Reset del successo dopo 3 secondi
      setTimeout(() => {
        saveSuccess = false
      }, 3000)
    } catch (e) {
      saveError = (e as Error).message
      console.error(e)
    } finally {
      isSaving = false
    }
  }

  type FormField = {
    type: number
    label: string
    value: string
    width: string
    fieldName: keyof User
  }

  let form: FormField[] = $state([
    {
      type: 0,
      label: 'Nome',
      value: '',
      width: '50%',
      fieldName: 'firstName'
    },
    {
      type: 0,
      label: 'Cognome',
      value: '',
      width: '50%',
      fieldName: 'lastName'
    },
    {
      type: 1,
      label: 'Numero di telefono',
      value: '',
      width: '50%',
      fieldName: 'phoneNumber'
    }
  ])

  function updateWorker(ev: Event) {
    const target = ev.target as HTMLInputElement

    if (worker && target) {
      const fieldName: keyof User = target.getAttribute(
        'data-field'
      ) as keyof User
      if (fieldName && fieldName in worker) {
        worker[fieldName] = target.value
      }
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div>
    <a href="/workers" class="btn mb-5">Indietro</a>
  </div>
  {#await loadWorker(data.id)}
    <div class="flex justify-center">
      <div
        class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"
      ></div>
    </div>
  {:then worker}
    <div
      class="mx-auto overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-800"
    >
      <div class="p-8">
        <!-- Header -->
        <div class="flex">
          <div class="flex items-center gap-6">
            {#if worker.avatar}
              <img
                src={worker.avatar}
                alt={worker.firstName}
                class="h-24 w-24 rounded-full"
              />
            {:else}
              <div
                class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
              >
                <span
                  class="text-3xl font-medium text-gray-600 dark:text-gray-300"
                >
                  {worker.firstName[0]}{worker.lastName[0]}
                </span>
              </div>
            {/if}

            <div>
              <h1 class="text-2xl font-bold dark:text-white">
                {worker.firstName}
                {worker.lastName}
              </h1>
              <p class="text-gray-600 dark:text-gray-300">{worker.email}</p>
              {#if worker.phoneNumber}
                <p class="mt-1 text-gray-600 dark:text-gray-300">
                  📱 {worker.phoneNumber}
                </p>
              {/if}
            </div>
          </div>

          <div class="ml-auto">
            <button
              class="rounded bg-green-700 p-3 px-10 font-bold"
              onclick={saveWorker}
            >
              salva
            </button>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </h3>
              <span
                class="mt-1 inline-block rounded-full px-3 py-1 text-sm
                {worker.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : worker.status === 'INACTIVE'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}"
              >
                {worker.status}
              </span>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ruolo
              </h3>
              <p class="mt-1 text-gray-900 dark:text-gray-100">{worker.role}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Registrato il
              </h3>
              <p class="mt-1 text-gray-900 dark:text-gray-100">
                {format(worker.createdAt, 'PPP', { locale: it })}
              </p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ultimo accesso
              </h3>
              <p class="mt-1 text-gray-900 dark:text-gray-100">
                {worker.lastLoginAt
                  ? format(worker.lastLoginAt, 'PPP', { locale: it })
                  : 'Mai'}
              </p>
            </div>
          </div>
        </div>
        <hr class="my-10" />
        <!-- form -->
        <div class="flex flex-wrap gap-5">
          {#each form as field}
            {#if field.type == 0}
              <div class={`w-[calc(${field.width}-20px)]`}>
                <label
                  for={field.fieldName}
                  class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {field.label}
                </label>
                <input
                  data-field={field.fieldName}
                  type="text"
                  required
                  bind:value={field.value}
                  oninput={updateWorker}
                  class="relative mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                  text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            {/if}

            {#if field.type == 1}
              <div class={`w-[calc(${field.width}-20px)]`}>
                <label
                  for={field.fieldName}
                  class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {field.label}
                </label>
                <input
                  data-field={field.fieldName}
                  type="tel"
                  required
                  bind:value={field.value}
                  oninput={updateWorker}
                  class="relative mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                  text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            {/if}
          {/each}
          <!-- nome -->
        </div>
      </div>
    </div>
  {:catch}
    <div class="text-center text-red-600 dark:text-red-400">
      Dipendente non trovato
    </div>
  {/await}
</div>
