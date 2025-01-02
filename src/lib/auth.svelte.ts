import { auth, db } from '$lib/firebase.svelte'
import { redirect } from '@sveltejs/kit'
import { getAuth } from 'firebase/auth'
import { get } from 'svelte/store'
import { currentUser, firebaseInitialized } from './store.svelte'
import { doc, onSnapshot } from 'firebase/firestore'
import type { User } from '../sharedTypes'

const AUTH_TIMEOUT_MS = 10000 // Aumentato a 10 secondi per maggiore affidabilità

// Utility function per convertire i timestamp Firestore
function convertFirestoreTimestamps(userData: any): User {
  return {
    ...userData,
    createdAt: userData.createdAt?.toDate(),
    updatedAt: userData.updatedAt?.toDate(),
    lastLoginAt: userData.lastLoginAt?.toDate()
  } as User
}

// Gestione unificata del caricamento utente
function setupUserListener(uid: string) {
  return onSnapshot(
    doc(db, 'users', uid),
    {
      includeMetadataChanges: true
    },
    (documentSnapshot) => {
      if (!documentSnapshot.exists()) {
        console.error('User document not found')
        currentUser.set(null)
        return
      }

      const userData = documentSnapshot.data()
      if (userData) {
        currentUser.set(convertFirestoreTimestamps(userData))
      }
    },
    (error) => {
      console.error('Error loading user data:', error)
      currentUser.set(null)
    }
  )
}

// Listener per i cambiamenti di auth state
auth?.onAuthStateChanged((userData) => {
  if (userData) {
    setupUserListener(userData.uid)
  } else {
    currentUser.set(null)
  }
})

export async function authGuard() {
  // Attendi l'inizializzazione di Firebase
  if (!get(firebaseInitialized)) {
    await new Promise<void>((resolve) => {
      const unsubscribe = firebaseInitialized.subscribe((initialized) => {
        if (initialized) {
          unsubscribe()
          resolve()
        }
      })
    })
  }

  const auth = getAuth()

  try {
    const user = await Promise.race([
      new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe()
          if (user) setupUserListener(user.uid)
          resolve(user)
        })
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Authentication timeout - please try again')),
          AUTH_TIMEOUT_MS
        )
      )
    ])

    if (!user) {
      throw redirect(303, '/login')
    }

    return { user }
  } catch (error) {
    console.error('Auth error:', error)
    throw redirect(303, '/login')
  }
}