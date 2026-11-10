/**
 * Pengelolaan Data Local-First KimiaKu
 * Sesuai panduan PPT Pertemuan 04, DATABASE.md, dan PRD.md:
 * - Kunci localStorage diawali dengan prefix 'kimiaku-'
 * - Idempotensi: ID percobaan dibuat SEKALI saat mulai percobaan dan dipertahankan saat retry
 * - Status pengiriman: Lokal | Menunggu Kirim | Terkirim | Gagal
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Kunci penyimpanan localStorage
export const STORAGE_KEY_QUIZ = 'kimiaku-kuis-data'
export const STORAGE_KEY_POE_RECORDS = 'kimiaku-poe-submissions'
export const STORAGE_KEY_SYNC = 'kimiaku-sync-status'
export const LEGACY_STORAGE_KEY = 'kimiaku:laju-reaksi:v1'

// Status Pengiriman Data yang Jujur (PPT Pertemuan 04 Slide 12)
export const SYNC_STATUS = {
  LOCAL: 'Lokal',
  PENDING: 'Menunggu Kirim',
  SYNCED: 'Terkirim',
  FAILED: 'Gagal'
}

export const MODULE_ID = 'modul-1'
export const ACTIVITY_ID = 'kuis-laju-reaksi'
export const QUESTION_VERSION = 'v1'

/**
 * Generate ID unik untuk satu sesi percobaan (dibuat hanya satu kali di awal)
 */
export function generateAttemptId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'attempt-' + crypto.randomUUID()
  }
  return 'attempt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
}

/**
 * Struktur default record kuis
 */
export function getDefaultRecord() {
  return {
    id: generateAttemptId(), // ID tetap untuk idempotensi
    ownerId: 'guest',
    alias: 'Tamu',
    userEmail: null,
    moduleId: MODULE_ID,
    activityId: ACTIVITY_ID,
    questionVersion: QUESTION_VERSION,
    kind: 'diagnostic',
    answers: {},
    score: null,
    completedAt: null,
    isSubmitted: false,
    syncStatus: SYNC_STATUS.LOCAL,
    syncError: null,
    lastSyncedAt: null
  }
}

/**
 * Membaca data kuis dari localStorage (Local First)
 * Mendukung kunci baru 'kimiaku-kuis-data' dengan fallback ke 'kimiaku:laju-reaksi:v1'
 * @returns {Object}
 */
export function getStoredQuizData() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultRecord()
  }

  try {
    let raw = window.localStorage.getItem(STORAGE_KEY_QUIZ)
    if (!raw) {
      // Fallback ke legacy key
      raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    }

    if (!raw) {
      const initial = getDefaultRecord()
      saveToLocalStorage(initial)
      return initial
    }

    const parsed = JSON.parse(raw)
    const record = {
      id: parsed.id || generateAttemptId(),
      ownerId: parsed.ownerId || 'guest',
      alias: parsed.alias || 'Tamu',
      userEmail: parsed.userEmail || null,
      moduleId: parsed.moduleId || MODULE_ID,
      activityId: parsed.activityId || ACTIVITY_ID,
      questionVersion: parsed.questionVersion || QUESTION_VERSION,
      kind: parsed.kind || 'diagnostic',
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      score: typeof parsed.score === 'number' ? parsed.score : null,
      completedAt: parsed.completedAt || null,
      isSubmitted: Boolean(parsed.isSubmitted || parsed.score !== null),
      syncStatus: parsed.syncStatus || SYNC_STATUS.LOCAL,
      syncError: parsed.syncError || null,
      lastSyncedAt: parsed.lastSyncedAt || null
    }

    return record
  } catch (err) {
    console.warn('Gagal membaca data kuis dari localStorage:', err)
    return getDefaultRecord()
  }
}

/**
 * Menyimpan data record kuis ke localStorage secara aman
 * @param {Object} record
 */
function saveToLocalStorage(record) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const serialized = JSON.stringify(record)
    window.localStorage.setItem(STORAGE_KEY_QUIZ, serialized)
    // Sinkronkan juga ke legacy key agar komponen lama tetap kompatibel
    window.localStorage.setItem(LEGACY_STORAGE_KEY, serialized)
    notifySyncListeners(record)
  } catch (err) {
    console.warn('Gagal menyimpan record kuis ke localStorage:', err)
  }
}

/**
 * Menyimpan draf jawaban yang sedang dipilih siswa ke localStorage
 * Menerapkan IDEMPOTENSI: Mempertahankan record.id yang sudah ada, jangan membuat id baru!
 * @param {Object} answers Peta id soal ke pilihan siswa
 * @returns {Object}
 */
export function saveQuizDraft(answers) {
  const current = getStoredQuizData()
  const updated = {
    ...current,
    answers: { ...answers },
    // Jangan ganti status jika sudah terkirim kecuali ada perubahan jawaban baru
    syncStatus: current.syncStatus === SYNC_STATUS.SYNCED ? SYNC_STATUS.PENDING : current.syncStatus,
    syncError: null
  }
  saveToLocalStorage(updated)
  return updated
}

/**
 * Menyimpan hasil akhir kuis yang telah disubmit secara lokal
 * Menerapkan IDEMPOTENSI: Mempertahankan record.id yang sama!
 * @param {Object} param0 { answers, score }
 * @returns {Object}
 */
export function saveQuizSubmission({ answers, score }) {
  const current = getStoredQuizData()
  const updated = {
    ...current,
    answers: answers || current.answers || {},
    score: Math.round(score),
    completedAt: new Date().toISOString(),
    isSubmitted: true,
    // Jika belum terkirim, status menjadi Menunggu Kirim jika sudah ada user, atau Lokal jika belum
    syncStatus: current.ownerId !== 'guest' ? SYNC_STATUS.PENDING : SYNC_STATUS.LOCAL,
    syncError: null
  }
  saveToLocalStorage(updated)
  return updated
}

/**
 * Mengatur ulang data kuis ke kondisi awal
 * Hanya pada reset yang disengaja inilah ID percobaan baru digenerate untuk percobaan berikutnya
 */
export function resetQuizData() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.removeItem(STORAGE_KEY_QUIZ)
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    window.localStorage.removeItem(STORAGE_KEY_SYNC)
    const newRecord = getDefaultRecord()
    saveToLocalStorage(newRecord)
    return newRecord
  } catch (err) {
    console.warn('Gagal mereset kuis di localStorage:', err)
  }
}

/**
 * Fungsi Sinkronisasi ke Firestore saat siswa login Google
 * Menerapkan IDEMPOTENSI PENUH (PPT Pertemuan 04 Slide 13):
 * - Menggunakan ID percobaan yang SAMA (record.id) sebagai ID dokumen Firestore
 * - setDoc(doc(db, 'submissions', record.id), payload, { merge: true })
 * - Retry berulang kali dengan ID yang sama TIDAK AKAN menghasilkan duplikasi data di Firestore
 *
 * @param {import('firebase/auth').User | null} user Pengguna Google yang aktif
 * @param {Object} [customRecord=null] Record kuis opsional
 * @returns {Promise<{ success: boolean, record: Object, error?: string }>}
 */
export async function syncQuizToFirestore(user, customRecord = null) {
  const record = customRecord ? { ...customRecord } : getStoredQuizData()

  // Jika siswa belum login, status tetap Lokal
  if (!user || !user.uid) {
    const updated = {
      ...record,
      syncStatus: SYNC_STATUS.LOCAL,
      syncError: 'Pengguna belum login Google'
    }
    saveToLocalStorage(updated)
    return { success: false, record: updated, error: 'Belum login' }
  }

  // Tandai status sedang Menunggu Kirim
  const pendingRecord = {
    ...record,
    ownerId: user.uid,
    alias: user.displayName || user.email?.split('@')[0] || 'Siswa',
    userEmail: user.email || null,
    syncStatus: SYNC_STATUS.PENDING,
    syncError: null
  }
  saveToLocalStorage(pendingRecord)

  try {
    // Siapkan payload sesuai Kontrak Hasil Belajar (Slide 10)
    // Server Firestore menambahkan receivedAt
    const firestorePayload = {
      id: pendingRecord.id, // ID TETAP untuk idempotensi
      ownerId: user.uid,
      alias: pendingRecord.alias,
      userEmail: pendingRecord.userEmail,
      moduleId: pendingRecord.moduleId || MODULE_ID,
      activityId: pendingRecord.activityId || ACTIVITY_ID,
      questionVersion: pendingRecord.questionVersion || QUESTION_VERSION,
      kind: pendingRecord.kind || 'diagnostic',
      answers: pendingRecord.answers || {},
      score: typeof pendingRecord.score === 'number' ? pendingRecord.score : null,
      completedAt: pendingRecord.completedAt || new Date().toISOString(),
      isSubmitted: Boolean(pendingRecord.isSubmitted),
      receivedAt: serverTimestamp(), // Waktu penerimaan server
      lastSyncedAt: new Date().toISOString()
    }

    // Tulis ke koleksi 'submissions' dengan ID dokumen yang sama persis (Idempoten)
    const docRef = doc(db, 'submissions', pendingRecord.id)
    await setDoc(docRef, firestorePayload, { merge: true })

    // Sukses dikonfirmasi oleh Firestore
    const syncedRecord = {
      ...pendingRecord,
      syncStatus: SYNC_STATUS.SYNCED,
      syncError: null,
      lastSyncedAt: new Date().toISOString()
    }
    saveToLocalStorage(syncedRecord)
    return { success: true, record: syncedRecord }
  } catch (error) {
    console.error('Gagal melakukan sinkronisasi data ke Firestore:', error)
    // Gagal: Tampilkan penyebab dan simpan status Gagal untuk retry
    const failedRecord = {
      ...pendingRecord,
      syncStatus: SYNC_STATUS.FAILED,
      syncError: error.message || 'Gagal terhubung ke Firestore'
    }
    saveToLocalStorage(failedRecord)
    return {
      success: false,
      record: failedRecord,
      error: failedRecord.syncError
    }
  }
}

/**
 * Retry sinkronisasi menggunakan ID percobaan yang sama persis
 * @param {import('firebase/auth').User | null} user
 * @returns {Promise<{ success: boolean, record: Object, error?: string }>}
 */
export async function retrySyncQuiz(user) {
  const current = getStoredQuizData()
  return await syncQuizToFirestore(user, current)
}

// ========================================================
// PENGELOLAAN DATA SINTAKS POE (Predict, Observe, Explain)
// ========================================================

/**
 * Struktur default catatan POE
 */
export function getDefaultPoeRecord(moduleId = 'faktor-laju') {
  return {
    id: generateAttemptId(),
    moduleId,
    predictChoiceId: null,
    predictText: '',
    observeNotes: '',
    explainText: '',
    isSubmitted: false,
    syncStatus: SYNC_STATUS.LOCAL,
    syncError: null,
    submittedAt: null,
    lastSyncedAt: null,
    ownerId: 'guest',
    alias: 'Siswa Tamu',
    userEmail: null
  }
}

/**
 * Membaca semua catatan POE dari localStorage
 * @returns {Record<string, Object>}
 */
export function getAllStoredPoeSubmissions() {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_POE_RECORDS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Membaca catatan POE untuk satu modul tertentu
 * @param {string} moduleId
 * @returns {Object}
 */
export function getStoredPoeData(moduleId) {
  const all = getAllStoredPoeSubmissions()
  return all[moduleId] || getDefaultPoeRecord(moduleId)
}

/**
 * Menyimpan draf pengerjaan POE ke localStorage
 */
export function savePoeDraft({ moduleId, predictChoiceId, predictText, observeNotes, explainText }) {
  if (typeof window === 'undefined' || !window.localStorage) return null
  const all = getAllStoredPoeSubmissions()
  const existing = all[moduleId] || getDefaultPoeRecord(moduleId)
  const updated = {
    ...existing,
    moduleId,
    predictChoiceId: predictChoiceId !== undefined ? predictChoiceId : existing.predictChoiceId,
    predictText: predictText !== undefined ? predictText : existing.predictText,
    observeNotes: observeNotes !== undefined ? observeNotes : existing.observeNotes,
    explainText: explainText !== undefined ? explainText : existing.explainText,
    updatedAt: new Date().toISOString()
  }
  all[moduleId] = updated
  try {
    window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
  } catch (e) {
    console.warn('Gagal menyimpan draf POE ke localStorage:', e)
  }
  return updated
}

/**
 * Menyimpan submission final POE siswa
 */
export function savePoeSubmission({
  moduleId,
  predictChoiceId,
  predictText,
  observeNotes,
  explainText,
  currentUser,
  isGuest
}) {
  if (typeof window === 'undefined' || !window.localStorage) return null
  const all = getAllStoredPoeSubmissions()
  const existing = all[moduleId] || getDefaultPoeRecord(moduleId)
  const ownerId = currentUser?.uid || (isGuest ? 'guest' : 'local-user')
  const alias = currentUser?.displayName || currentUser?.email?.split('@')[0] || (isGuest ? 'Siswa Tamu' : 'Siswa')
  const userEmail = currentUser?.email || null

  const submittedRecord = {
    ...existing,
    moduleId,
    predictChoiceId: predictChoiceId ?? existing.predictChoiceId,
    predictText: predictText ?? existing.predictText,
    observeNotes: observeNotes ?? existing.observeNotes,
    explainText: explainText ?? existing.explainText,
    isSubmitted: true,
    submittedAt: new Date().toISOString(),
    ownerId,
    alias,
    userEmail,
    syncStatus: currentUser?.uid ? SYNC_STATUS.PENDING : SYNC_STATUS.LOCAL,
    syncError: null
  }
  all[moduleId] = submittedRecord
  try {
    window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
  } catch (e) {
    console.warn('Gagal menyimpan submission POE:', e)
  }
  return submittedRecord
}

/**
 * Sinkronisasi data sintaks POE ke Firestore
 */
export async function syncPoeToFirestore(user, moduleId) {
  const all = getAllStoredPoeSubmissions()
  const record = all[moduleId]
  if (!record) return { success: false, error: 'Data POE tidak ditemukan' }

  if (!user || !user.uid) {
    const updated = {
      ...record,
      syncStatus: SYNC_STATUS.LOCAL,
      syncError: 'Pengguna belum login Google'
    }
    all[moduleId] = updated
    try {
      window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
    } catch (e) {
      console.warn(e)
    }
    return { success: false, record: updated, error: 'Belum login' }
  }

  const pendingRecord = {
    ...record,
    ownerId: user.uid,
    alias: user.displayName || user.email?.split('@')[0] || 'Siswa',
    userEmail: user.email || null,
    syncStatus: SYNC_STATUS.PENDING,
    syncError: null
  }
  all[moduleId] = pendingRecord
  try {
    window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
  } catch (e) {
    console.warn(e)
  }

  try {
    const firestorePayload = {
      id: pendingRecord.id,
      ownerId: user.uid,
      alias: pendingRecord.alias,
      userEmail: pendingRecord.userEmail,
      moduleId: pendingRecord.moduleId,
      activityId: `poe-${pendingRecord.moduleId}`,
      predictChoiceId: pendingRecord.predictChoiceId,
      predictText: pendingRecord.predictText,
      observeNotes: pendingRecord.observeNotes,
      explainText: pendingRecord.explainText,
      submittedAt: pendingRecord.submittedAt || new Date().toISOString(),
      receivedAt: serverTimestamp(),
      lastSyncedAt: new Date().toISOString()
    }

    const docId = `${user.uid}_${pendingRecord.moduleId}`
    const docRef = doc(db, 'poe_submissions', docId)
    await setDoc(docRef, firestorePayload, { merge: true })

    const syncedRecord = {
      ...pendingRecord,
      syncStatus: SYNC_STATUS.SYNCED,
      syncError: null,
      lastSyncedAt: new Date().toISOString()
    }
    all[moduleId] = syncedRecord
    try {
      window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
    } catch (e) {
      console.warn(e)
    }
    return { success: true, record: syncedRecord }
  } catch (error) {
    console.error('Gagal sinkronisasi data POE ke Firestore:', error)
    const failedRecord = {
      ...pendingRecord,
      syncStatus: SYNC_STATUS.FAILED,
      syncError: error.message || 'Gagal terhubung ke Firestore'
    }
    all[moduleId] = failedRecord
    try {
      window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
    } catch (e) {
      console.warn(e)
    }
    return { success: false, record: failedRecord, error: failedRecord.syncError }
  }
}

// Sistem Listener / Observer sederhana untuk notifikasi perubahan status sinkronisasi
const listeners = new Set()

export function subscribeSyncStatus(callback) {
  listeners.add(callback)
  // Segera berikan status saat ini
  callback(getStoredQuizData())
  return () => {
    listeners.delete(callback)
  }
}

function notifySyncListeners(record) {
  listeners.forEach((cb) => {
    try {
      cb(record)
    } catch (err) {
      console.warn('Error in sync listener:', err)
    }
  })
}

export default {
  SYNC_STATUS,
  STORAGE_KEY_QUIZ,
  STORAGE_KEY_POE_RECORDS,
  STORAGE_KEY_SYNC,
  LEGACY_STORAGE_KEY,
  generateAttemptId,
  getDefaultRecord,
  getStoredQuizData,
  saveQuizDraft,
  saveQuizSubmission,
  resetQuizData,
  syncQuizToFirestore,
  retrySyncQuiz,
  subscribeSyncStatus,
  getDefaultPoeRecord,
  getAllStoredPoeSubmissions,
  getStoredPoeData,
  savePoeDraft,
  savePoeSubmission,
  syncPoeToFirestore
}

