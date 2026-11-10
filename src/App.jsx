import React, { useState, useEffect } from 'react'
import ResponsiveLayout from './components/ResponsiveLayout'
import HeroSection from './components/HeroSection'
import TopicCards from './components/TopicCards'
import ModuleDetailPage from './components/ModuleDetailPage'
import SearchBar from './components/SearchBar'
import FeaturesSection from './components/FeaturesSection'
import KuisLajuReaksi from './components/KuisLajuReaksi'
import PanelGuru from './components/PanelGuru'
import ReferensiSection from './components/ReferensiSection'
import LoginPage from './components/LoginPage'
import { subscribeToAuth } from './lib/firebase'
import { resetQuizStore } from './lib/localStore'
import { FlaskConical } from 'lucide-react'
import { MODULES_DATA } from './data/modulesData'
import './App.css'

// Aturan AGENTS.md: Gunakan satu kunci awalan kimiaku- untuk localStorage
const STORAGE_PROGRESS_KEY = 'kimiaku-progres'
const STORAGE_QUIZ_KEY = 'kimiaku-kuis'
const STORAGE_POE_KEY = 'kimiaku-poe'

export default function App() {
  // 1. Progres Modul Selesai
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROGRESS_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 2. Skor Kuis Anonim
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

  // State Autentikasi Pengguna & Gatekeeper Wajib Login
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem('kimiaku-guest-session') === 'true'
    } catch {
      return false
    }
  })

  // State Navigasi Halaman, Modal Pembelajaran & Pencarian
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' | 'modul' | 'kuis' | 'guru' | 'referensi'
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [activeModuleTab, setActiveModuleTab] = useState('materi') // 'materi' | 'simulasi' | 'kuis'
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // 0. Listener Autentikasi Firebase secara otomatis
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user)
      setIsAuthLoading(false)
      if (user) {
        setIsGuest(false)
        try {
          localStorage.removeItem('kimiaku-guest-session')
        } catch (e) {
          console.warn(e)
        }
      }
    })
    return () => unsubscribe()
  }, [])

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

  // Handler reset semua data progres anonim
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

  // Handler Navigasi Halaman Mandiri (Single-Page Isolation)
  const handleNavigate = (viewId) => {
    const target = viewId === 'home' ? 'dashboard' : viewId
    setCurrentView(target)
    setActiveModuleId(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const scrollContainer = document.querySelector('.main-content-scroll-area')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  const handleOpenModule = (moduleId, tab = 'materi') => {
    if (moduleId === 'home' || moduleId === 'dashboard') {
      handleNavigate('dashboard')
      return
    }
    if (moduleId === 'kuis-diagnostik' || (moduleId === 'faktor-laju' && tab === 'kuis')) {
      handleNavigate('kuis')
      return
    }
    setCurrentView('modul')
    setActiveModuleId(moduleId)
    setActiveModuleTab(tab)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const scrollContainer = document.querySelector('.main-content-scroll-area')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  const handleOpenKuis = () => {
    handleNavigate('kuis')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsGuest(false)
    try {
      localStorage.removeItem('kimiaku-guest-session')
    } catch (e) {
      console.warn('Gagal menghapus sesi tamu:', e)
    }
  }

  const handleStartLearning = () => {
    handleNavigate('modul')
  }

  const activeModule = MODULES_DATA.find((m) => m.id === activeModuleId)

  // ========================================================
  // GATEKEEPER / PROTECTED ROUTE (Wajib Login)
  // ========================================================
  // 1. Loading state saat memeriksa sesi login awal
  if (isAuthLoading) {
    return (
      <div className="app-gatekeeper-loading">
        <div className="gatekeeper-spinner-box">
          <FlaskConical size={36} className="gatekeeper-logo-icon" />
        </div>
        <p className="gatekeeper-loading-text">Memeriksa sesi login KimiaKu...</p>
      </div>
    )
  }

  // 2. Jika belum login dan belum memilih mode tamu, kunci ke halaman LoginPage secara penuh
  if (!currentUser && !isGuest) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user)
          setIsGuest(false)
          try {
            localStorage.removeItem('kimiaku-guest-session')
          } catch (e) {
            console.warn(e)
          }
        }}
        onContinueAsGuest={() => {
          setIsGuest(true)
          try {
            localStorage.setItem('kimiaku-guest-session', 'true')
          } catch (e) {
            console.warn(e)
          }
        }}
      />
    )
  }

  // 3. Pengguna telah login atau masuk sebagai tamu: Izinkan akses ke Layout Responsif & Aplikasi Utama
  return (
    <>
      <ResponsiveLayout
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        isGuest={isGuest}
        onLogout={handleLogout}
        completedTopicsCount={completedTopics.length}
        totalTopicsCount={MODULES_DATA.length}
        quizScores={quizScores}
        onResetProgress={handleResetProgress}
        onOpenSearch={() => setIsSearchOpen(true)}
      >
        {/* Render HANYA SATU komponen aktif di dalam <main> (Single-Page Isolation) */}
        {currentView === 'modul' ? (
          activeModule ? (
            <ModuleDetailPage
              module={activeModule}
              initialTab={activeModuleTab}
              onBack={() => {
                setActiveModuleId(null)
                window.scrollTo({ top: 0, behavior: 'instant' })
                const scrollContainer = document.querySelector('.main-content-scroll-area')
                if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
              }}
              isCompleted={completedTopics.includes(activeModule.id)}
              onToggleComplete={handleToggleTopic}
              onSaveQuizScore={handleSaveQuizScore}
              savedQuizScore={quizScores[activeModule.id] ?? null}
              onCompletePoe={handleCompletePoe}
              isPoeCompleted={poeRecords.includes(activeModule.id)}
              onOpenKuis={handleOpenKuis}
              currentUser={currentUser}
              isGuest={isGuest}
            />
          ) : (
            <div className="isolated-page-view modul-page-view">
              <div className="page-header-intro">
                <span className="page-badge-pill">Modul Interaktif POE</span>
                <h2 className="page-title-main">Eksplorasi Faktor Laju Reaksi</h2>
                <p className="page-subtitle-main">
                  Pelajari 3 modul kinetika kimia dengan pendekatan Predict – Observe – Explain pada representasi makroskopis dan sub-mikroskopis partikulat.
                </p>
              </div>
              <TopicCards
                completedTopics={completedTopics}
                onToggleTopicProgress={handleToggleTopic}
                onOpenModule={handleOpenModule}
                quizScores={quizScores}
                poeRecords={poeRecords}
              />
            </div>
          )
        ) : currentView === 'kuis' ? (
          <div className="isolated-page-view kuis-page-view">
            <KuisLajuReaksi
              onBack={() => handleNavigate('dashboard')}
              onCompleteScore={(score) => handleSaveQuizScore('faktor-laju', score)}
            />
          </div>
        ) : currentView === 'guru' ? (
          <div className="isolated-page-view guru-page-view">
            <PanelGuru
              onBackToDashboard={() => handleNavigate('dashboard')}
              currentUser={currentUser}
              isGuest={isGuest}
            />
          </div>
        ) : currentView === 'referensi' ? (
          <div className="isolated-page-view referensi-page-view">
            <ReferensiSection />
          </div>
        ) : (
          /* Dashboard / Beranda: Tampilkan HANYA hero section, ucapan selamat datang, dan ikhtisar singkat. Hapus daftar modul/kuis dari halaman ini. */
          <div className="isolated-page-view dashboard-page-view">
            <HeroSection
              onStartLearning={handleStartLearning}
              onExplorePoe={() => handleOpenModule('faktor-laju', 'simulasi')}
              onOpenKuis={handleOpenKuis}
              currentUser={currentUser}
              isGuest={isGuest}
            />
            <FeaturesSection />
          </div>
        )}
      </ResponsiveLayout>

      {/* 6. Fitur Pencarian Materi PRD.md */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={handleOpenModule}
      />
    </>
  )
}
