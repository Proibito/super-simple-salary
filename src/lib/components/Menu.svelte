<script lang="ts">
  import Portal from '$lib/components/Portal.svelte'

  let { openMenu = $bindable() } = $props()

  openMenu = true

  type menuItem = { label: string; link: string }
  const links: menuItem[] = [
    { label: 'home', link: 'home' },
    { label: 'storico', link: 'storico' },
    { label: 'statistiche', link: 'statistiche' },
    { label: 'Payment History', link: 'PaymentHistory' },
    { label: 'Registra dipendente', link: 'addWorker' }
  ]
</script>

{#if openMenu}
  <Portal target="body">
    <div
      class="min-h-[50%] w-[90%] rounded bg-white p-5 dark:bg-slate-950 dark:text-white"
    >
      <button onclick={() => (openMenu = false)}>Chiudi</button>

      <div class="mt-5 flex flex-col gap-2">
        <hr />
        {#each links as single}
          <a
            href={`./${single.link == 'home' ? '' : single.link}`}
            class="font-bold"
            onclick={() => (openMenu = false)}>{single.label}</a
          >
          <hr />
        {/each}
      </div>
    </div>
  </Portal>
{/if}
