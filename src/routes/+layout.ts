import { authGuard } from '$lib/auth.svelte'
import { initializeFirebase } from '$lib/firebase.svelte'

export const ssr = false

export async function load() {
  initializeFirebase()
  return {}
}
