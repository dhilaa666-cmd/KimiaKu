import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import TopicCards from './components/TopicCards'
import { FlaskConical, ShieldCheck, Sparkles, BookOpen, Atom } from 'lucide-react'
import './App.css'

const STORAGE_KEY = 'kimiaku-progres'

function App() {
  // Progres anonim menggunakan kunci berawalan kimiaku- sesuai aturan AGENTS.md
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Sinkronisasi ke localStorage setiap ada perubahan status progres
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTopics))
    } catch (e) {
      console.warn('Gagal menyimpan progres ke localStorage:', e)
    }
  }, [completedTopics])

  const handleToggleTopic = (topicId) => {
    setCompletedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })
  }

  const handleResetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang progres belajar modul?')) {
      setCompletedTopics([])
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.warn('Gagal menghapus progres:', e)
      }
    }
  }

  const handleStartLearning = () => {
    const el = document.getElementById('modul-belajar')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app-shell">
      {/* 1. Navbar dengan Identitas Media & Indikator Progres Anonim */}
      <Navbar
        completedTopics={completedTopics}
        totalTopics={3}
        onResetProgress={handleResetProgress}
      />

      <main className="main-content">
        {/* 2. Hero dengan Judul dan Tombol "Mulai Belajar" */}
        <HeroSection onStartLearning={handleStartLearning} />

        {/* 3. Tiga Kartu Materi: Stoikiometri, Termokimia, dan Larutan Asam-Basa */}
        <TopicCards
          completedTopics={completedTopics}
          onToggleTopicProgress={handleToggleTopic}
        />

        {/* Seksi Keunggulan Belajar KimiaKu */}
        <section id="keunggulan" className="features-section">
          <div className="features-header">
            <h2 className="features-title">Mengapa Belajar di KimiaKu?</h2>
            <p className="features-desc">
              Dirancang khusus untuk siswa SMA kelas X agar konsep abstrak kimia menjadi lebih terbayang dan nyata.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper emerald">
                <Atom size={22} />
              </div>
              <h3 className="feature-card-title">Visualisasi Model Konsep</h3>
              <p className="feature-card-text">
                Bukan sekadar deretan teks. Siswa dapat melihat pergerakan partikel, rasio mol, dan skala pH secara langsung.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper amber">
                <BookOpen size={22} />
              </div>
              <h3 className="feature-card-title">Kaidah Notasi Baku</h3>
              <p className="feature-card-text">
                Semua rumus ditulis dengan format standar kimia menggunakan subskrip dan superskrip resmi (misal H<sub>2</sub>SO<sub>4</sub> dan Ca<sup>2+</sup>).
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper indigo">
                <ShieldCheck size={22} />
              </div>
              <h3 className="feature-card-title">100% Anonim & Privat</h3>
              <p className="feature-card-text">
                Tanpa registrasi, tanpa email, dan tanpa pelacakan data pribadi. Semua progres belajar disimpan aman di perangkat Anda.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Beranda */}
      <footer className="footer-container">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <FlaskConical size={20} className="footer-icon" />
              <span className="footer-brand-name">KimiaKu</span>
            </div>
            <p className="footer-copy">
              Media pembelajaran kimia interaktif untuk siswa SMA kelas X. Dibuat dengan pendekatan visual & bermakna.
            </p>
          </div>

          <div className="footer-meta">
            <div className="footer-badge">
              <Sparkles size={14} />
              <span>React + Vite • Bebas Akun • Sesuai PRD.md & AGENTS.md</span>
            </div>
            <div className="footer-copyright">
              © 2026 KimiaKu. Semua materi disusun untuk kepentingan edukasi sains.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
