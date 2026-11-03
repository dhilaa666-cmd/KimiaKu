import React, { useState } from 'react'
import {
  FlaskConical,
  RefreshCw,
  Search,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import { MODULES_DATA } from '../data/modulesData'

export default function Navbar({
  completedTopics = [],
  totalTopics = 3,
  quizScores = {},
  onResetProgress,
  onOpenSearch,
  onSelectModule
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false)

  const percent = Math.round((completedTopics.length / totalTopics) * 100)
  const totalQuizDone = Object.keys(quizScores).length

  const handleNavModuleClick = (moduleId) => {
    if (onSelectModule) {
      onSelectModule(moduleId, 'materi')
    }
    setModulesDropdownOpen(false)
    setMobileMenuOpen(false)
  }

  const handleScrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Identitas Media */}
        <div
          className="navbar-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Beranda KimiaKu"
        >
          <div className="brand-logo-wrap">
            <FlaskConical className="brand-icon" size={24} />
            <span className="brand-glow"></span>
          </div>
          <div className="brand-text-wrap">
            <div className="brand-title-row">
              <span className="brand-name">KimiaKu</span>
              <span className="brand-badge">Fase F • Kelas XI</span>
            </div>
            <span className="brand-tagline">Media Pembelajaran Laju Reaksi Interaktif</span>
          </div>
        </div>

        {/* Menu Navigasi Utama (Termasuk Akses Langsung ke Semua Modul Sesuai Kriteria Uji PRD) */}
        <nav className="navbar-links" aria-label="Navigasi Utama">
          <button
            type="button"
            className="nav-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Beranda
          </button>

          {/* Dropdown Akses Langsung Semua Modul */}
          <div className="nav-dropdown-wrapper">
            <button
              type="button"
              className="nav-btn dropdown-toggle"
              onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
              aria-expanded={modulesDropdownOpen}
            >
              <span>Pilihan Modul</span>
              <ChevronDown size={14} className={`dropdown-chevron ${modulesDropdownOpen ? 'rotated' : ''}`} />
            </button>

            {modulesDropdownOpen && (
              <div className="nav-dropdown-menu">
                {MODULES_DATA.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleNavModuleClick(mod.id)}
                  >
                    <span className={`dropdown-bullet ${mod.accentColor}`}></span>
                    <div className="dropdown-item-info">
                      <strong className="item-title">{mod.title}</strong>
                      <small className="item-sub">{mod.subtitle}</small>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct module quick links on header */}
          <div className="nav-direct-modules">
            {MODULES_DATA.map((mod) => (
              <button
                key={mod.id}
                type="button"
                className="nav-chip-btn"
                onClick={() => handleNavModuleClick(mod.id)}
                title={`Buka ${mod.title}`}
              >
                {mod.badge}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="nav-btn"
            onClick={() => handleScrollTo('keunggulan')}
          >
            Sintaks POE
          </button>
        </nav>

        {/* Action Bar: Pencarian Materi & Progres Anonim */}
        <div className="navbar-actions">
          {/* Tombol Pencarian Materi (Fitur PRD) */}
          <button
            type="button"
            className="navbar-search-btn"
            onClick={onOpenSearch}
            title="Cari materi pembelajaran (Tekan untuk mencari)"
            aria-label="Cari materi"
          >
            <Search size={15} />
            <span className="search-btn-label">Cari Materi...</span>
            <span className="search-kbd-pill">Cari</span>
          </button>

          {/* Indikator Progres Anonim (Sesuai AGENTS.md kunci awalan kimiaku-) */}
          <div className="progress-pill" title="Progres belajar & kuis disimpan anonim di peramban Anda">
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
            {(completedTopics.length > 0 || totalQuizDone > 0) && onResetProgress && (
              <button
                type="button"
                className="progress-reset-btn"
                title="Atur ulang progres & nilai kuis"
                onClick={onResetProgress}
                aria-label="Atur ulang progres anonim"
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu navigasi"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <button
              type="button"
              className="mobile-link"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setMobileMenuOpen(false)
              }}
            >
              Beranda
            </button>

            <div className="mobile-section-divider">Modul Laju Reaksi (Akses Langsung):</div>
            {MODULES_DATA.map((mod) => (
              <button
                key={mod.id}
                type="button"
                className="mobile-link module-link"
                onClick={() => handleNavModuleClick(mod.id)}
              >
                <span>{mod.title}</span>
                <span className="mobile-badge">{mod.badge}</span>
              </button>
            ))}

            <button
              type="button"
              className="mobile-link"
              onClick={() => handleScrollTo('keunggulan')}
            >
              Keunggulan Pendekatan POE
            </button>

            <button
              type="button"
              className="mobile-search-action"
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenSearch()
              }}
            >
              <Search size={16} />
              <span>Cari Materi Pembelajaran</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
