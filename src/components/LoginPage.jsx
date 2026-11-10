import React, { useState } from 'react'
import {
  FlaskConical,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Boxes,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase'

export default function LoginPage({ onGuestLogin }) {
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Handler Login dengan Google Auth
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await loginWithGoogle()
    } catch (error) {
      console.warn('Gagal login Google:', error)
      if (error?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(
          error?.message || 'Gagal masuk dengan Google. Silakan periksa koneksi atau konfigurasi Firebase.'
        )
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Handler Submit Form Email & Password
  const handleSubmitEmailAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage('Harap isi alamat email dan kata sandi Anda.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      if (isSignUpMode) {
        await registerWithEmail(email, password)
        setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke ruang belajar...')
      } else {
        await loginWithEmail(email, password)
      }
    } catch (error) {
      console.warn('Error email authentication:', error)
      let msg = error?.message || 'Terjadi kesalahan saat autentikasi.'
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        msg = 'Email atau kata sandi yang Anda masukkan salah.'
      } else if (error?.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan gunakan menu Sign In (Masuk).'
      } else if (error?.code === 'auth/invalid-email') {
        msg = 'Format alamat email tidak valid.'
      }
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Handler Lanjutkan sebagai Tamu (Guest Mode)
  const handleGuestContinue = () => {
    if (onGuestLogin) {
      onGuestLogin()
    }
  }

  return (
    <div className="login-split-page-wrapper">
      {/* Kartu Utama Split 2-Kolom */}
      <div className="login-split-card">
        {/* ========================================================
            KOLOM KIRI (PUTIH): FORM LOGIN & GOOGLE AUTH
            ======================================================== */}
        <div className="login-split-left">
          {/* Header Identitas KimiaKu */}
          <div className="brand-header-row">
            <div className="brand-logo-box">
              <FlaskConical size={20} className="brand-flask-icon" />
            </div>
            <span className="brand-name-text">KimiaKu</span>
            <span className="brand-pill-tag">Fase F • Kelas XI</span>
          </div>

          {/* Judul & Subjudul */}
          <div className="login-intro-block">
            <h1 className="login-heading">
              {isSignUpMode ? 'Daftar Akun KimiaKu' : 'Masuk ke KimiaKu'}
            </h1>
            <p className="login-subheading">
              {isSignUpMode
                ? 'Buat akun belajar baru untuk menyimpan progres Anda'
                : 'Gunakan akun Google atau email Anda untuk melanjutkan'}
            </p>
          </div>

          {/* Alert Notifikasi Error / Sukses */}
          {errorMessage && (
            <div className="login-alert alert-error" role="alert">
              <AlertCircle size={16} className="alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="login-alert alert-success" role="alert">
              <CheckCircle2 size={16} className="alert-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tombol Masuk dengan Google */}
          <button
            type="button"
            className="btn-google-auth-full"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            title="Masuk menggunakan Akun Google"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Menghubungkan ke Google...</span>
              </>
            ) : (
              <>
                <svg className="google-g-icon" width="18" height="18" viewBox="0 0 24 24">
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
                <span>Masuk dengan Akun Google</span>
              </>
            )}
          </button>

          {/* Garis Pembatas Divider */}
          <div className="login-divider">
            <span className="divider-line" />
            <span className="divider-text">
              {isSignUpMode ? 'atau daftar dengan email' : 'atau masuk dengan email'}
            </span>
            <span className="divider-line" />
          </div>

          {/* Form Alamat Email & Kata Sandi */}
          <form className="login-form" onSubmit={handleSubmitEmailAuth}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Alamat Email
              </label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-leading-icon" />
                <input
                  id="login-email"
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

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Kata Sandi
              </label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-leading-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-trailing-action"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Checkbox Remember Me & Link Lanjutkan sebagai Tamu */}
            <div className="form-options-row">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me (Ingat Saya)</span>
              </label>

              <button
                type="button"
                className="btn-guest-link"
                onClick={handleGuestContinue}
                title="Jelajahi materi tanpa akun login"
              >
                <span>Lanjutkan sebagai Tamu</span>
                <ArrowRight size={14} className="guest-arrow-icon" />
              </button>
            </div>

            {/* Tombol Submit Form */}
            <button
              type="submit"
              className="btn-login-submit"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Memproses...</span>
                </>
              ) : isSignUpMode ? (
                'Sign up (Daftar)'
              ) : (
                'Sign in (Masuk)'
              )}
            </button>
          </form>
        </div>

        {/* ========================================================
            KOLOM KANAN (MERAH/CORAL GRADIENT): BANNER KIMIAKU
            ======================================================== */}
        <div className="login-split-right">
          {/* Decorative Background Circles */}
          <div className="coral-decor-circle circle-tr" aria-hidden="true" />
          <div className="coral-decor-circle circle-bl" aria-hidden="true" />

          <div className="right-column-inner">
            {/* Top Pill Badge */}
            <div className="media-phase-badge">
              <Sparkles size={13} className="badge-sparkle-icon" />
              <span>Media Pembelajaran Kimia Fase F</span>
            </div>

            {/* Judul Besar & Deskripsi */}
            <div className="right-intro-section">
              <h2 className="welcome-large-title">
                Welcome to<br />KimiaKu!
              </h2>
              <p className="welcome-desc-text">
                Kuasai materi Laju Reaksi melalui sintaks pembelajaran interaktif Predict, Observe,
                Explain (POE) dan visualisasi partikulat tumbukan.
              </p>
            </div>

            {/* 2 Kotak Informasi (Sintaks POE & Local First) */}
            <div className="info-cards-stack">
              <div className="info-feature-box">
                <div className="feature-icon-wrapper">
                  <Boxes size={18} />
                </div>
                <div className="feature-text-block">
                  <h3 className="feature-box-title">Sintaks POE & 3 Modul</h3>
                  <p className="feature-box-desc">
                    Observasi fenomena makroskopis dan mikroskopis laju reaksi.
                  </p>
                </div>
              </div>

              <div className="info-feature-box">
                <div className="feature-icon-wrapper">
                  <CheckCircle2 size={18} />
                </div>
                <div className="feature-text-block">
                  <h3 className="feature-box-title">Penyimpanan Local-First</h3>
                  <p className="feature-box-desc">
                    Draf tersimpan di peramban, siap disinkronkan ke Firestore saat terhubung.
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian Bawah: Tombol Daftar Akun Baru */}
            <div className="right-action-footer">
              <p className="signup-prompt-label">
                {isSignUpMode
                  ? 'Sudah memiliki akun terdaftar?'
                  : 'Belum punya akun untuk menyimpan bukti belajar?'}
              </p>
              <button
                type="button"
                className="btn-signup-ghost"
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode)
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
              >
                <span>
                  {isSignUpMode ? 'Sign In (Masuk Akun)' : 'Sign Up (Daftar Akun Baru)'}
                </span>
                <ArrowRight size={15} className="signup-arrow-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
