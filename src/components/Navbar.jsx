import React from 'react'
import { FlaskConical, RefreshCw } from 'lucide-react'

export default function Navbar({ completedTopics = [], totalTopics = 3, onResetProgress }) {
  const percent = Math.round((completedTopics.length / totalTopics) * 100)

  const handleScrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Identitas Media */}
        <div className="navbar-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-logo-wrap">
            <FlaskConical className="brand-icon" size={24} />
            <span className="brand-glow"></span>
          </div>
          <div className="brand-text-wrap">
            <div className="brand-title-row">
              <span className="brand-name">KimiaKu</span>
              <span className="brand-badge">Kelas X SMA</span>
            </div>
            <span className="brand-tagline">Media Belajar Kimia Interaktif</span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="navbar-links" aria-label="Navigasi Utama">
          <button
            type="button"
            className="nav-btn active"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Beranda
          </button>
          <button
            type="button"
            className="nav-btn"
            onClick={() => handleScrollTo('modul-belajar')}
          >
            Modul Materi
          </button>
          <button
            type="button"
            className="nav-btn"
            onClick={() => handleScrollTo('keunggulan')}
          >
            Karakteristik
          </button>
        </nav>

        {/* Indikator Progres Anonim (Sesuai AGENTS.md kunci kimiaku-) */}
        <div className="navbar-actions">
          <div className="progress-pill" title="Progres belajar disimpan anonim di peramban Anda">
            <div className="progress-info">
              <span className="progress-label">Progres:</span>
              <span className="progress-count">
                {completedTopics.length}/{totalTopics} Modul
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            {completedTopics.length > 0 && onResetProgress && (
              <button
                type="button"
                className="progress-reset-btn"
                title="Atur ulang progres"
                onClick={onResetProgress}
                aria-label="Atur ulang progres anonim"
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
