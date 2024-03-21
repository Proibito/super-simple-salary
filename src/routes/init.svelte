<script lang="ts">
  let pagaOraria: number = 0;

  export let salvato = false;

  async function salvaPaga() {
    salvato = true;
  }
</script>

<div>
  <label for="paga" class="text-xl">Inserisci la tua paga oraria:</label>
  <input type="number" id="paga" bind:value={pagaOraria} />
  <button on:click={salvaPaga}>Salva</button>
</div>
