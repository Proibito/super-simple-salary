import type { User } from '../sharedTypes'
import type { WorkedDay } from '../types'
import { writable } from 'svelte/store'

export const daysOBS = writable<WorkedDay[]>([])

export const firebaseInitialized = writable(false)
export const currentUser = writable<User | null>(null)
