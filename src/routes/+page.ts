import { authGuard } from '$lib/auth.svelte'
import { currentUser } from '$lib/store.svelte'
import { get } from 'svelte/store'

export const load = async () => {
  return await authGuard()
}
