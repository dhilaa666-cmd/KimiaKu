import React, { useState } from 'react'
import {
  FlaskConical,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Atom,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAsGuest
} from '../lib/firebase'

/**
 * Menerjemahkan kode error Firebase Auth ke pesan bahasa Indonesia yang komunikatif
 */
function getAuthErrorMessage(errorCode, defaultMsg) {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Akun dengan email ini belum terdaftar. Silakan daftar terlebih dahulu.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi tidak sesuai. Periksa kembali entri Anda.'
    case 'auth/email-already-in-use':
      return 'Alamat email ini sudah terdaftar. Silakan beralih ke menu Masuk (Sign In).'
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek. Masukkan minimal 6 karakter.'
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid (contoh: siswa@sekolah.sch.id).'
    case 'auth/popup-closed-by-user':
      return 'Jendela masuk Google ditutup sebelum verifikasi selesai.'
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi.'
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan masuk yang gagal. Tunggu beberapa saat.'
    default:
      return defaultMsg || 'Terjadi kendala saat autentikasi. Silakan coba kembali.'
  }
}

export default function LoginPage({ onLoginSuccess, onContinueAsGuest }) {
  // Mode tampilan: 'signin' (Masuk) atau 'signup' (Daftar Akun Baru)
  const [mode, setMode] = useState('signin')

  // State form input
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // Status proses & pesan error/sukses
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // 1. Handler Login dengan Akun Google
  const handleGoogleSignIn = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setGoogleLoading(true)

    try {
      const result = await loginWithGoogle()
      if (onLoginSuccess && result.user) {
        onLoginSuccess(result.user)
      }
    } catch (err) {
      console.warn('Google sign-in error:', err)
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(getAuthErrorMessage(err.code, err.message))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  // 2. Handler Submit Form Email & Password (Sign In atau Sign Up)
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email.trim() || !password) {
      setErrorMsg('Harap lengkapi alamat email dan kata sandi Anda.')
      return
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Harap masukkan nama lengkap Anda.')
        return
      }
      if (password.length < 6) {
        setErrorMsg('Kata sandi harus terdiri dari minimal 6 karakter.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.')
        return
      }
    }

    setLoading(true)

    try {
      if (mode === 'signin') {
        // Mode Masuk (Sign In)
        const credential = await loginWithEmail(email, password)
        if (rememberMe) {
          localStorage.setItem('kimiaku-remember-email', email.trim())
        } else {
          localStorage.removeItem('kimiaku-remember-email')
        }
        if (onLoginSuccess && credential.user) {
          onLoginSuccess(credential.user)
        }
      } else {
        // Mode Daftar (Sign Up)
        const credential = await registerWithEmail(email, password, displayName)
        setSuccessMsg('Akun berhasil didaftarkan! Mengalihkan ke halaman utama...')
        if (onLoginSuccess && credential.user) {
          onLoginSuccess(credential.user)
        }
      }
    } catch (err) {
      console.warn('Form auth error:', err)
      setErrorMsg(getAuthErrorMessage(err.code, err.message))
    } finally {
      setLoading(false)
    }
  }

  // 3. Handler Lanjutkan sebagai Tamu (Guest Mode)
  const handleGuestMode = async () => {
    setErrorMsg(null)
    setGuestLoading(true)

    try {
      // Coba autentikasi anonymous Firebase jika didukung, atau fallback ke sesi tamu lokal
      try {
        const guestCred = await loginAsGuest()
        if (onLoginSuccess && guestCred.user) {
          onLoginSuccess(guestCred.user)
          return
        }
      } catch (anonErr) {
        console.info('Anonymous auth tidak aktif, beralih ke mode tamu lokal:', anonErr)
      }

      // Fallback guest mode callback
      if (onContinueAsGuest) {
        onContinueAsGuest()
      }
    } catch (err) {
      setErrorMsg('Gagal masuk sebagai tamu: ' + (err.message || 'Kendala sesi'))
    } finally {
      setGuestLoading(false)
    }
  }

  // Toggle antara mode Sign In dan Sign Up
  const toggleMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  return (
    <div className="login-page-container">
      {/* Kartu Terpisah 2 Kolom (Split Screen Card) */}
      <div className="login-split-card">
        {/* ========================================================
            KOLOM KIRI: FORM INPUT (Sign In / Sign Up)
            ======================================================== */}
        <div className="login-card-left">
          {/* Header Identitas Media KimiaKu */}
          <div className="login-brand-header">
            <div className="login-logo-wrap">
              <FlaskConical size={22} className="login-logo-icon" />
            </div>
            <div className="login-brand-text">
              <span className="brand-name">KimiaKu</span>
              <span className="brand-badge-pill">Fase F • Kelas XI</span>
            </div>
          </div>

          <div className="login-form-intro">
            <h1 className="login-heading">
              {mode === 'signin' ? 'Masuk ke KimiaKu' : 'Daftar Akun Baru'}
            </h1>
            <p className="login-subheading">
              {mode === 'signin'
                ? 'Gunakan akun Google atau email Anda untuk melanjutkan'
                : 'Buat akun untuk menyimpan hasil kuis dan progres belajar'}
            </p>
          </div>

          {/* Tombol Login Google Utama di Bagian Atas Form */}
          <button
            type="button"
            className="btn-google-auth-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <svg className="google-svg-icon" viewBox="0 0 24 24" width="18" height="18">
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
            )}
            <span>
              {googleLoading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}
            </span>
          </button>

          {/* Garis Pemisah (Divider) */}
          <div className="login-divider">
            <span className="divider-line" />
            <span className="divider-text">
              {mode === 'signin' ? 'atau masuk dengan email' : 'atau daftar dengan email'}
            </span>
            <span className="divider-line" />
          </div>

          {/* Form Email & Password */}
          <form className="login-email-form" onSubmit={handleFormSubmit}>
            {/* Input Nama Lengkap (Khusus Mode Sign Up) */}
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="input-name">
                  Nama Lengkap Siswa
                </label>
                <div className="input-icon-wrap">
                  <User size={18} className="input-icon" />
                  <input
                    id="input-name"
                    type="text"
                    className="form-input"
                    placeholder="Nama Lengkap Anda"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Input Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-email">
                Alamat Email
              </label>
              <div className="input-icon-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  id="input-email"
                  type="email"
                  className="form-input"
                  placeholder="nama@sekolah.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-password">
                Kata Sandi
              </label>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password (Khusus Mode Sign Up) */}
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="input-confirm-password">
                  Konfirmasi Kata Sandi
                </label>
                <div className="input-icon-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="input-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Ulangi kata sandi Anda"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}

            {/* Opsi Checkbox Remember Me & Tautan Guest Mode */}
            <div className="form-options-row">
              <label className="remember-me-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me (Ingat Saya)</span>
              </label>

              {mode === 'signin' && (
                <button
                  type="button"
                  className="btn-link-guest"
                  onClick={handleGuestMode}
                  disabled={guestLoading}
                  title="Masuk langsung tanpa akun (data disimpan di perangkat lokal)"
                >
                  <span>Lanjutkan sebagai Tamu</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Notifikasi Error jika ada */}
            {errorMsg && (
              <div className="login-alert-box error" role="alert">
                <AlertCircle size={16} className="alert-icon" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Notifikasi Sukses jika ada */}
            {successMsg && (
              <div className="login-alert-box success" role="alert">
                <CheckCircle2 size={16} className="alert-icon" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Tombol Utama Sign In / Sign Up */}
            <button
              type="submit"
              className="btn-submit-auth"
              disabled={loading || googleLoading || guestLoading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In (Masuk)' : 'Sign Up (Daftar Akun)'}</span>
              )}
            </button>
          </form>

          {/* Navigasi Mobile untuk Toggle Sign In / Sign Up */}
          <div className="mobile-toggle-footer">
            <span>
              {mode === 'signin' ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'}
            </span>
            <button type="button" className="btn-toggle-link" onClick={toggleMode}>
              {mode === 'signin' ? 'Daftar Sekarang' : 'Masuk ke Akun'}
            </button>
          </div>
        </div>

        {/* ========================================================
            KOLOM KANAN: PANEL SAMBUTAN WARNA PINK/RED GRADIENT
            ======================================================== */}
        <div className="login-card-right">
          <div className="welcome-panel-inner">
            <div className="welcome-badge">
              <Sparkles size={16} />
              <span>Media Pembelajaran Kimia Fase F</span>
            </div>

            <h2 className="welcome-title">
              {mode === 'signin' ? 'Welcome to KimiaKu!' : 'Bergabunglah Bersama Kami!'}
            </h2>

            <p className="welcome-desc">
              Kuasai materi Laju Reaksi melalui sintaks pembelajaran interaktif{' '}
              <strong>Predict, Observe, Explain (POE)</strong> dan visualisasi partikulat tumbukan.
            </p>

            <div className="welcome-highlights">
              <div className="welcome-highlight-item">
                <div className="highlight-bullet">
                  <Atom size={16} />
                </div>
                <div>
                  <strong>Sintaks POE & 3 Modul</strong>
                  <p>Observasi fenomena makroskopis dan mikroskopis laju reaksi.</p>
                </div>
              </div>

              <div className="welcome-highlight-item">
                <div className="highlight-bullet">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <strong>Penyimpanan Local-First</strong>
                  <p>Draf tersimpan di peramban, siap disinkronkan ke Firestore saat terhubung.</p>
                </div>
              </div>
            </div>

            <div className="welcome-toggle-box">
              <p className="toggle-prompt">
                {mode === 'signin'
                  ? 'Belum punya akun untuk menyimpan bukti belajar?'
                  : 'Sudah memiliki akun terdaftar di KimiaKu?'}
              </p>
              <button
                type="button"
                className="btn-welcome-toggle"
                onClick={toggleMode}
              >
                <span>
                  {mode === 'signin' ? 'Sign Up (Daftar Akun Baru)' : 'Sign In (Masuk Akun)'}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

