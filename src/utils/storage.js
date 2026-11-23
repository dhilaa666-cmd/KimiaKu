/**
 * Pengelolaan Data Local-First KimiaKu
 * Sesuai panduan PPT Pertemuan 04, DATABASE.md, dan PRD.md:
 * - Kunci localStorage diawali dengan prefix 'kimiaku-'
 * - Idempotensi: ID percobaan dibuat SEKALI saat mulai percobaan dan dipertahankan saat retry
 * - Status pengiriman: Lokal | Menunggu Kirim | Terkirim | Gagal
 * - Isolasi Akun (Temuan 03-02 & 03-12):
 *   Setiap akun (UID) dan Tamu ('guest') memiliki partisi kunci localStorage tersendiri.
 *   Klaim data hanya diperbolehkan untuk record guest yang belum memiliki pemilik.
 */

import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// Kunci penyimpanan localStorage
export const STORAGE_PREFIX = 'kimiaku-'
export const GUEST_USER_ID = 'guest'
export const STORAGE_KEY_QUIZ = 'kimiaku-kuis-data'
export const STORAGE_KEY_POE_RECORDS = 'kimiaku-poe-submissions'
export const STORAGE_KEY_SYNC = 'kimiaku-sync-status'
export const LEGACY_STORAGE_KEY = 'kimiaku:laju-reaksi:v1'

/**
 * Mendapatkan identitas akun aktif yang konsisten (UID atau 'guest')
 * @param {string|null} [explicitUserId]
 * @returns {string}
 */
export function resolveAccountKey(explicitUserId) {
  if (explicitUserId && typeof explicitUserId === 'string' && explicitUserId.trim()) {
    return explicitUserId.trim()
  }
  return GUEST_USER_ID
}

/**
 * Menghasilkan key localStorage yang terisolasi per akun (Temuan 03-02)
 * Contoh: 'kimiaku-kuis-data-guest' atau 'kimiaku-kuis-data-12345UID'
 * @param {string|null} [userId]
 * @returns {string}
 */
export function getQuizStorageKey(userId = null) {
  const accountKey = resolveAccountKey(userId)
  return `${STORAGE_PREFIX}kuis-data-${accountKey}`
}

/**
 * Menghasilkan key localStorage catatan POE yang terisolasi per akun
 * @param {string|null} [userId]
 * @returns {string}
 */
export function getPoeStorageKey(userId = null) {
  const accountKey = resolveAccountKey(userId)
  return `${STORAGE_PREFIX}poe-submissions-${accountKey}`
}

/**
 * Menghasilkan key localStorage riwayat percobaan kuis per akun (Temuan 03-04)
 * @param {string|null} [userId]
 * @returns {string}
 */
export function getQuizHistoryStorageKey(userId = null) {
  const accountKey = resolveAccountKey(userId)
  return `${STORAGE_PREFIX}kuis-history-${accountKey}`
}

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
 * @param {string|null} [userId=null]
 */
export function getDefaultRecord(userId = null) {
  const accountKey = resolveAccountKey(userId)
  return {
    id: generateAttemptId(), // ID tetap untuk idempotensi
    ownerId: accountKey,
    alias: accountKey === GUEST_USER_ID ? 'Tamu' : 'Siswa',
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
 * Memeriksa apakah error yang terjadi merupakan QuotaExceededError pada localStorage
 * @param {any} err
 * @returns {boolean}
 */
export function isQuotaExceededError(err) {
  return Boolean(
    err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014 ||
        err.number === -2147024882 ||
        (typeof err.message === 'string' && err.message.toLowerCase().includes('quota')))
  )
}

/**
 * Membaca data kuis dari localStorage (Local First) terisolasi per akun (Temuan 03-02)
 * @param {string|null} [userId=null] UID pengguna atau 'guest'
 * @returns {Object}
 */
export function getStoredQuizData(userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultRecord(userId)
  }

  const accountKey = resolveAccountKey(userId)
  const targetKey = getQuizStorageKey(accountKey)

  try {
    let raw = window.localStorage.getItem(targetKey)

    // Fallback migrasi kompatibilitas:
    // Jika mencari data guest dan key baru belum ada, periksa key global lama
    if (!raw && accountKey === GUEST_USER_ID) {
      raw = window.localStorage.getItem(STORAGE_KEY_QUIZ)
      if (!raw) {
        raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
      }
    }

    if (!raw) {
      const initial = getDefaultRecord(accountKey)
      saveToLocalStorage(initial, accountKey)
      return initial
    }

    const parsed = JSON.parse(raw)
    const record = {
      id: parsed.id || generateAttemptId(),
      ownerId: parsed.ownerId || accountKey,
      alias: parsed.alias || (accountKey === GUEST_USER_ID ? 'Tamu' : 'Siswa'),
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

    // Pastikan key terisolasi terisi
    if (!window.localStorage.getItem(targetKey)) {
      saveToLocalStorage(record, accountKey)
    }

    return record
  } catch (err) {
    console.warn(`Gagal membaca data kuis localStorage untuk ${accountKey}:`, err)
    return getDefaultRecord(accountKey)
  }
}

/**
 * Menyimpan data record kuis ke localStorage secara aman dengan isolasi UID (Temuan 03-02)
 * @param {Object} record
 * @param {string|null} [userId=null]
 * @returns {{ success: boolean, error: Error | null, isQuotaExceeded: boolean }}
 */
export function saveToLocalStorage(record, userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      success: false,
      error: new Error('localStorage tidak didukung atau tidak tersedia pada peramban.'),
      isQuotaExceeded: false
    }
  }

  const accountKey = resolveAccountKey(userId || record?.ownerId)
  const targetKey = getQuizStorageKey(accountKey)

  try {
    const serialized = JSON.stringify(record)
    window.localStorage.setItem(targetKey, serialized)

    // Jika mode tamu, sinkronkan juga ke fallback key global untuk backward compatibility
    if (accountKey === GUEST_USER_ID) {
      window.localStorage.setItem(STORAGE_KEY_QUIZ, serialized)
      window.localStorage.setItem(LEGACY_STORAGE_KEY, serialized)
    }

    notifySyncListeners(record)
    return {
      success: true,
      error: null,
      isQuotaExceeded: false
    }
  } catch (err) {
    const isQuota = isQuotaExceededError(err)
    console.warn(`Gagal menyimpan record kuis ke localStorage [${targetKey}]:`, err)
    return {
      success: false,
      error: err,
      isQuotaExceeded: isQuota
    }
  }
}

/**
 * Menyimpan draf jawaban yang sedang dipilih siswa ke localStorage terisolasi per akun
 * @param {Object} answers Peta id soal ke pilihan siswa
 * @param {string|null} [userId=null]
 * @returns {{ success: boolean, error: Error | null, isQuotaExceeded: boolean, record: Object } & Object}
 */
export function saveQuizDraft(answers, userId = null) {
  const accountKey = resolveAccountKey(userId)
  const current = getStoredQuizData(accountKey)
  const updated = {
    ...current,
    ownerId: accountKey,
    answers: { ...answers },
    syncStatus: current.syncStatus === SYNC_STATUS.SYNCED ? SYNC_STATUS.PENDING : current.syncStatus,
    syncError: null
  }
  const saveResult = saveToLocalStorage(updated, accountKey)
  return {
    success: saveResult.success,
    error: saveResult.error,
    isQuotaExceeded: saveResult.isQuotaExceeded,
    record: updated,
    ...updated
  }
}

/**
 * Menyimpan hasil akhir kuis yang telah disubmit secara lokal terisolasi per akun
 * @param {Object} param0 { answers, score }
 * @param {string|null} [userId=null]
 * @returns {{ success: boolean, error: Error | null, isQuotaExceeded: boolean, record: Object } & Object}
 */
export function saveQuizSubmission({ answers, score }, userId = null) {
  const accountKey = resolveAccountKey(userId)
  const current = getStoredQuizData(accountKey)
  const updated = {
    ...current,
    ownerId: accountKey,
    answers: answers || current.answers || {},
    score: Math.round(score),
    completedAt: new Date().toISOString(),
    isSubmitted: true,
    syncStatus: accountKey !== GUEST_USER_ID ? SYNC_STATUS.PENDING : SYNC_STATUS.LOCAL,
    syncError: null
  }
  const saveResult = saveToLocalStorage(updated, accountKey)

  // Otomatis simpan ke arsip riwayat percobaan (Temuan 03-04)
  archiveQuizAttempt(updated, accountKey)

  return {
    success: saveResult.success,
    error: saveResult.error,
    isQuotaExceeded: saveResult.isQuotaExceeded,
    record: updated,
    ...updated
  }
}

/**
 * Membaca riwayat seluruh percobaan kuis yang diarsipkan untuk akun aktif (Temuan 03-04)
 * @param {string|null} [userId=null]
 * @returns {Array<Object>}
 */
export function getQuizHistory(userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) return []
  const accountKey = resolveAccountKey(userId)
  const targetKey = getQuizHistoryStorageKey(accountKey)
  try {
    const raw = window.localStorage.getItem(targetKey)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.warn(`Gagal membaca riwayat kuis [${targetKey}]:`, e)
    return []
  }
}

/**
 * Mengarsipkan hasil kuis ke daftar riwayat percobaan sebelum direset (Temuan 03-04)
 * @param {Object} record
 * @param {string|null} [userId=null]
 * @returns {Array<Object>}
 */
export function archiveQuizAttempt(record, userId = null) {
  if (typeof window === 'undefined' || !window.localStorage || !record) return []
  const accountKey = resolveAccountKey(userId || record.ownerId)
  const targetKey = getQuizHistoryStorageKey(accountKey)
  const history = getQuizHistory(accountKey)

  // Hanya arsipkan jika ada aktivitas pengerjaan atau telah disubmit
  const hasContent =
    Boolean(record.isSubmitted) ||
    typeof record.score === 'number' ||
    Object.keys(record.answers || {}).length > 0

  if (!hasContent) return history

  const existingIndex = history.findIndex((h) => h.id === record.id)
  const archivedRecord = {
    ...record,
    archivedAt: new Date().toISOString()
  }

  if (existingIndex >= 0) {
    history[existingIndex] = archivedRecord
  } else {
    // Tambahkan di awal agar riwayat terbaru tampil paling atas
    history.unshift(archivedRecord)
  }

  try {
    window.localStorage.setItem(targetKey, JSON.stringify(history))
  } catch (e) {
    console.warn(`Gagal menyimpan arsip riwayat kuis ke [${targetKey}]:`, e)
  }

  return history
}

/**
 * Mereset data kuis untuk sesi akun saat ini (Temuan 03-04)
 * Tidak menghapus riwayat hasil sebelumnya, melainkan mengarsipkannya
 * sebelum membuat ID percobaan baru.
 * @param {string|null} [userId=null]
 * @returns {{ success: boolean, error: Error | null, isQuotaExceeded: boolean, record: Object, history: Array<Object> } & Object}
 */
export function resetQuizData(userId = null) {
  const accountKey = resolveAccountKey(userId)
  const current = getStoredQuizData(accountKey)

  // Simpan hasil kuis yang sudah selesai/dikerjakan ke daftar arsip sebelum reset
  const history = archiveQuizAttempt(current, accountKey)

  // Buat sesi pengerjaan baru yang bersih dengan ID percobaan baru
  const newRecord = getDefaultRecord(accountKey)
  const saveResult = saveToLocalStorage(newRecord, accountKey)

  return {
    success: saveResult.success,
    error: saveResult.error,
    isQuotaExceeded: saveResult.isQuotaExceeded,
    record: newRecord,
    history,
    ...newRecord
  }
}

/**
 * Membersihkan slot data kuis milik tamu (Guest)
 * Dipanggil saat data guest berhasil diklaim ke akun siswa login
 */
export function clearGuestQuizData() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.removeItem(getQuizStorageKey(GUEST_USER_ID))
    window.localStorage.removeItem(STORAGE_KEY_QUIZ)
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    window.localStorage.removeItem(STORAGE_KEY_SYNC)
  } catch (err) {
    console.warn('Gagal membersihkan data kuis guest:', err)
  }
}

/**
 * Memeriksa apakah data kuis lokal memenuhi syarat untuk diklaim ke akun (Temuan 03-12)
 * Syarat ketat:
 * 1. Data harus berstatus guest / belum ada pemilik (ownerId === 'guest' atau kosong)
 * 2. Memiliki jawaban atau pengerjaan kuis
 * 3. Belum pernah disinkronkan ke cloud
 * @param {import('firebase/auth').User | null} user
 * @returns {boolean}
 */
export function canClaimGuestQuizData(user) {
  if (!user || !user.uid) return false
  const guestData = getStoredQuizData(GUEST_USER_ID)
  if (!guestData) return false

  const isGuestOwner = !guestData.ownerId || guestData.ownerId === GUEST_USER_ID
  const hasContent = (Object.keys(guestData.answers || {}).length > 0) || Boolean(guestData.isSubmitted)
  const isNotYetSynced = guestData.syncStatus !== SYNC_STATUS.SYNCED

  return isGuestOwner && hasContent && isNotYetSynced
}

/**
 * Fungsi Sinkronisasi ke Firestore saat siswa login Google
 * Menerapkan IDEMPOTENSI PENUH (Slide 13) dan ISOLASI AKUN KETAT (Temuan 03-12):
 * - Memeriksa status kepemilikan record sebelum klaim
 * - JANGAN PERNAH menimpa ownerId jika record tersebut sudah dimiliki oleh UID lain!
 *
 * @param {import('firebase/auth').User | null} user Pengguna Google yang aktif
 * @param {Object} [customRecord=null] Record kuis opsional yang ingin diklaim
 * @returns {Promise<{ success: boolean, record: Object, error?: string, offline?: boolean, message?: string }>}
 */
export async function syncQuizToFirestore(user, customRecord = null) {
  // Jika siswa belum login, status tetap Lokal
  if (!user || !user.uid) {
    const record = customRecord ? { ...customRecord } : getStoredQuizData(GUEST_USER_ID)
    const updated = {
      ...record,
      syncStatus: SYNC_STATUS.LOCAL,
      syncError: 'Pengguna belum login Google'
    }
    saveToLocalStorage(updated, GUEST_USER_ID)
    return { success: false, record: updated, error: 'Belum login' }
  }

  // Tentukan record yang akan disinkronkan
  let record = customRecord ? { ...customRecord } : null
  if (!record) {
    // Cek apakah user sudah punya data kuis tersimpan di key akunnya
    const userRecord = getStoredQuizData(user.uid)
    const hasUserData = userRecord && (Object.keys(userRecord.answers || {}).length > 0 || userRecord.isSubmitted)
    if (hasUserData) {
      record = userRecord
    } else {
      // Fallback ke data guest lokal jika user belum punya data di akunnya
      record = getStoredQuizData(GUEST_USER_ID)
    }
  }

  // TEMUAN 03-12: Batasi pengaitan hanya untuk data yang berstatus guest/belum memiliki pemilik!
  // Jangan pernah menimpa ownerId jika record tersebut sudah dimiliki oleh UID akun lain.
  const currentOwner = record.ownerId
  const isGuestRecord = !currentOwner || currentOwner === GUEST_USER_ID
  const isOwnedByCurrentUser = currentOwner === user.uid

  if (!isGuestRecord && !isOwnedByCurrentUser) {
    const errorMsg = `Akses ditolak: Data kuis ini telah dimiliki oleh akun lain (${currentOwner}). Pengaitan data ke akun Anda (${user.uid}) dibatalkan demi keamanan dan isolasi akun.`
    console.warn(`[KimiaKu Auth Isolation] ${errorMsg}`)
    return {
      success: false,
      record,
      error: errorMsg
    }
  }

  const isClaimingFromGuest = isGuestRecord && record.ownerId !== user.uid

  // Tandai status sedang Menunggu Kirim di slot akun user
  const pendingRecord = {
    ...record,
    ownerId: user.uid,
    alias: user.displayName || user.email?.split('@')[0] || 'Siswa',
    userEmail: user.email || null,
    syncStatus: SYNC_STATUS.PENDING,
    syncError: null
  }
  saveToLocalStorage(pendingRecord, user.uid)

  // Jika mengklaim dari data guest, bersihkan slot data guest segera
  // agar mode tamu berikutnya atau akun lain tidak melihat/mengklaim ulang data yang sama
  if (isClaimingFromGuest) {
    clearGuestQuizData()
  }

  // Jika Firebase belum aktif / offline / tanpa API key, sukseskan pengalihan data lokal
  if (!db) {
    const offlineRecord = {
      ...pendingRecord,
      syncStatus: SYNC_STATUS.LOCAL,
      syncError: 'Firebase Firestore belum dikonfigurasi atau sedang luring.'
    }
    saveToLocalStorage(offlineRecord, user.uid)
    return {
      success: true,
      record: offlineRecord,
      offline: true,
      message: 'Data kuis berhasil dialihkan ke akun lokal Anda.'
    }
  }

  try {
    // Siapkan payload sesuai Kontrak Hasil Belajar (Slide 10)
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
      receivedAt: serverTimestamp(),
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
    saveToLocalStorage(syncedRecord, user.uid)

    return { success: true, record: syncedRecord }
  } catch (error) {
    console.error('Gagal melakukan sinkronisasi data ke Firestore:', error)
    const failedRecord = {
      ...pendingRecord,
      syncStatus: SYNC_STATUS.FAILED,
      syncError: error.message || 'Gagal terhubung ke Firestore'
    }
    saveToLocalStorage(failedRecord, user.uid)
    return { success: false, record: failedRecord, error: error.message }
  }
}

/**
 * Mencoba ulang pengiriman kuis yang berstatus Gagal (Retry Idempoten)
 * @param {import('firebase/auth').User | null} user
 * @returns {Promise<{ success: boolean, record: Object, error?: string }>}
 */
export async function retrySyncQuiz(user) {
  return syncQuizToFirestore(user)
}

// ----------------------------------------------------
// Listener & Observers Sinkronisasi Antar Komponen
// ----------------------------------------------------
const syncListeners = new Set()

export function subscribeSyncStatus(callback) {
  syncListeners.add(callback)
  return () => syncListeners.delete(callback)
}

function notifySyncListeners(record) {
  syncListeners.forEach((cb) => {
    try {
      cb(record)
    } catch (e) {
      console.error('Error in sync listener:', e)
    }
  })
}

// ----------------------------------------------------
// Modul Penyimpanan Sintaks POE Siswa
// ----------------------------------------------------

export function getDefaultPoeRecord(moduleId) {
  return {
    id: generateAttemptId(),
    moduleId,
    predictChoiceId: '',
    predictText: '',
    observeNotes: '',
    explainText: '',
    isSubmitted: false,
    submittedAt: null,
    syncStatus: SYNC_STATUS.LOCAL,
    syncError: null,
    ownerId: GUEST_USER_ID,
    alias: 'Siswa Tamu',
    userEmail: null
  }
}

/**
 * Membaca semua catatan POE dari localStorage terisolasi per akun
 * @param {string|null} [userId]
 * @returns {Record<string, Object>}
 */
export function getAllStoredPoeSubmissions(userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  const accountKey = resolveAccountKey(userId)
  const targetKey = getPoeStorageKey(accountKey)
  try {
    let raw = window.localStorage.getItem(targetKey)
    if (!raw && accountKey === GUEST_USER_ID) {
      raw = window.localStorage.getItem(STORAGE_KEY_POE_RECORDS)
    }
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Membaca catatan POE untuk satu modul tertentu
 * @param {string} moduleId
 * @param {string|null} [userId]
 * @returns {Object}
 */
export function getStoredPoeData(moduleId, userId = null) {
  const all = getAllStoredPoeSubmissions(userId)
  return all[moduleId] || getDefaultPoeRecord(moduleId)
}

/**
 * Menyimpan draf pengerjaan POE ke localStorage terisolasi per akun
 * @returns {{ success: boolean, error: Error | null, isQuotaExceeded: boolean, record: Object } & Object}
 */
export function savePoeDraft({ moduleId, predictChoiceId, predictText, observeNotes, explainText }, userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      success: false,
      error: new Error('localStorage tidak didukung atau tidak tersedia.'),
      isQuotaExceeded: false,
      record: null
    }
  }
  const accountKey = resolveAccountKey(userId)
  const targetKey = getPoeStorageKey(accountKey)
  const all = getAllStoredPoeSubmissions(accountKey)
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
    window.localStorage.setItem(targetKey, JSON.stringify(all))
    if (accountKey === GUEST_USER_ID) {
      window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
    }
    return {
      success: true,
      error: null,
      isQuotaExceeded: false,
      record: updated,
      ...updated
    }
  } catch (e) {
    const isQuota = isQuotaExceededError(e)
    console.warn('Gagal menyimpan draf POE ke localStorage:', e)
    return {
      success: false,
      error: e,
      isQuotaExceeded: isQuota,
      record: updated,
      ...updated
    }
  }
}

/**
 * Menyimpan submission final POE siswa terisolasi per akun
 * @returns {{ success: boolean, error: Error | null, isQuotaExceeded: boolean, record: Object } & Object}
 */
export function savePoeSubmission({
  moduleId,
  predictChoiceId,
  predictText,
  observeNotes,
  explainText,
  currentUser,
  isGuest
}, userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      success: false,
      error: new Error('localStorage tidak didukung atau tidak tersedia.'),
      isQuotaExceeded: false,
      record: null
    }
  }
  const ownerId = resolveAccountKey(userId || currentUser?.uid || (isGuest ? GUEST_USER_ID : GUEST_USER_ID))
  const targetKey = getPoeStorageKey(ownerId)
  const all = getAllStoredPoeSubmissions(ownerId)
  const existing = all[moduleId] || getDefaultPoeRecord(moduleId)
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
    syncStatus: ownerId !== GUEST_USER_ID ? SYNC_STATUS.PENDING : SYNC_STATUS.LOCAL,
    syncError: null
  }
  all[moduleId] = submittedRecord
  try {
    window.localStorage.setItem(targetKey, JSON.stringify(all))
    if (ownerId === GUEST_USER_ID) {
      window.localStorage.setItem(STORAGE_KEY_POE_RECORDS, JSON.stringify(all))
    }
    return {
      success: true,
      error: null,
      isQuotaExceeded: false,
      record: submittedRecord,
      ...submittedRecord
    }
  } catch (e) {
    const isQuota = isQuotaExceededError(e)
    console.warn('Gagal menyimpan submission POE:', e)
    return {
      success: false,
      error: e,
      isQuotaExceeded: isQuota,
      record: submittedRecord,
      ...submittedRecord
    }
  }
}

/**
 * Sinkronisasi data sintaks POE ke Firestore
 */
export async function syncPoeToFirestore(user, moduleId) {
  if (!user || !user.uid) {
    return { success: false, error: 'Pengguna belum login Google' }
  }
  const all = getAllStoredPoeSubmissions(user.uid)
  const record = all[moduleId] || getStoredPoeData(moduleId, user.uid)
  if (!record) return { success: false, error: 'Data POE tidak ditemukan' }

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
    window.localStorage.setItem(getPoeStorageKey(user.uid), JSON.stringify(all))
  } catch (e) {
    console.warn(e)
  }

  if (!db) {
    const offlineRecord = {
      ...pendingRecord,
      syncStatus: SYNC_STATUS.LOCAL,
      syncError: 'Firebase Firestore belum dikonfigurasi atau sedang luring.'
    }
    all[moduleId] = offlineRecord
    try {
      window.localStorage.setItem(getPoeStorageKey(user.uid), JSON.stringify(all))
    } catch (e) {
      console.warn(e)
    }
    return {
      success: true,
      record: offlineRecord,
      offline: true,
      message: 'Data POE tersimpan di peramban lokal.'
    }
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
      window.localStorage.setItem(getPoeStorageKey(user.uid), JSON.stringify(all))
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
      window.localStorage.setItem(getPoeStorageKey(user.uid), JSON.stringify(all))
    } catch (e) {
      console.warn(e)
    }
    return { success: false, record: failedRecord, error: error.message }
  }
}

/**
 * Mengambil nama dan email siswa pemilik rekaman (Temuan 03-06)
 * JANGAN PERNAH mengambil dari nama akun guru yang sedang login!
 * @param {Object} record
 * @returns {{ name: string, email: string, isGuest: boolean }}
 */
export function getStudentIdentity(record) {
  if (!record) {
    return {
      name: 'Siswa Tamu (Lokal)',
      email: 'sesi-lokal@kimiaku.edu',
      isGuest: true
    }
  }

  const isGuest = !record.ownerId || record.ownerId === 'guest'
  const name =
    record.alias ||
    record.ownerName ||
    record.studentName ||
    record.displayName ||
    (record.userEmail ? record.userEmail.split('@')[0] : null) ||
    (record.ownerEmail ? record.ownerEmail.split('@')[0] : null) ||
    (isGuest ? 'Siswa Tamu (Lokal)' : `Siswa (${String(record.ownerId).slice(0, 6)})`)

  const email =
    record.userEmail ||
    record.ownerEmail ||
    record.studentEmail ||
    (isGuest ? 'Mode Tamu (Lokal)' : 'Terdaftar via Google')

  return { name, email, isGuest }
}

/**
 * Membaca semua rekaman kuis yang tersimpan di localStorage (seluruh akun & guest)
 * Digunakan sebagai fallback luring untuk Panel Guru (Temuan 03-06)
 * @returns {Array<Object>}
 */
export function getAllLocalQuizSubmissions() {
  if (typeof window === 'undefined' || !window.localStorage) return []
  const submissions = []
  const seenIds = new Set()

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key) continue
      if (
        key.startsWith(STORAGE_PREFIX + 'kuis-data-') ||
        key === STORAGE_KEY_QUIZ ||
        key === LEGACY_STORAGE_KEY
      ) {
        try {
          const raw = window.localStorage.getItem(key)
          if (!raw) continue
          const record = JSON.parse(raw)
          if (record && typeof record === 'object') {
            const hasActivity =
              Boolean(record.isSubmitted) ||
              record.score !== null ||
              Object.keys(record.answers || {}).length > 0
            if (hasActivity && record.id && !seenIds.has(record.id)) {
              seenIds.add(record.id)
              submissions.push(record)
            }
          }
        } catch (e) {
          console.warn(`Gagal parse rekaman kuis lokal dari key [${key}]:`, e)
        }
      }
    }
  } catch (err) {
    console.warn('Gagal membaca daftar kuis lokal:', err)
  }

  return submissions
}

/**
 * Membaca semua rekaman pengerjaan POE yang tersimpan di localStorage (seluruh akun & guest)
 * Digunakan sebagai fallback luring untuk Panel Guru (Temuan 03-06)
 * @returns {Array<Object>}
 */
export function getAllLocalPoeSubmissions() {
  if (typeof window === 'undefined' || !window.localStorage) return []
  const submissions = []
  const seenKeys = new Set()

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key) continue
      if (
        key.startsWith(STORAGE_PREFIX + 'poe-submissions-') ||
        key === STORAGE_KEY_POE_RECORDS
      ) {
        try {
          const raw = window.localStorage.getItem(key)
          if (!raw) continue
          const data = JSON.parse(raw)
          if (data && typeof data === 'object') {
            Object.values(data).forEach((rec) => {
              if (rec && typeof rec === 'object') {
                const hasContent =
                  Boolean(rec.isSubmitted) ||
                  Boolean(rec.predictText) ||
                  Boolean(rec.explainText)
                const dedupKey = `${rec.ownerId || 'guest'}_${rec.moduleId || rec.id}`
                if (hasContent && !seenKeys.has(dedupKey)) {
                  seenKeys.add(dedupKey)
                  submissions.push(rec)
                }
              }
            })
          }
        } catch (e) {
          console.warn(`Gagal parse rekaman POE lokal dari key [${key}]:`, e)
        }
      }
    }
  } catch (err) {
    console.warn('Gagal membaca daftar POE lokal:', err)
  }

  return submissions
}

/**
 * Mengambil daftar seluruh hasil kuis siswa untuk Panel Guru
 * Membaca dari koleksi Firestore 'submissions' jika Firebase aktif,
 * dan menggabungkan / fallback ke data lokal (Temuan 03-06).
 * @returns {Promise<{ success: boolean, source: 'cloud' | 'local', submissions: Array<Object>, error?: string }>}
 */
export async function fetchClassQuizSubmissions() {
  const localList = getAllLocalQuizSubmissions()

  if (!db) {
    return {
      success: true,
      source: 'local',
      submissions: localList,
      message: 'Menampilkan data kuis tersimpan di peramban lokal (Firebase luring/belum aktif).'
    }
  }

  try {
    const colRef = collection(db, 'submissions')
    const snap = await getDocs(colRef)
    const cloudList = []
    snap.forEach((docSnap) => {
      const d = docSnap.data()
      cloudList.push({
        ...d,
        id: docSnap.id || d.id,
        isFromCloud: true,
        syncStatus: SYNC_STATUS.SYNCED
      })
    })

    // Gabungkan dengan data lokal (jika ada data siswa lokal yang belum tersinkron ke cloud)
    const cloudIds = new Set(cloudList.map((c) => c.id))
    const unSyncedLocal = localList.filter((l) => !cloudIds.has(l.id))
    const merged = [...cloudList, ...unSyncedLocal]

    // Urutkan berdasarkan waktu pengerjaan terbaru
    merged.sort((a, b) => {
      const timeA = new Date(a.completedAt || a.lastSyncedAt || 0).getTime()
      const timeB = new Date(b.completedAt || b.lastSyncedAt || 0).getTime()
      return timeB - timeA
    })

    return {
      success: true,
      source: 'cloud',
      submissions: merged
    }
  } catch (err) {
    console.warn('Gagal mengambil data kuis dari Firestore, menggunakan fallback lokal:', err)
    return {
      success: true,
      source: 'local',
      submissions: localList,
      error: err.message
    }
  }
}

/**
 * Mengambil daftar seluruh tugas POE siswa untuk Panel Guru
 * Membaca dari koleksi Firestore 'poe_submissions' jika Firebase aktif,
 * dan menggabungkan / fallback ke data lokal (Temuan 03-06).
 * @returns {Promise<{ success: boolean, source: 'cloud' | 'local', submissions: Array<Object>, error?: string }>}
 */
export async function fetchClassPoeSubmissions() {
  const localList = getAllLocalPoeSubmissions()

  if (!db) {
    return {
      success: true,
      source: 'local',
      submissions: localList,
      message: 'Menampilkan data POE tersimpan di peramban lokal (Firebase luring/belum aktif).'
    }
  }

  try {
    const colRef = collection(db, 'poe_submissions')
    const snap = await getDocs(colRef)
    const cloudList = []
    snap.forEach((docSnap) => {
      const d = docSnap.data()
      cloudList.push({
        ...d,
        id: docSnap.id || d.id,
        isFromCloud: true,
        syncStatus: SYNC_STATUS.SYNCED
      })
    })

    // Gabungkan dengan data lokal yang belum tersinkron
    const cloudKeys = new Set(cloudList.map((c) => `${c.ownerId}_${c.moduleId}`))
    const unSyncedLocal = localList.filter((l) => !cloudKeys.has(`${l.ownerId}_${l.moduleId}`))
    const merged = [...cloudList, ...unSyncedLocal]

    // Urutkan berdasarkan waktu kirim terbaru
    merged.sort((a, b) => {
      const timeA = new Date(a.submittedAt || a.lastSyncedAt || 0).getTime()
      const timeB = new Date(b.submittedAt || b.lastSyncedAt || 0).getTime()
      return timeB - timeA
    })

    return {
      success: true,
      source: 'cloud',
      submissions: merged
    }
  } catch (err) {
    console.warn('Gagal mengambil data POE dari Firestore, menggunakan fallback lokal:', err)
    return {
      success: true,
      source: 'local',
      submissions: localList,
      error: err.message
    }
  }
}
