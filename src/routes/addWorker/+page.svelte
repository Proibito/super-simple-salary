<!-- SignupForm.svelte -->
<script lang="ts">
  import { getFunctions, httpsCallable } from 'firebase/functions'

  let loading = false
  let error = ''

  let formData = {
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    loading = true
    error = ''

    try {
      const functions = getFunctions()
      const signUp = httpsCallable(functions, 'signUpUser')

      const result = await signUp(formData)
      console.log('Utente creato:', result.data)
    } catch (err) {
      console.error('Errore durante la registrazione:', err)
      error =
        err instanceof Error ? err.message : 'Errore durante la registrazione'
    } finally {
      loading = false
    }
  }
</script>

<div
  class="flex items-center justify-center bg-gray-50 px-4 pt-10 dark:bg-gray-900"
>
  <div class="w-full max-w-md space-y-8">
    <div>
      <h2
        class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
      >
        Crea un nuovo account per il dipendente
      </h2>
    </div>

    <form class="mt-8 space-y-6" on:submit={handleSubmit}>
      {#if error}
        <div class="rounded-md bg-red-50 p-4 dark:bg-red-900">
          <div class="text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        </div>
      {/if}

      <div class="space-y-4 rounded-md shadow-sm">
        <div>
          <label
            for="firstName"
            class="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Nome
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            bind:value={formData.firstName}
            class="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Inserisci il nome"
          />
        </div>

        <div>
          <label
            for="lastName"
            class="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Cognome
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            bind:value={formData.lastName}
            class="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Inserisci il cognome"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={formData.email}
            class="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Inserisci l'email"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            bind:value={formData.password}
            class="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="Inserisci la password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#if loading}
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <!-- Spinner -->
              <svg
                class="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            Registrazione in corso...
          {:else}
            Registrati
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
