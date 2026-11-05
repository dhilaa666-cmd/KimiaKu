import React from 'react'
import { ArrowRight, Sparkles, Atom, Flame, Eye, Activity, HelpCircle } from 'lucide-react'

export default function HeroSection({ onStartLearning, onExplorePoe, onOpenKuis }) {
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
            <span>Platform Pembelajaran Kimia Fase F • SMA Kelas XI</span>
          </div>

          <h1 className="hero-title">
            Kuasai <span className="highlight-text">Laju Reaksi</span> Lewat Sintaks POE & Visualisasi Partikulat.
          </h1>

          <p className="hero-description">
            Siswa sering kesulitan membayangkan pengaruh suhu, katalis, luas permukaan, dan konsentrasi terhadap
            tumbukan antarpartikel serta fenomena makroskopisnya. KimiaKu hadir dengan pendekatan{' '}
            <strong>Predict – Observe – Explain (POE)</strong> agar kamu paham hakikat sains secara mendalam, bukan
            sekadar menghafal rumus.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-primary-hero"
              onClick={handleScrollToModules}
              id="btn-mulai-belajar"
            >
              <span>Mulai Belajar 3 Modul</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn-secondary-hero"
              onClick={onExplorePoe || handleScrollToModules}
            >
              <Eye size={18} />
              <span>Coba Simulasi POE</span>
            </button>

            {onOpenKuis && (
              <button
                type="button"
                className="btn-tertiary-hero"
                onClick={onOpenKuis}
                title="Buka Kuis Diagnostik 5 Soal Laju Reaksi"
              >
                <HelpCircle size={18} />
                <span>Kuis Diagnostik (5 Soal)</span>
              </button>
            )}
          </div>

          {/* Kartu Ringkas Karakteristik KimiaKu */}
          <div className="hero-highlights">
            <div className="highlight-item">
              <div className="highlight-icon-wrap emerald">
                <Atom size={18} />
              </div>
              <div className="highlight-text-wrap">
                <strong>Sintaks POE</strong>
                <small>Predict, Observe, Explain</small>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon-wrap amber">
                <Activity size={18} />
              </div>
              <div className="highlight-text-wrap">
                <strong>Teori Tumbukan</strong>
                <small>
                  Energi Aktivasi (E<sub>a</sub>) & Orientasi
                </small>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon-wrap indigo">
                <Flame size={18} />
              </div>
              <div className="highlight-text-wrap">
                <strong>Bukti Makroskopis</strong>
                <small>Gelembung CO₂, suhu & massa</small>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Visualisasi Edukasi Sains Dinamis */}
        <div className="hero-visual-card">
          <div className="atom-visual-container">
            {/* Cincin Dinamika Partikel & Laju */}
            <div className="orbital-ring orbital-1">
              <div className="electron electron-1"></div>
            </div>
            <div className="orbital-ring orbital-2">
              <div className="electron electron-2"></div>
            </div>
            <div className="orbital-ring orbital-3">
              <div className="electron electron-3"></div>
            </div>

            {/* Inti Molekuler Interaktif */}
            <div className="nucleus-core">
              <Atom size={44} className="nucleus-icon" />
              <div className="nucleus-glow"></div>
            </div>

            {/* Floating Formula Badges (Notasi Kimia Baku Sesuai AGENTS.md) */}
            <div className="floating-formula formula-1">
              <span className="dot-indicator green"></span>
              <span>
                v = k [A]<sup>m</sup> [B]<sup>n</sup>
              </span>
            </div>

            <div className="floating-formula formula-2">
              <span className="dot-indicator orange"></span>
              <span>
                E<sub>a(katalis)</sub> &lt; E<sub>a(tanpa)</sub>
              </span>
            </div>

            <div className="floating-formula formula-3">
              <span className="dot-indicator blue"></span>
              <span>
                CaCO<sub>3(s)</sub> + 2HCl<sub>(aq)</sub> → CO<sub>2(g)</sub>
              </span>
            </div>

            <div className="floating-formula formula-4">
              <span className="dot-indicator purple"></span>
              <span>
                2H<sub>2</sub>O<sub>2(aq)</sub> → 2H<sub>2</sub>O<sub>(l)</sub> + O<sub>2(g)</sub>
              </span>
            </div>
          </div>

          <div className="visual-card-footer">
            <div className="footer-status">
              <span className="pulse-indicator"></span>
              <span>Model Tumbukan Efektif & Makroskopis Siap Dieksplorasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
