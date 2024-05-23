import type { WorkedDay } from '../types';
import { writable } from 'svelte/store';

export const daysOBS = writable<WorkedDay[]>([]);
