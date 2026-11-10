import React, { useState, useEffect } from 'react'
import {
  HardDrive,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  LogOut,
  ChevronDown,
  CloudUpload,
  UserCheck
} from 'lucide-react'
import {
  loginWithGoogle,
  logoutUser,
  subscribeToAuth
} from '../lib/firebase'
import {
  SYNC_STATUS,
  getStoredQuizData,
  syncQuizToFirestore,
  retrySyncQuiz,
  subscribeSyncStatus
} from '../utils/storage'

export default function GoogleAuthButton({ onSyncComplete }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [quizRecord, setQuizRecord] = useState(() => getStoredQuizData())
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSyncPrompt, setShowSyncPrompt] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [actionError, setActionError] = useState(null)

  // 1. Berlangganan perubahan status sesi autentikasi Firebase
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user)
      setAuthLoading(false)
      setActionError(null)

      // Slide 11: Ketika login, jika ada data kuis lokal, tawarkan untuk sinkronisasi ke akun
      if (user) {
        const currentData = getStoredQuizData()
        if (
          currentData &&
          (Object.keys(currentData.answers || {}).length > 0 || currentData.isSubmitted) &&
          currentData.syncStatus !== SYNC_STATUS.SYNCED
        ) {
          setShowSyncPrompt(true)
        }
      }
    })

    // 2. Berlangganan perubahan data storage kuis & status sinkronisasi
    const unsubscribeStorage = subscribeSyncStatus((updated) => {
      setQuizRecord(updated)
    })

    return () => {
      unsubscribeAuth()
      unsubscribeStorage()
    }
  }, [])

  // Handler Login dengan Google Popup
  const handleGoogleLogin = async () => {
    setActionError(null)
    try {
      setAuthLoading(true)
      const credential = await loginWithGoogle()
      const user = credential.user
      setCurrentUser(user)

      // Cek apakah ada draf atau hasil kuis lokal yang bisa disinkronkan
      const localData = getStoredQuizData()
      const hasAnswers = localData && Object.keys(localData.answers || {}).length > 0
      if (hasAnswers) {
        setShowSyncPrompt(true)
      }
    } catch (err) {
      console.warn('Login Google dibatalkan atau gagal:', err)
      if (err.code !== 'auth/popup-closed-by-user') {
        setActionError(err.message || 'Gagal login Google')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  // Handler Logout
  const handleLogout = async () => {
    setUserDropdownOpen(false)
    try {
      await logoutUser()
      setCurrentUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Handler Konfirmasi Sinkronisasi ke Firestore (Idempoten)
  const handleConfirmSync = async () => {
    if (!currentUser) return
    setIsSyncing(true)
    setShowSyncPrompt(false)
    setActionError(null)

    try {
      const res = await syncQuizToFirestore(currentUser)
      if (res.success) {
        if (onSyncComplete) onSyncComplete(res.record)
      } else {
        setActionError(res.error || 'Gagal mengirim data')
      }
    } catch (err) {
      setActionError(err.message || 'Kesalahan saat sinkronisasi')
    } finally {
      setIsSyncing(false)
    }
  }

  // Handler Retry pengiriman (Idempotensi: ID percobaan yang sama tetap dipakai)
  const handleRetry = async () => {
    if (!currentUser) {
      handleGoogleLogin()
      return
    }

    setIsSyncing(true)
    setActionError(null)

    try {
      const res = await retrySyncQuiz(currentUser)
      if (res.success) {
        if (onSyncComplete) onSyncComplete(res.record)
      } else {
        setActionError(res.error || 'Gagal mengirim ulang data')
      }
    } catch (err) {
      setActionError(err.message || 'Gagal mengirim ulang')
    } finally {
      setIsSyncing(false)
    }
  }

  // Helper render status pengiriman data (Slide 12: Lokal, Menunggu Kirim, Terkirim, Gagal)
  const renderSyncBadge = () => {
    const status = isSyncing ? SYNC_STATUS.PENDING : quizRecord?.syncStatus || SYNC_STATUS.LOCAL

    switch (status) {
      case SYNC_STATUS.SYNCED:
        return (
          <div
            className="sync-badge badge-synced"
            title="Data kuis terkirim dan tersimpan aman di server dengan ID percobaan yang sama."
          >
            <CheckCircle2 size={13} className="sync-icon" />
            <span className="sync-label">{SYNC_STATUS.SYNCED}</span>
          </div>
        )

      case SYNC_STATUS.PENDING:
        return (
          <div
            className="sync-badge badge-pending"
            title="Data kuis sedang dalam proses pengiriman ke Firestore..."
          >
            <Loader2 size={13} className="sync-icon spin" />
            <span className="sync-label">{SYNC_STATUS.PENDING}</span>
          </div>
        )

      case SYNC_STATUS.FAILED:
        return (
          <div className="sync-failed-group">
            <div
              className="sync-badge badge-failed"
              title={quizRecord?.syncError || 'Pengiriman ke server gagal.'}
            >
              <AlertCircle size={13} className="sync-icon" />
              <span className="sync-label">{SYNC_STATUS.FAILED}</span>
            </div>
            <button
              type="button"
              className="btn-retry-sync"
              onClick={handleRetry}
              disabled={isSyncing}
              title="Coba kirim lagi data ke server menggunakan ID yang sama (Idempoten)"
            >
              <RotateCw size={12} className={isSyncing ? 'spin' : ''} />
              <span>Coba Lagi</span>
            </button>
          </div>
        )

      case SYNC_STATUS.LOCAL:
      default:
        return (
          <div
            className="sync-badge badge-local"
            title="Data tersimpan di perangkat lokal (localStorage). Belum dikaitkan ke akun."
          >
            <HardDrive size={13} className="sync-icon" />
            <span className="sync-label">{SYNC_STATUS.LOCAL}</span>
          </div>
        )
    }
  }

  return (
    <div className="auth-sync-container">
      {/* 1. Indikator Status Pengiriman Data (Lokal / Menunggu Kirim / Terkirim / Gagal) */}
      <div className="sync-status-wrapper">
        <span className="sync-label-prefix">Status Data:</span>
        {renderSyncBadge()}
      </div>

      {/* 2. Tombol Login Google / Profil Siswa */}
      {authLoading ? (
        <div className="auth-btn-skeleton">
          <Loader2 size={16} className="spin" />
        </div>
      ) : currentUser ? (
        /* Status: Sudah Login Google */
        <div className="user-profile-menu">
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-expanded={userDropdownOpen}
            title={`Akun aktif: ${currentUser.displayName || currentUser.email}`}
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Pengguna'}
                className="user-avatar-img"
              />
            ) : (
              <div className="user-avatar-fallback">
                {(currentUser.displayName || currentUser.email || 'S')[0].toUpperCase()}
              </div>
            )}
            <span className="user-display-name">
              {currentUser.displayName || currentUser.email?.split('@')[0]}
            </span>
            <ChevronDown size={14} className={`dropdown-arrow ${userDropdownOpen ? 'open' : ''}`} />
          </button>

          {/* Dropdown Menu Pengguna */}
          {userDropdownOpen && (
            <div className="user-dropdown-popover">
              <div className="user-dropdown-header">
                <strong>{currentUser.displayName || 'Siswa KimiaKu'}</strong>
                <small>{currentUser.email}</small>
                <div className="user-status-pill">
                  <UserCheck size={12} />
                  <span>Akun Google Aktif</span>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              {/* Tombol sinkronkan manual jika status lokal atau gagal */}
              {quizRecord &&
                quizRecord.syncStatus !== SYNC_STATUS.SYNCED &&
                Object.keys(quizRecord.answers || {}).length > 0 && (
                  <button
                    type="button"
                    className="dropdown-action-btn sync-action"
                    onClick={handleConfirmSync}
                    disabled={isSyncing}
                  >
                    <CloudUpload size={14} />
                    <span>Kirim Hasil Kuis ke Akun</span>
                  </button>
                )}

              <button
                type="button"
                className="dropdown-action-btn logout-action"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Status: Belum Login (Tamu / Lokal) */
        <button
          type="button"
          className="btn-google-login"
          onClick={handleGoogleLogin}
          title="Masuk dengan akun Google untuk menyinkronkan hasil belajar ke cloud"
        >
          {/* Logo Asli Google (SVG) */}
          <svg className="google-icon-svg" viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="btn-text">Login Google</span>
        </button>
      )}

      {/* 3. Modal Konfirmasi Pemilik Hasil Kuis (PPT Pertemuan 04 Slide 11) */}
      {showSyncPrompt && currentUser && (
        <div className="modal-overlay" onClick={() => setShowSyncPrompt(false)}>
          <div
            className="modal-content sync-prompt-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="prompt-header">
              <CloudUpload size={24} className="prompt-icon text-coral" />
              <h3>Simpan Hasil Belajar ke Akun</h3>
            </div>

            <p className="prompt-desc">
              Ditemukan data kuis di perangkat ini. Apakah Anda ingin mengaitkan dan menyimpan hasil ini ke akun:
            </p>

            <div className="prompt-user-card">
              <strong>{currentUser.displayName || 'Siswa'}</strong>
              <span>{currentUser.email}</span>
            </div>

            <div className="prompt-detail-card">
              <div className="prompt-detail-row">
                <span>Modul:</span>
                <strong>Faktor Laju Reaksi (v1)</strong>
              </div>
              <div className="prompt-detail-row">
                <span>ID Percobaan:</span>
                <code>{quizRecord?.id || 'attempt-local'}</code>
              </div>
              <div className="prompt-detail-row">
                <span>Status Jawaban:</span>
                <strong>
                  {quizRecord?.isSubmitted
                    ? `Selesai (Skor: ${quizRecord.score}%)`
                    : `Draf (${Object.keys(quizRecord?.answers || {}).length} soal)`}
                </strong>
              </div>
            </div>

            <p className="prompt-note">
              Hasil yang dikirim ke akun dapat ditinjau oleh guru kelas. Hasil di server menggunakan ID percobaan yang sama sehingga pengiriman ulang tidak membuat catatan duplikat (Idempoten).
            </p>

            {actionError && (
              <div className="prompt-error-alert">
                <AlertCircle size={15} />
                <span>{actionError}</span>
              </div>
            )}

            <div className="prompt-actions-row">
              <button
                type="button"
                className="btn-prompt-cancel"
                onClick={() => setShowSyncPrompt(false)}
              >
                Nanti Saja (Tetap Lokal)
              </button>
              <button
                type="button"
                className="btn-prompt-confirm"
                onClick={handleConfirmSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload size={16} />
                    <span>Simpan ke Akun Ini</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

