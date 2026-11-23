/**
 * Helper Penyimpanan Local First KimiaKu (Bab 3 & Pertemuan 04)
 * Menjembatani kontrak Bab 3 dengan utilitas storage terintegrasi Firebase
 */

import {
  STORAGE_KEY_QUIZ,
  LEGACY_STORAGE_KEY,
  GUEST_USER_ID,
  getQuizStorageKey,
  MODULE_ID as STORAGE_MODULE_ID,
  QUESTION_VERSION as STORAGE_QUESTION_VERSION,
  generateAttemptId,
  getDefaultRecord,
  getStoredQuizData,
  saveQuizDraft,
  saveQuizSubmission,
  resetQuizData,
  isQuotaExceededError,
  canClaimGuestQuizData,
  getQuizHistory,
  archiveQuizAttempt
} from '../utils/storage.js'

export const STORAGE_KEY = LEGACY_STORAGE_KEY
export const MODULE_ID = STORAGE_MODULE_ID
export const QUESTION_VERSION = STORAGE_QUESTION_VERSION

export {
  isQuotaExceededError,
  GUEST_USER_ID,
  getQuizStorageKey,
  canClaimGuestQuizData,
  getQuizHistory,
  archiveQuizAttempt
}

export const generateUUID = generateAttemptId
export const getDefaultQuizRecord = getDefaultRecord

export function getQuizStore(userId = null) {
  return getStoredQuizData(userId)
}

export function saveDraftAnswers(answers, userId = null) {
  return saveQuizDraft(answers, userId)
}

export function saveQuizResult({ answers, score }, userId = null) {
  return saveQuizSubmission({ answers, score }, userId)
}

export function resetQuizStore(userId = null) {
  return resetQuizData(userId)
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
