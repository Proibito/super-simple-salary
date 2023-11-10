import { writable } from 'svelte/store';
import type { WORKEDDAY } from '../inizializzaDb';

export const daysOBS = writable<WORKEDDAY[]>([]);