/**
 * Helper Penyimpanan Local First KimiaKu (Bab 3 & Pertemuan 04)
 * Menjembatani kontrak Bab 3 dengan utilitas storage terintegrasi Firebase
 */

import {
  STORAGE_KEY_QUIZ,
  LEGACY_STORAGE_KEY,
  MODULE_ID as STORAGE_MODULE_ID,
  QUESTION_VERSION as STORAGE_QUESTION_VERSION,
  generateAttemptId,
  getDefaultRecord,
  getStoredQuizData,
  saveQuizDraft,
  saveQuizSubmission,
  resetQuizData
} from '../utils/storage'

export const STORAGE_KEY = LEGACY_STORAGE_KEY
export const MODULE_ID = STORAGE_MODULE_ID
export const QUESTION_VERSION = STORAGE_QUESTION_VERSION

export const generateUUID = generateAttemptId
export const getDefaultQuizRecord = getDefaultRecord

export function getQuizStore() {
  return getStoredQuizData()
}

export function saveDraftAnswers(answers) {
  return saveQuizDraft(answers)
}

export function saveQuizResult({ answers, score }) {
  return saveQuizSubmission({ answers, score })
}

export function resetQuizStore() {
  return resetQuizData()
}

export default {
  STORAGE_KEY,
  STORAGE_KEY_QUIZ,
  MODULE_ID,
  QUESTION_VERSION,
  generateUUID,
  getDefaultQuizRecord,
  getQuizStore,
  saveDraftAnswers,
  saveQuizResult,
  resetQuizStore
}
