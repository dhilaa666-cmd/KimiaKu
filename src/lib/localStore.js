/**
 * Helper Penyimpanan Local First KimiaKu (Bab 3)
 * Sesuai kontrak spesifikasi DATABASE.md:
 * - Namespace Key: 'kimiaku:laju-reaksi:v1'
 * - Penyimpanan: localStorage browser (Tanpa login / anonim)
 * - Modul: 'modul-1'
 * - Versi Soal: 'v1'
 * 
 * Struktur Record:
 * {
 *   id: string (UUID),
 *   ownerId: 'guest',
 *   moduleId: 'modul-1',
 *   questionVersion: 'v1',
 *   answers: { [soalId]: 'A' | 'B' | 'C' | 'D' },
 *   score: number | null,
 *   completedAt: string | null,
 *   isSubmitted: boolean
 * }
 */

export const STORAGE_KEY = 'kimiaku:laju-reaksi:v1'
export const MODULE_ID = 'modul-1'
export const QUESTION_VERSION = 'v1'

/**
 * Generate UUID unik untuk record kuis
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'quiz-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
}

/**
 * Nilai default record kuis
 */
export function getDefaultQuizRecord() {
  return {
    id: generateUUID(),
    ownerId: 'guest',
    moduleId: MODULE_ID,
    questionVersion: QUESTION_VERSION,
    answers: {},
    score: null,
    completedAt: null,
    isSubmitted: false
  }
}

/**
 * Membaca data kuis yang tersimpan di localStorage
 * @returns {Object} Data kuis atau default record jika belum ada
 */
export function getQuizStore() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultQuizRecord()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultQuizRecord()
    const parsed = JSON.parse(raw)
    return {
      id: parsed.id || generateUUID(),
      ownerId: parsed.ownerId || 'guest',
      moduleId: parsed.moduleId || MODULE_ID,
      questionVersion: parsed.questionVersion || QUESTION_VERSION,
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      score: typeof parsed.score === 'number' ? parsed.score : null,
      completedAt: parsed.completedAt || null,
      isSubmitted: Boolean(parsed.isSubmitted || parsed.score !== null)
    }
  } catch (err) {
    console.warn('Gagal membaca data kuis dari localStorage:', err)
    return getDefaultQuizRecord()
  }
}

/**
 * Menyimpan draf jawaban yang sedang dipilih siswa ke localStorage
 * @param {Object} answers Peta id soal ke pilihan siswa
 */
export function saveDraftAnswers(answers) {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    const current = getQuizStore()
    const updated = {
      ...current,
      answers: { ...answers },
      // Tetap dalam status draf jika belum disubmit
      isSubmitted: current.isSubmitted || false
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.warn('Gagal menyimpan draf kuis ke localStorage:', err)
  }
}

/**
 * Menyimpan hasil akhir kuis yang telah disubmit ke localStorage
 * @param {Object} param0 { answers, score }
 * @returns {Object} Record kuis yang telah disimpan
 */
export function saveQuizResult({ answers, score }) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { answers, score }
  }

  try {
    const current = getQuizStore()
    const record = {
      id: current.id || generateUUID(),
      ownerId: 'guest',
      moduleId: MODULE_ID,
      questionVersion: QUESTION_VERSION,
      answers: answers || current.answers || {},
      score: Math.round(score),
      completedAt: new Date().toISOString(),
      isSubmitted: true
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    return record
  } catch (err) {
    console.warn('Gagal menyimpan hasil kuis ke localStorage:', err)
    return { answers, score }
  }
}

/**
 * Menghapus/mengatur ulang data kuis di localStorage
 */
export function resetQuizStore() {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('Gagal mereset data kuis di localStorage:', err)
  }
}

