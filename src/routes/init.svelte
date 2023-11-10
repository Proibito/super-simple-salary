<script lang="ts">
  import { type DB, initializeDB } from '../inizializzaDb';

  let pagaOraria: number = 0;

  export let salvato = false;

  async function salvaPaga() {
    const db: DB = await initializeDB();
    await db.put('paga_base', pagaOraria, 'main');
    // Redirect to the main page or next view
    salvato = true;
  }
</script>

<div>
  <label for="paga" class="text-xl">Inserisci la tua paga oraria:</label>
  <input type="number" id="paga" bind:value={pagaOraria} />
  <button on:click={salvaPaga}>Salva</button>
</div>
