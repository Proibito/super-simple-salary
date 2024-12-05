import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore
} from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { firebaseInitialized } from './store.svelte'

let app
let auth: Auth | null
let db: Firestore
let functions

export async function initializeFirebase() {
  // Configurazione per l'ambiente di produzione
  const firebaseConfig = {
    apiKey: 'AIzaSyBpvPIxOtbBemVAYdKWnsWGc9lPxAN5iug',
    authDomain: 'gourmet-a6596.firebaseapp.com',
    projectId: 'gourmet-a6596',
    storageBucket: 'gourmet-a6596.firebasestorage.app',
    messagingSenderId: '13047951500',
    appId: '1:13047951500:web:74da0c70576c5e60c50ba9'
  }

  // Inizializza Firebase
  const app = initializeApp(firebaseConfig)
  firebaseInitialized.set(true)

  // Inizializza i servizi
  const auth = getAuth(app)
  db = getFirestore(app)

  const functions = getFunctions(app)

  // Controlla se siamo in modalità emulatore
  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

  if (useEmulator) {
    // Connetti agli emulatori
    connectAuthEmulator(auth, 'http://localhost:9099')
    connectFirestoreEmulator(db, 'localhost', 8081)
    connectFunctionsEmulator(functions, 'localhost', 5001)

    console.log('🔧 Using firebase emulators')
  }
}

export { app, auth, db, functions }
