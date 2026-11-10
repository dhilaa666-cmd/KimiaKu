import React, { useState } from 'react'
import {
  FlaskConical,
  Sparkles,
  BookOpen,
  Atom,
  HelpCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import { loginWithGoogle } from '../lib/firebase'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      await loginWithGoogle()
      // onAuthStateChanged di App.jsx otomatis memperbarui state user
    } catch (error) {
      console.warn('Gagal login Google:', error)
      if (error?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(
          error?.message || 'Gagal masuk dengan Google. Silakan periksa koneksi internet atau coba lagi.'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-gatekeeper-container">
      {/* Background Decorative Blobs */}
      <div className="login-bg-blob blob-1" aria-hidden="true" />
      <div className="login-bg-blob blob-2" aria-hidden="true" />
      <div className="login-bg-blob blob-3" aria-hidden="true" />

      <div className="login-gatekeeper-content">
        {/* Header Identitas KimiaKu */}
        <header className="login-header">
          <div className="login-brand-badge">
            <Sparkles size={14} className="badge-icon-sparkle" />
            <span>Media Pembelajaran Kimia Fase F • SMA Kelas XI</span>
          </div>

          <div className="login-logo-row">
            <div className="login-logo-wrap">
              <FlaskConical size={34} className="login-brand-icon" />
            </div>
            <h1 className="login-app-title">KimiaKu</h1>
          </div>

          <p className="login-hero-tagline">
            Media Pembelajaran Interaktif Faktor-Faktor Laju Reaksi Berbasis Sintaks POE
            <span className="poe-acronym"> (Predict, Observe, Explain)</span>
          </p>
        </header>

        {/* Kartu Utama Login (Gatekeeper Card) */}
        <div className="login-main-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Masuk ke Ruang Belajar</h2>
            <p className="login-card-desc">
              Silakan masuk menggunakan Akun Google Anda untuk membuka akses penuh ke modul materi,
              simulasi partikel interaktif, kuis diagnostik, dan sinkronisasi progres cloud.
            </p>
          </div>

          {/* Alert Error jika Login Gagal */}
          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tombol Utama: Masuk dengan Google */}
          <div className="login-action-wrap">
            <button
              type="button"
              className="btn-google-login-gate"
              onClick={handleLogin}
              disabled={isLoading}
              title="Masuk menggunakan Akun Google"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="spin" />
                  <span>Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <svg className="google-icon-svg" width="20" height="20" viewBox="0 0 24 24">
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
                  <span>Masuk dengan Google</span>
                  <ArrowRight size={18} className="arrow-icon" />
                </>
              )}
            </button>
          </div>

          <div className="login-security-notice">
            <ShieldCheck size={15} className="security-icon" />
            <span>Autentikasi aman melalui Firebase Auth • Progres tersimpan otomatis</span>
          </div>
        </div>

        {/* Fitur Utama yang Didapatkan Siswa */}
        <section className="login-features-preview" aria-label="Fitur Unggulan KimiaKu">
          <div className="preview-card">
            <div className="preview-icon-wrap icon-purple">
              <BookOpen size={20} />
            </div>
            <div className="preview-info">
              <h3 className="preview-title">Modul Laju Reaksi Lengkap</h3>
              <p className="preview-desc">
                Konsentrasi, Luas Permukaan, Suhu, Katalis, Teori Tumbukan, dan Representasi Makroskopis-Mikroskopis.
              </p>
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-icon-wrap icon-teal">
              <Atom size={20} />
            </div>
            <div className="preview-info">
              <h3 className="preview-title">Simulasi 3D Sintaks POE</h3>
              <p className="preview-desc">
                Prediksi hipotesis reaksi, amati simulasi molekul bergerak, dan jelaskan konsep ilmiah dengan bantuan interaktif.
              </p>
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-icon-wrap icon-coral">
              <HelpCircle size={20} />
            </div>
            <div className="preview-info">
              <h3 className="preview-title">Kuis Diagnostik & Analisis</h3>
              <p className="preview-desc">
                Evaluasi pemahaman konsep secara bertahap dengan feedback instan dan pembahasan ilmiah yang jelas.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="login-footer">
          <p>© 2026 KimiaKu. Dikembangkan untuk pembelajaran kimia interaktif SMA Fase F.</p>
        </footer>
      </div>
    </div>
  )
}
