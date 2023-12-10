<script lang="ts">
  let ref: any;
  $: ref && document.body.appendChild(ref);
</script>

<div
  bind:this={ref}
  class="fixed h-screen top-0 w-full bg-slate-300 bg-opacity-60 flex align-middle justify-center flex-wrap p-5"
>
  <slot />
</div>
