import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * Konfigurasi Firebase dari variabel lingkungan Vite (.env.local)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
}

// Inisialisasi Firebase App secara aman (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Inisialisasi Firebase Authentication
export const auth = getAuth(app)

// Inisialisasi Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Inisialisasi Firestore Database
export const db = getFirestore(app)

/**
 * Membuka dialog popup login Google
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginWithGoogle() {
  return await signInWithPopup(auth, googleProvider)
}

/**
 * Logout dari sesi akun pengguna saat ini
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  return await signOut(auth)
}

/**
 * Berlangganan perubahan status sesi autentikasi
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {import('firebase/auth').Unsubscribe}
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export default {
  app,
  auth,
  googleProvider,
  db,
  loginWithGoogle,
  logoutUser,
  subscribeToAuth
}

