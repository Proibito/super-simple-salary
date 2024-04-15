import type { workedDay } from '../types';
import { writable } from 'svelte/store';

export const daysOBS = writable<workedDay[]>([]);
