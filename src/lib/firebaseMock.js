/**
 * Firebase Fallback / Shim Module
 * Digunakan otomatis saat package firebase belum ter-install di node_modules
 * atau saat aplikasi berjalan di lingkungan tanpa konektivitas ke Firebase.
 * Mencegah crash bundler (Vite/Rolldown) dan runtime browser.
 */

// --- Fallback Firebase App ---
export const initializeApp = () => null
export const getApps = () => []
export const getApp = () => null

// --- Fallback Firebase Auth ---
export class GoogleAuthProvider {
  constructor() {
    this.customParameters = {}
  }
  setCustomParameters(params) {
    this.customParameters = { ...this.customParameters, ...params }
  }
}

export const getAuth = () => null

export const signInWithPopup = async () => {
  throw new Error(
    'Package firebase belum ter-install atau konfigurasi belum aktif. Jalankan `npm install` untuk mengaktifkan login Google.'
  )
}

export const signOut = async () => Promise.resolve()

export const signInWithEmailAndPassword = async (_auth, email) => ({
  user: { uid: 'mock-uid', email, displayName: email?.split('@')[0] || 'Pengguna' }
})

export const createUserWithEmailAndPassword = async (_auth, email) => ({
  user: { uid: 'mock-uid', email, displayName: email?.split('@')[0] || 'Pengguna' }
})

export const onAuthStateChanged = (_auth, callback) => {
  if (typeof callback === 'function') {
    // Segera panggil dengan null (tidak ada user aktif)
    setTimeout(() => {
      try {
        callback(null)
      } catch (e) {
        console.warn('[KimiaKu Firebase Fallback] Callback error:', e)
      }
    }, 0)
  }
  return () => {}
}

// --- Fallback Firebase Firestore ---
export const getFirestore = () => null

export const doc = (_db, collectionName, id) => ({
  id: id || 'mock-id',
  path: `${collectionName}/${id || 'mock-id'}`
})

export const setDoc = async () => {
  throw new Error(
    'Package firebase belum ter-install atau Firestore tidak aktif. Data tetap tersimpan aman di localStorage.'
  )
}

export const serverTimestamp = () => new Date().toISOString()

export default {
  initializeApp,
  getApps,
  getApp,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
}

