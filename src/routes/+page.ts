import { authGuard } from '$lib/auth.svelte'


export const load = async () => {
  return await authGuard()
}
