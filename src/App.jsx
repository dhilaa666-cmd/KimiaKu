import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import LoginPage from './components/LoginPage'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import TopicCards from './components/TopicCards'
import ModuleModal from './components/ModuleModal'
import SearchBar from './components/SearchBar'
import FeaturesSection from './components/FeaturesSection'
import KuisLajuReaksi from './components/KuisLajuReaksi'
import { resetQuizStore } from './lib/localStore'
import { FlaskConical, Sparkles, Loader2 } from 'lucide-react'
import { MODULES_DATA } from './data/modulesData'
import './App.css'

// Aturan AGENTS.md: Gunakan satu kunci awalan kimiaku- untuk localStorage
const STORAGE_PROGRESS_KEY = 'kimiaku-progres'
const STORAGE_QUIZ_KEY = 'kimiaku-kuis'
const STORAGE_POE_KEY = 'kimiaku-poe'

export default function App() {
  // State Autentikasi Firebase (Gatekeeper)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(() => Boolean(auth))

  // 1. Pantau status sesi login pengguna dengan onAuthStateChanged dari Firebase Auth
  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setAuthLoading(false)
      },
      (error) => {
        console.warn('Error onAuthStateChanged:', error)
        setUser(null)
        setAuthLoading(false)
      }
    )

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  // 1. Progres Modul Selesai
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROGRESS_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 2. Skor Kuis Anonim / Lokal
  const [quizScores, setQuizScores] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_QUIZ_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // 3. Catatan Penyelesaian Simulasi POE
  const [poeRecords, setPoeRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_POE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // State Navigasi Halaman, Modal Pembelajaran & Pencarian
  const [currentView, setCurrentView] = useState('home') // 'home' | 'kuis'
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [activeModuleTab, setActiveModuleTab] = useState('materi') // 'materi' | 'simulasi' | 'kuis'
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Sinkronisasi data ke localStorage secara otomatis
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(completedTopics))
    } catch (e) {
      console.warn('Gagal menyimpan progres ke localStorage:', e)
    }
  }, [completedTopics])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_QUIZ_KEY, JSON.stringify(quizScores))
    } catch (e) {
      console.warn('Gagal menyimpan nilai kuis ke localStorage:', e)
    }
  }, [quizScores])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_POE_KEY, JSON.stringify(poeRecords))
    } catch (e) {
      console.warn('Gagal menyimpan data POE ke localStorage:', e)
    }
  }, [poeRecords])

  // Handler toggle status modul selesai
  const handleToggleTopic = (topicId) => {
    setCompletedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })
  }

  // Handler simpan skor kuis
  const handleSaveQuizScore = (moduleId, score) => {
    setQuizScores((prev) => ({
      ...prev,
      [moduleId]: Math.max(prev[moduleId] || 0, score)
    }))
    // Jika skor kuis lulus (>= 60), otomatis tandai modul sebagai dipelajari
    if (score >= 60 && !completedTopics.includes(moduleId)) {
      setCompletedTopics((prev) => [...prev, moduleId])
    }
  }

  // Handler selesaikan aktivitas POE
  const handleCompletePoe = (moduleId) => {
    setPoeRecords((prev) => {
      if (!prev.includes(moduleId)) {
        return [...prev, moduleId]
      }
      return prev
    })
  }

  // Handler reset semua data progres
  const handleResetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang semua progres belajar, simulasi POE, dan skor kuis?')) {
      setCompletedTopics([])
      setQuizScores({})
      setPoeRecords([])
      resetQuizStore() // Reset database lokal kuis diagnostik
      try {
        localStorage.removeItem(STORAGE_PROGRESS_KEY)
        localStorage.removeItem(STORAGE_QUIZ_KEY)
        localStorage.removeItem(STORAGE_POE_KEY)
      } catch (e) {
        console.warn('Gagal membersihkan data:', e)
      }
    }
  }

  const handleOpenModule = (moduleId, tab = 'materi') => {
    if (moduleId === 'home') {
      setCurrentView('home')
      setActiveModuleId(null)
      return
    }
    if (moduleId === 'kuis-diagnostik' || (moduleId === 'faktor-laju' && tab === 'kuis')) {
      setCurrentView('kuis')
      setActiveModuleId(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setCurrentView('home')
    setActiveModuleId(moduleId)
    setActiveModuleTab(tab)
  }

  const handleOpenKuis = () => {
    setCurrentView('kuis')
    setActiveModuleId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCloseModule = () => {
    setActiveModuleId(null)
  }

  const handleStartLearning = () => {
    const el = document.getElementById('modul-belajar')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 1. Tampilan Loading saat awal memeriksa status sesi login
  if (authLoading) {
    return (
      <div className="gatekeeper-loading">
        <div className="gatekeeper-loading-card">
          <div className="brand-logo-wrap pulse">
            <FlaskConical size={30} />
          </div>
          <div className="loading-text-row">
            <Loader2 size={18} className="spin text-secondary" />
            <span>Memeriksa sesi login KimiaKu...</span>
          </div>
        </div>
      </div>
    )
  }

  // 2. GATEKEEPER: Jika pengguna BELUM login (!user), kembalikan LoginPage secara penuh
  if (!user) {
    return (
      <LoginPage
        onGuestLogin={() => {
          setUser({
            uid: 'guest-' + Date.now(),
            displayName: 'Tamu',
            email: null,
            isAnonymous: true
          })
        }}
      />
    )
  }

  // 3. Jika pengguna SUDAH login (user), tampilkan seluruh komponen aplikasi utama
  const activeModule = MODULES_DATA.find((m) => m.id === activeModuleId)

  return (
    <div className="app-shell">
      {/* 1. Header / Navbar dengan Navigasi Langsung Semua Modul, Kuis Diagnostik & Pencarian */}
      <Navbar
        user={user}
        completedTopics={completedTopics}
        totalTopics={MODULES_DATA.length}
        quizScores={quizScores}
        onResetProgress={handleResetProgress}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectModule={handleOpenModule}
        onOpenKuis={handleOpenKuis}
        currentView={currentView}
      />

      <main className="main-content">
        {currentView === 'kuis' ? (
          <KuisLajuReaksi
            onBack={() => {
              setCurrentView('home')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onCompleteScore={(score) => handleSaveQuizScore('faktor-laju', score)}
          />
        ) : (
          <>
            {/* 2. Hero Section Laju Reaksi */}
            <HeroSection
              onStartLearning={handleStartLearning}
              onExplorePoe={() => handleOpenModule('faktor-laju', 'simulasi')}
              onOpenKuis={handleOpenKuis}
            />

            {/* 3. Tiga Kartu Modul Utama (Suhu/Katalis/Luas/Konsentrasi, Teori Tumbukan, Makroskopis) */}
            <TopicCards
              completedTopics={completedTopics}
              onToggleTopicProgress={handleToggleTopic}
              onOpenModule={handleOpenModule}
              quizScores={quizScores}
              poeRecords={poeRecords}
            />

            {/* 4. Seksi Pedagogis & Keunggulan POE */}
            <FeaturesSection />
          </>
        )}
      </main>

      {/* 5. Modal Pembelajaran Komprehensif (Materi Lengkap, Simulasi POE, Kuis) */}
      {activeModule && (
        <ModuleModal
          module={activeModule}
          initialTab={activeModuleTab}
          onClose={handleCloseModule}
          isCompleted={completedTopics.includes(activeModule.id)}
          onToggleComplete={handleToggleTopic}
          onSaveQuizScore={handleSaveQuizScore}
          savedQuizScore={quizScores[activeModule.id] ?? null}
          onCompletePoe={handleCompletePoe}
          isPoeCompleted={poeRecords.includes(activeModule.id)}
        />
      )}

      {/* 6. Fitur Pencarian Materi PRD.md */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={handleOpenModule}
      />

      {/* 7. Footer Beranda */}
      <footer className="footer-container">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <FlaskConical size={20} className="footer-icon" />
              <span className="footer-brand-name">KimiaKu</span>
            </div>
            <p className="footer-copy">
              Media pembelajaran kimia interaktif untuk siswa SMA kelas XI Fase F. Berbasis Sintaks POE (Predict, Observe, Explain)
              dan representasi makroskopis-mikroskopis laju reaksi.
            </p>
          </div>

          <div className="footer-meta">
            <div className="footer-badge">
              <Sparkles size={14} />
              <span>React + Vite • Autentikasi Google Cloud • Media Pembelajaran Kimia Fase F</span>
            </div>
            <div className="footer-copyright">
              © 2026 KimiaKu. Semua materi disusun untuk kepentingan edukasi sains kelas XI Fase F.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
