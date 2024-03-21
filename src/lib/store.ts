import type { workedDay } from 'src/types';
import { writable } from 'svelte/store';

export const daysOBS = writable<workedDay[]>([]);
