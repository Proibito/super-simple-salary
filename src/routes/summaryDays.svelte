<script lang="ts">
  import { onDestroy } from 'svelte';
  import { count } from './store';
  import type { WORKEDDAY } from '../inizializzaDb';
  import moment from 'moment';

  let giorniLavorati: WORKEDDAY[] = [];

  const sium = count.subscribe((value) => {
    giorniLavorati = value;
  });

  onDestroy(sium);
</script>

<div>
  {#each giorniLavorati as giorno}
    <div>
      <span>{moment(giorno.giorno).format('dddd DD/MM/YYYY')}</span>
    </div>
  {/each}
</div>
