<script lang="ts">
  import { onMount } from 'svelte'

  let { children, target = 'body' } = $props()
  let portalContent: HTMLElement

  onMount(() => {
    const targetEl = document.querySelector(target)

    if (targetEl) {
      targetEl.appendChild(portalContent)

      return () => targetEl.removeChild(portalContent)
    }
  })
</script>

<div
  bind:this={portalContent}
  class="fixed top-0 flex h-screen w-full flex-wrap justify-center p-5 align-middle"
>
  {@render children()}
</div>
