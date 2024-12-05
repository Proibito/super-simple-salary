/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { log } from 'firebase-functions/logger'
import { UserRole, UserStatus, type User, SignUpData } from './sharedTypes'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp()

export const signUpUser = onCall(async (request) => {
  const { email, password, firstName, lastName }: SignUpData = request.data

  // Validazione dei dati in ingresso
  if (!email || !password || !firstName || !lastName) {
    throw new HttpsError('invalid-argument', 'Tutti i campi sono obbligatori')
  }

  try {
    // Crea l'utente in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password
    })

    await getAuth().setCustomUserClaims(userRecord.uid, { role: UserRole.USER })

    // Prepara i dati per Firestore
    const userData: User = {
      id: userRecord.uid,
      email,
      firstName,
      lastName,
      role: UserRole.USER, // Default role
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    }

    // Salva i dati in Firestore
    const db = getFirestore()
    await db.collection('users').doc(userRecord.uid).set(userData)

    log('Utente creato con successo:', userRecord.uid)

    return {
      success: true,
      userId: userRecord.uid
    }
  } catch (error) {
    log("Errore durante la creazione dell'utente:", error)
    throw new HttpsError('internal', "Errore durante la creazione dell'utente")
  }
})
