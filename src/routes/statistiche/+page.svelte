<script lang="ts">
  import { daysOBS } from '$lib/store';
  import { format, getMonth, getYear, subMonths, addMonths } from 'date-fns';
  import type { workedDay } from '../../types';
  import { sumToCompensation, calcolaOre } from '$lib/helper';

  let allDays: workedDay[] = [];
  let currentSelection = new Date();
  let currentDaysDisplayed: workedDay[] = [];

  let daysList: HTMLUListElement;
  let totalSpan: Element;

  $: daysOBS.subscribe((data) => {
    allDays = data;
    currentDaysDisplayed = getDays(currentSelection);
  });

  function getDays(date: Date): workedDay[] {
    return allDays.filter(
      (all) => getMonth(all.giorno) == getMonth(date) && getYear(all.giorno) == getYear(date)
    );
  }

  function copyToClipboard() {
    let textToCopy = 'Ecco i miei giorni lavorati di ' + format(currentSelection, 'MMMM') + '\n';

    console.log(daysList);
    for (let i of daysList.childNodes) {
      textToCopy += formatListItem(i);
    }

    function formatListItem(li: HTMLElement): string {
      let text = (li.querySelector('.info')?.textContent?.trim() ?? '') + '\n';
      const nestedUl = li.querySelector('ul');
      if (nestedUl) {
        const nestedItems = nestedUl.querySelectorAll('li');
        nestedItems.forEach((nestedLi) => {
          text += `   ${nestedLi.textContent?.trim() ?? ''}\n`;
        });
      }
      text += (li.querySelector('.final')?.textContent?.trim() ?? '') + '\n\n';
      return text;
    }

    textToCopy += totalSpan.textContent?.trim();

    // Copia il testo negli appunti
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log(textToCopy);

        // alert('Testo copiato!');
      })
      .catch((error) => {
        console.error('Errore durante la copia:', error);
      });
  }
</script>

<div class="p-10">
  <!-- Navigation -->
  <div class="flex w-full px-16">
    <button
      class="bold cursor-pointer font-bold"
      on:click={() => {
        currentSelection = subMonths(currentSelection, 1);
      }}>&lt;</button
    >
    <span class="flex-1 text-center">For mouth: {format(currentSelection, 'MMMM YYY')}</span>
    <button
      class="bold cursor-pointer font-bold"
      on:click={() => {
        currentSelection = addMonths(currentSelection, 1);
      }}>&gt;</button
    >
  </div>

  <button
    id="copy-button"
    class="rounded-md bg-green-700 px-3 py-2 text-sm font-bold text-white shadow-md"
    on:click={copyToClipboard}
  >
    copia
  </button>

  <ul id="day-list" class="list-disc divide-y divide-dashed" bind:this={daysList}>
    {#each currentDaysDisplayed as day}
      <li class="py-2">
        <span class="info">
          {format(day.giorno, 'PPP')}
          {day.yourCar ? 'Con la macchina 🚗' : ''}
          {day.viaggio ? '+ viaggio' : ''}
        </span>
        <ul class="list-inside list-disc">
          {#each day.fasce_orarie as fascia_oraria}
            <li>{fascia_oraria.inizio} - {fascia_oraria.fine}</li>
          {/each}
        </ul>
        <span class="final">
          Tot ore giorno: {calcolaOre(day.fasce_orarie)}
          {day.viaggio ? '+ 2' : ''} = {calcolaOre(day.fasce_orarie) + (day.viaggio ? 2 : 0)}
        </span>
      </li>
    {/each}
  </ul>
  <span id="total-span" bind:this={totalSpan}
    >Totale {format(currentSelection, 'MMMM')}: € {sumToCompensation(currentDaysDisplayed)}</span
  >
</div>
