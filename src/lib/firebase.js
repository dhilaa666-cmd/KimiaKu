import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * Konfigurasi Firebase dari variabel lingkungan Vite (.env)
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

const rawConfig = {
  apiKey: (env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (env.VITE_FIREBASE_APP_ID || '').trim()
}

/**
 * Memeriksa kelengkapan dan keabsahan konfigurasi Firebase (Temuan 03-01)
 * Mencegah crash auth/invalid-api-key jika variabel environment kosong atau berupa placeholder
 */
export function validateFirebaseConfig(config) {
  const missing = []
  const placeholders = ['your_', 'contoh', 'placeholder', '<', '>', 'todo', 'undefined', 'null']

  const isPlaceholder = (val) => {
    if (!val || typeof val !== 'string') return true
    const lower = val.toLowerCase()
    return placeholders.some((p) => lower.includes(p))
  }

  if (!config.apiKey || isPlaceholder(config.apiKey) || config.apiKey.length < 10) {
    missing.push('VITE_FIREBASE_API_KEY')
  }
  if (!config.projectId || isPlaceholder(config.projectId)) {
    missing.push('VITE_FIREBASE_PROJECT_ID')
  }
  if (!config.appId || isPlaceholder(config.appId)) {
    missing.push('VITE_FIREBASE_APP_ID')
  }

  const isValid = missing.length === 0
  return {
    isValid,
    missing,
    message: isValid
      ? 'Konfigurasi Firebase valid dan lengkap.'
      : `Konfigurasi Firebase belum lengkap (variabel tidak valid/kosong: ${missing.join(', ')}). Mode Tamu Lokal dijalankan otomatis.`
  }
}

const configValidation = validateFirebaseConfig(rawConfig)

// Inisialisasi aman: Jika konfigurasi tidak valid, jangan inisialisasi agar aplikasi tidak crash
let safeApp = null
let safeAuth = null
let safeGoogleProvider = null
let safeDb = null
let isConfigured = false

if (configValidation.isValid) {
  try {
    safeApp = getApps().length === 0 ? initializeApp(rawConfig) : getApp()
    safeAuth = getAuth(safeApp)
    safeGoogleProvider = new GoogleAuthProvider()
    safeGoogleProvider.setCustomParameters({ prompt: 'select_account' })
    safeDb = getFirestore(safeApp)
    isConfigured = true
  } catch (err) {
    console.warn('[KimiaKu Firebase] Gagal menginisialisasi Firebase SDK:', err)
    isConfigured = false
    safeApp = null
    safeAuth = null
    safeGoogleProvider = null
    safeDb = null
  }
} else {
  console.info('[KimiaKu Firebase] ' + configValidation.message)
}

export const isFirebaseConfigured = isConfigured
export const app = safeApp
export const auth = safeAuth
export const googleProvider = safeGoogleProvider
export const db = safeDb

/**
 * Mengambil ringkasan status konfigurasi Firebase saat ini
 * @returns {{ isConfigured: boolean, isValid: boolean, missingKeys: string[], message: string }}
 */
export function getFirebaseConfigStatus() {
  return {
    isConfigured,
    isValid: configValidation.isValid,
    missingKeys: configValidation.missing,
    message: configValidation.message
  }
}

/**
 * Membuka dialog popup login Google
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginWithGoogle() {
  if (!isConfigured || !auth || !googleProvider) {
    throw new Error('Firebase belum dikonfigurasi. Silakan lengkapi .env atau lanjutkan dalam Mode Tamu Lokal.')
  }
  return await signInWithPopup(auth, googleProvider)
}

/**
 * Login dengan Email dan Password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginWithEmail(email, password) {
  if (!isConfigured || !auth) {
    throw new Error('Firebase belum dikonfigurasi. Silakan lengkapi .env atau lanjutkan dalam Mode Tamu Lokal.')
  }
  return await signInWithEmailAndPassword(auth, email.trim(), password)
}

/**
 * Pendaftaran Akun Baru dengan Email dan Password
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName]
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function registerWithEmail(email, password, displayName = '') {
  if (!isConfigured || !auth) {
    throw new Error('Firebase belum dikonfigurasi. Silakan lengkapi .env atau lanjutkan dalam Mode Tamu Lokal.')
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  if (displayName && userCredential.user) {
    try {
      await updateProfile(userCredential.user, { displayName: displayName.trim() })
    } catch (err) {
      console.warn('Gagal memperbarui display name profil:', err)
    }
  }
  return userCredential
}

/**
 * Login sebagai Tamu (Anonymous Auth)
 * Jika Firebase tidak aktif, melempar error agar ditangani oleh handler tamu lokal
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginAsGuest() {
  if (!isConfigured || !auth) {
    throw new Error('Firebase Anonymous Auth tidak aktif. Mengalihkan ke Mode Tamu Lokal.')
  }
  return await signInAnonymously(auth)
}

/**
 * Logout dari sesi akun pengguna saat ini
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  if (!isConfigured || !auth) return
  return await signOut(auth)
}

/**
 * Berlangganan perubahan status sesi autentikasi
 * Jika Firebase belum dikonfigurasi, segera panggil callback(null) secara non-blocking
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void}
 */
export function subscribeToAuth(callback) {
  if (!isConfigured || !auth) {
    // Non-blocking callback untuk Mode Tamu Lokal otomatis
    const timer = setTimeout(() => callback(null), 0)
    return () => clearTimeout(timer)
  }
  try {
    return onAuthStateChanged(auth, callback)
  } catch (err) {
    console.warn('Gagal berlangganan auth state Firebase:', err)
    const timer = setTimeout(() => callback(null), 0)
    return () => clearTimeout(timer)
  }
}

export default {
  app,
  auth,
  googleProvider,
  db,
  isFirebaseConfigured,
  getFirebaseConfigStatus,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAsGuest,
  logoutUser,
  subscribeToAuth
}
