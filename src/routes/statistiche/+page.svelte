<script lang="ts">
  import { daysOBS } from '$lib/store';
  import { format, getMonth, getYear, subMonths, addMonths } from 'date-fns';
  import type { WorkedDay } from '$lib/types';
  import {
    calculateTotalCompensation,
    calculateTotalHours,
    calculateDetailedCompensation
  } from '$lib/utils/timeTrackingUtils';

  let allDays: WorkedDay[] = [];
  let currentSelection = new Date();
  let currentDaysDisplayed: WorkedDay[] = [];
  let detailed_compensation: { totalHours: number; totalTravel: number; daily_allowance: number } =
    {};

  let daysList: HTMLUListElement;
  let totalSpan: Element;

  $: daysOBS.subscribe((data) => {
    allDays = data;
    currentDaysDisplayed = getDays(currentSelection);
  });

  function getDays(date: Date): WorkedDay[] {
    const ret = allDays.filter(
      (all) => getMonth(all.date) == getMonth(date) && getYear(all.date) == getYear(date)
    );
    detailed_compensation = calculateDetailedCompensation(ret);
    return ret;
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

    for (let i of totalSpan.childNodes) {
      if (i.nodeName == 'P') textToCopy += i.textContent?.trim() + '\n';
    }

    console.log(totalSpan.childNodes);

    // Copia il testo negli appunti
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log(textToCopy);
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
          {format(day.date, 'PPP')}
          {day.carUsage ? 'Con la macchina 🚗' : ''}
          {day.travel ? '+ viaggio' : ''}
        </span>
        <ul class="list-inside list-disc">
          {#each day.timeSlots as fascia_oraria}
            <li>{fascia_oraria.start} - {fascia_oraria.end}</li>
          {/each}
        </ul>
        <span class="final">
          Tot ore giorno: {calculateTotalHours(day.timeSlots)}
          {day.travel ? '+ 2' : ''} = {calculateTotalHours(day.timeSlots) + (day.travel ? 2 : 0)}
        </span>
      </li>
    {/each}
  </ul>
  <div id="total-span" bind:this={totalSpan}>
    <p>
      Totale ore lavorate: {detailed_compensation.totalHours} = € {detailed_compensation.totalHours *
        10}
    </p>
    <p>
      Totale ore viaggio: {detailed_compensation.totalTravel} = € {detailed_compensation.totalTravel *
        10}
    </p>
    <p>
      Totale diaria: {detailed_compensation.daily_allowance} = € {detailed_compensation.daily_allowance *
        40}
    </p>
    <p>
      Totale {format(currentSelection, 'MMMM')}: € {calculateTotalCompensation(
        currentDaysDisplayed
      )}
    </p>
  </div>
</div>
