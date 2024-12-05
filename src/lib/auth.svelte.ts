import { auth, db } from '$lib/firebase.svelte'
import { redirect } from '@sveltejs/kit'
import { getAuth } from 'firebase/auth'
import { get } from 'svelte/store'
import { currentUser, firebaseInitialized } from './store.svelte'
import { doc, getDoc } from 'firebase/firestore'
import type { User } from '../sharedTypes'

export const user = $state(null)

async function loadUser(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))

    if (userDoc.exists()) {
      const userData = userDoc.data()

      currentUser.set({
        ...userData,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
        lastLoginAt: userData.lastLoginAt?.toDate()
      } as User)
    } else {
      console.error('cannot load user')
      currentUser.set(null)
    }
  } catch (error) {
    console.error('Errore nel caricamento dati utente:', error)
    currentUser.set(null)
  }
}

auth?.onAuthStateChanged((userData) => {
  if (userData) loadUser(userData.uid)
})

export async function authGuard() {
  if (!get(firebaseInitialized)) {
    await new Promise((resolve) => {
      const unsubscribe = firebaseInitialized.subscribe((initialized) => {
        if (initialized) {
          unsubscribe()
          resolve(true)
        }
      })
    })
  }

  const auth = getAuth()

  await Promise.race([
    new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) loadUser(user?.uid)
        unsubscribe()
        resolve(user)
      })
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )
  ])

  if (!auth.currentUser) {
    throw redirect(303, '/login')
  }

  return {
    user: auth.currentUser
  }
}
