import React, { useState } from 'react'
import {
  Search,
  Sparkles,
  RefreshCw,
  FlaskConical,
  LogOut,
  X,
  Bookmark,
  ExternalLink
} from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import GoogleAuthButton from './GoogleAuthButton'
import { checkIsTeacher } from '../lib/authConfig'

export default function ResponsiveLayout({
  children,
  currentView,
  onNavigate,
  currentUser,
  isGuest,
  onLogout,
  completedTopicsCount = 0,
  totalTopicsCount = 3,
  quizScores = {},
  onResetProgress,
  onOpenSearch,
  isTeacher
}) {
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)
  const verifiedTeacher = typeof isTeacher === 'boolean' ? isTeacher : checkIsTeacher(currentUser)

  const percent = Math.round((completedTopicsCount / totalTopicsCount) * 100)
  const totalQuizDone = Object.keys(quizScores).length
  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    (isGuest ? 'Siswa Tamu' : 'Siswa')

  // Handler navigasi dari Sidebar atau BottomNav
  const handleNavClick = (viewId) => {
    if (viewId === 'profil') {
      setMobileProfileOpen(true)
      return
    }
    onNavigate(viewId)
  }

  return (
    <div className="responsive-app-container">
      {/* ========================================================
          1. LAPTOP / DESKTOP: FIXED LEFT SIDEBAR (>= 768px)
          Menggunakan Tailwind responsive classes 'hidden md:flex'
          ======================================================== */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavClick}
        currentUser={currentUser}
        isGuest={isGuest}
        onLogout={onLogout}
        completedTopicsCount={completedTopicsCount}
        totalTopicsCount={totalTopicsCount}
        isTeacher={verifiedTeacher}
      />

      {/* ========================================================
          2. KONTEN UTAMA SEBELAH KANAN SIDEBAR
          ======================================================== */}
      <div className="main-content-scroll-area">
        {/* TOP BAR DESKTOP (>= 768px) - Mengikuti acuan Image 1 Hireism Dashboard */}
        <header className="desktop-top-header hidden md:flex" aria-label="Header Desktop">
          <div className="header-search-wrap">
            <button
              type="button"
              className="desktop-search-btn"
              onClick={onOpenSearch}
              title="Cari materi pembelajaran (Tekan untuk mencari)"
            >
              <Search size={16} className="search-icon" />
              <span>Cari materi faktor laju, teori tumbukan, katalis...</span>
              <kbd className="search-shortcut-kbd">Cari</kbd>
            </button>
          </div>

          <div className="header-actions-right">
            {/* Status Sinkronisasi & Login Firebase */}
            <GoogleAuthButton isGuest={isGuest} onLogout={onLogout} />

            {/* Indikator Progres Belajar Anonim */}
            <div className="header-progress-pill" title="Progres belajar tersimpan di peramban">
              <span className="pill-label">Progres:</span>
              <span className="pill-count">{completedTopicsCount}/{totalTopicsCount} Modul</span>
              <div className="mini-progress-track">
                <div className="mini-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              {(completedTopicsCount > 0 || totalQuizDone > 0) && onResetProgress && (
                <button
                  type="button"
                  className="btn-mini-reset"
                  onClick={onResetProgress}
                  title="Atur ulang progres"
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* TOP BAR MOBILE (< 768px) - Mengikuti acuan Image 2 Mobile App */}
        <header className="mobile-top-header block md:hidden" aria-label="Header Mobile">
          <div className="mobile-header-inner">
            <div className="mobile-greeting-col">
              <div className="mobile-brand-row">
                <FlaskConical size={18} className="text-coral" />
                <span className="mobile-app-name">KimiaKu</span>
                <span className="mobile-fase-tag">Fase F</span>
              </div>
              <h1 className="mobile-greeting-text">
                Halo, <span className="greeting-highlight">{displayName}</span>! ✨
              </h1>
            </div>

            <div className="mobile-header-actions">
              <button
                type="button"
                className="mobile-quick-search-btn"
                onClick={onOpenSearch}
                aria-label="Cari Materi"
              >
                <Search size={18} />
              </button>

              <button
                type="button"
                className="mobile-avatar-badge-btn"
                onClick={() => setMobileProfileOpen(true)}
                title="Buka Menu Akun"
              >
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={displayName} className="mobile-user-img" />
                ) : (
                  <div className="mobile-user-fallback">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* CONTAINER KONTEN UTAMA (Render HANYA komponen aktif tanpa ditumpuk) */}
        <main className="dashboard-content-body">
          {children}
        </main>

        {/* FOOTER INFORMASI KIMIAKU & SEKSI REFERENSI CEPAT */}
        <footer className="dashboard-footer">
          {/* Footer Referensi Bar */}
          <div className="footer-references-bar">
            <div className="footer-ref-left">
              <Bookmark size={15} className="text-coral" />
              <span className="footer-ref-label">Referensi & Pustaka Kurikulum:</span>
              <span className="footer-ref-items">
                Buku Siswa Kimia Kemendikbudristek • Collision Theory (Arrhenius) • Simulasi PhET Colorado • IUPAC
              </span>
            </div>
            {currentView !== 'referensi' && (
              <button
                type="button"
                className="btn-footer-open-ref"
                onClick={() => onNavigate('referensi')}
              >
                <span>Buka Pustaka Lengkap</span>
                <ExternalLink size={13} />
              </button>
            )}
          </div>

          <div className="footer-content-wrap">
            <div className="footer-left-col">
              <div className="footer-brand-title">
                <FlaskConical size={18} className="text-coral" />
                <span>KimiaKu • Media Pembelajaran Kimia Fase F SMA Kelas XI</span>
              </div>
              <p className="footer-subtext">
                Dirancang dengan sintaks pembelajaran Predict – Observe – Explain (POE) untuk merepresentasikan konsep abstrak faktor laju reaksi pada tingkat makroskopis dan sub-mikroskopis.
              </p>
            </div>
            <div className="footer-right-col">
              <span className="footer-badge-tech">
                <Sparkles size={13} />
                <span>React + Vite • Local-First • Firebase Cloud</span>
              </span>
              <small className="footer-copyright">
                © 2026 KimiaKu. Disusun untuk kepentingan edukasi sains kimia SMA.
              </small>
            </div>
          </div>
        </footer>
      </div>

      {/* ========================================================
          3. TAMPILAN MOBILE: FLOATING BOTTOM NAVIGATION BAR (< 768px)
          Menggunakan Tailwind responsive classes 'block md:hidden'
          ======================================================== */}
      <BottomNav
        currentView={currentView}
        onNavigate={handleNavClick}
        isTeacher={verifiedTeacher}
      />

      {/* MODAL PROFIL PENGGUNA UNTUK MOBILE HP */}
      {mobileProfileOpen && (
        <div className="modal-overlay" onClick={() => setMobileProfileOpen(false)}>
          <div
            className="modal-content mobile-profile-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sheet-header">
              <div className="sheet-user-info">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={displayName} className="sheet-avatar-img" />
                ) : (
                  <div className="sheet-avatar-fallback">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 className="sheet-user-name">{displayName}</h3>
                    {verifiedTeacher && (
                      <span className="sidebar-role-badge-teacher">Guru</span>
                    )}
                  </div>
                  <small className="sheet-user-email">
                    {currentUser?.email || (isGuest ? 'Mode Tamu (Data Lokal)' : 'Siswa')}
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-sheet"
                onClick={() => setMobileProfileOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sheet-body">
              <div className="sheet-sync-status-box">
                <GoogleAuthButton isGuest={isGuest} onLogout={onLogout} />
              </div>

              <div className="sheet-progress-summary">
                <div className="summary-row">
                  <span>Progres Modul:</span>
                  <strong>{completedTopicsCount} / {totalTopicsCount} Selesai ({percent}%)</strong>
                </div>
                <div className="summary-bar-track">
                  <div className="summary-bar-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <button
                type="button"
                className="btn-sheet-logout"
                onClick={() => {
                  setMobileProfileOpen(false)
                  onLogout()
                }}
              >
                <LogOut size={16} />
                <span>Keluar dari Akun / Sesi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
