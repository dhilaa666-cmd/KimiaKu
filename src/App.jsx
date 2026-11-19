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
import OnboardingModal from './components/OnboardingModal'
import { subscribeToAuth } from './lib/firebase'
import { resetQuizStore } from './lib/localStore'
import { checkIsTeacher } from './lib/authConfig'
import { FlaskConical, ShieldAlert, HelpCircle } from 'lucide-react'
import { MODULES_DATA } from './data/modulesData'
import './App.css'

const STORAGE_PROGRESS_KEY = 'kimiaku-progres'
const STORAGE_QUIZ_KEY = 'kimiaku-kuis'
const STORAGE_POE_KEY = 'kimiaku-poe'

export default function App() {
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROGRESS_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [quizScores, setQuizScores] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_QUIZ_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [poeRecords, setPoeRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_POE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem('kimiaku-guest-session') === 'true'
    } catch {
      return false
    }
  })

  const [currentView, setCurrentView] = useState('dashboard')
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [activeModuleTab, setActiveModuleTab] = useState('materi')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  const isTeacher = checkIsTeacher(currentUser)
  const activeView = (currentView === 'guru' && !isTeacher) ? 'dashboard' : currentView

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

  useEffect(() => {
    if (isAuthLoading) return
    if (!currentUser && !isGuest) return

    const accountIdentifier = currentUser?.uid || currentUser?.email || 'guest'
    const onboardingStorageKey = `kimiaku-onboarding-seen-${accountIdentifier}`

    try {
      const hasSeenOnboarding = localStorage.getItem(onboardingStorageKey)
      if (!hasSeenOnboarding) {
        setIsOnboardingOpen(true)
      }
    } catch (e) {
      console.warn('Gagal membaca status onboarding:', e)
    }
  }, [currentUser, isGuest, isAuthLoading])

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false)
    const accountIdentifier = currentUser?.uid || currentUser?.email || 'guest'
    const onboardingStorageKey = `kimiaku-onboarding-seen-${accountIdentifier}`
    try {
      localStorage.setItem(onboardingStorageKey, 'true')
    } catch (e) {
      console.warn('Gagal menyimpan status onboarding:', e)
    }
  }

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

  const handleToggleTopic = (topicId) => {
    setCompletedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })
  }

  const handleSaveQuizScore = (moduleId, score) => {
    setQuizScores((prev) => ({
      ...prev,
      [moduleId]: Math.max(prev[moduleId] || 0, score)
    }))
    if (score >= 60 && !completedTopics.includes(moduleId)) {
      setCompletedTopics((prev) => [...prev, moduleId])
    }
  }

  const handleCompletePoe = (moduleId) => {
    setPoeRecords((prev) => {
      if (!prev.includes(moduleId)) {
        return [...prev, moduleId]
      }
      return prev
    })
  }

  const handleResetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang semua progres belajar, simulasi POE, dan skor kuis?')) {
      setCompletedTopics([])
      setQuizScores({})
      setPoeRecords([])
      resetQuizStore()
      try {
        localStorage.removeItem(STORAGE_PROGRESS_KEY)
        localStorage.removeItem(STORAGE_QUIZ_KEY)
        localStorage.removeItem(STORAGE_POE_KEY)
      } catch (e) {
        console.warn('Gagal membersihkan data:', e)
      }
    }
  }

  const handleNavigate = (viewId) => {
    const target = viewId === 'home' ? 'dashboard' : viewId

    if (target === 'guru' || target === 'panel-guru') {
      if (!isTeacher) {
        alert('Akses Ditolak: Halaman Panel Guru khusus untuk akun Guru resmi KimiaKu.')
        setCurrentView('dashboard')
        setActiveModuleId(null)
        window.scrollTo({ top: 0, behavior: 'instant' })
        return
      }
    }

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
    setIsOnboardingOpen(false)
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

  return (
    <>
      <ResponsiveLayout
        currentView={activeView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        isGuest={isGuest}
        onLogout={handleLogout}
        completedTopicsCount={completedTopics.length}
        totalTopicsCount={MODULES_DATA.length}
        quizScores={quizScores}
        onResetProgress={handleResetProgress}
        onOpenSearch={() => setIsSearchOpen(true)}
        isTeacher={isTeacher}
      >
        {activeView === 'modul' ? (
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
        ) : activeView === 'kuis' ? (
          <div className="isolated-page-view kuis-page-view">
            <KuisLajuReaksi
              onBack={() => handleNavigate('dashboard')}
              onCompleteScore={(score) => handleSaveQuizScore('faktor-laju', score)}
            />
          </div>
        ) : activeView === 'guru' ? (
          isTeacher ? (
            <div className="isolated-page-view guru-page-view">
              <PanelGuru
                onBackToDashboard={() => handleNavigate('dashboard')}
                currentUser={currentUser}
                isGuest={isGuest}
              />
            </div>
          ) : (
            <div className="isolated-page-view access-denied-view">
              <div className="access-denied-card">
                <div className="access-denied-icon-wrap">
                  <ShieldAlert size={36} color="#E11D48" />
                </div>
                <h2 className="access-denied-title">Akses Ditolak: Khusus Guru</h2>
                <p className="access-denied-desc">
                  Halaman Panel Guru ini hanya dapat diakses oleh akun Guru resmi KimiaKu yang terdaftar.
                </p>
                <button
                  type="button"
                  className="btn-access-denied-back"
                  onClick={() => handleNavigate('dashboard')}
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )
        ) : activeView === 'referensi' ? (
          <div className="isolated-page-view referensi-page-view">
            <ReferensiSection />
          </div>
        ) : (
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

        <footer className="kimiaku-manual-guide-footer">
          <div className="manual-guide-content">
            <div className="manual-guide-text">
              <strong>Petunjuk Penggunaan Website KimiaKu</strong>
              <span>Butuh panduan navigasi modul POE, simulasi partikulat, atau kuis? Buka kembali kapan saja.</span>
            </div>
            <button
              type="button"
              className="btn-reopen-onboarding"
              onClick={() => setIsOnboardingOpen(true)}
            >
              <HelpCircle size={16} />
              <span>Lihat Petunjuk Penggunaan</span>
            </button>
          </div>
        </footer>
      </ResponsiveLayout>

      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={handleOpenModule}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
      />
    </>
  )
}
