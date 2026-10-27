import React from 'react'
import { ArrowRight, Sparkles, Compass, Atom, Flame, Droplets } from 'lucide-react'

export default function HeroSection({ onStartLearning }) {
  const handleScrollToModules = () => {
    if (onStartLearning) {
      onStartLearning()
    } else {
      const el = document.getElementById('modul-belajar')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="hero-section">
      <div className="hero-grid">
        {/* Kolom Kiri: Teks & Aksi */}
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} className="badge-sparkle-icon" />
            <span>Platform Pembelajaran Kimia SMA Kelas X</span>
          </div>

          <h1 className="hero-title">
            Pahami Konsep Kimia Lewat <span className="highlight-text">Visual Interaktif</span>, Bukan Sekadar Hafalan.
          </h1>

          <p className="hero-description">
            Banyak siswa kelas X merasa kimia itu rumit karena sifatnya yang abstrak. KimiaKu hadir membantu kamu
            memvisualisasikan perhitungan mol, energi reaksi, dan sifat larutan secara nyata dan mudah dipahami.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-primary-hero"
              onClick={handleScrollToModules}
              id="btn-mulai-belajar"
            >
              <span>Mulai Belajar</span>
              <ArrowRight size={18} />
            </button>

            <a href="#modul-belajar" className="btn-secondary-hero">
              <Compass size={18} />
              <span>Jelajahi 3 Modul</span>
            </a>
          </div>

          {/* Kartu Ringkas Nilai Tambah */}
          <div className="hero-highlights">
            <div className="highlight-item">
              <div className="highlight-icon-wrap emerald">
                <Atom size={18} />
              </div>
              <div className="highlight-text-wrap">
                <strong>Simulasi Nyata</strong>
                <small>Visualisasi partikel & ikatan</small>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon-wrap amber">
                <Flame size={18} />
              </div>
              <div className="highlight-text-wrap">
                <strong>Notasi Baku</strong>
                <small>
                  Rumus presisi (contoh: H<sub>2</sub>SO<sub>4</sub>, Ca<sup>2+</sup>)
                </small>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon-wrap indigo">
                <Droplets size={18} />
              </div>
              <div className="highlight-text-wrap">
                <strong>Penyimpanan Anonim</strong>
                <small>Tanpa login, progres tersimpan</small>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Visualisasi Edukasi Sains Modern */}
        <div className="hero-visual-card">
          <div className="atom-visual-container">
            {/* Cincin Orbital Atom Bergerak */}
            <div className="orbital-ring orbital-1">
              <div className="electron electron-1"></div>
            </div>
            <div className="orbital-ring orbital-2">
              <div className="electron electron-2"></div>
            </div>
            <div className="orbital-ring orbital-3">
              <div className="electron electron-3"></div>
            </div>

            {/* Inti Atom Interaktif */}
            <div className="nucleus-core">
              <Atom size={44} className="nucleus-icon" />
              <div className="nucleus-glow"></div>
            </div>

            {/* Floating Formula Badges (Notasi Kimia Baku sesuai AGENTS.md) */}
            <div className="floating-formula formula-1">
              <span className="dot-indicator green"></span>
              <span>
                N<sub>2(g)</sub> + 3H<sub>2(g)</sub> → 2NH<sub>3(g)</sub>
              </span>
            </div>

            <div className="floating-formula formula-2">
              <span className="dot-indicator orange"></span>
              <span>
                ΔH = −92,4 kJ/mol
              </span>
            </div>

            <div className="floating-formula formula-3">
              <span className="dot-indicator blue"></span>
              <span>
                pH = −log[H<sup>+</sup>]
              </span>
            </div>

            <div className="floating-formula formula-4">
              <span className="dot-indicator purple"></span>
              <span>
                Ca<sup>2+</sup> + 2OH<sup>−</sup> → Ca(OH)<sub>2</sub>
              </span>
            </div>
          </div>

          <div className="visual-card-footer">
            <div className="footer-status">
              <span className="pulse-indicator"></span>
              <span>Visualisasi Reaksi Molekuler Siap Dieksplorasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
