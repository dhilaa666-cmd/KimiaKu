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
import { subscribeToAuth, isFirebaseConfigured, getFirebaseConfigStatus } from './lib/firebase'
import { resetQuizStore } from './lib/localStore'
import { checkIsTeacher } from './lib/authConfig'
import { FlaskConical, ShieldAlert, HelpCircle, HardDrive, X } from 'lucide-react'
import { MODULES_DATA } from './data/modulesData'
import './App.css'

const STORAGE_PROGRESS_KEY = 'kimiaku-progres'
const STORAGE_QUIZ_KEY = 'kimiaku-kuis'
const STORAGE_POE_KEY = 'kimiaku-poe'

/**
 * Membaca rute aktif dari URL Hash (#/...) atau sessionStorage (Temuan 03-11)
 * Menjaga state halaman siswa tetap bertahan saat halaman di-refresh
 * @returns {{ view: string, moduleId: string | null, moduleTab: string }}
 */
function parseLocationState() {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim()
    if (rawHash) {
      const parts = rawHash.split('/').filter(Boolean)
      const route = parts[0]
      const id = parts[1] || null
      const tab = parts[2] || 'materi'

      if (route === 'modul') {
        return {
          view: 'modul',
          moduleId: id,
          moduleTab: tab
        }
      }
      if (route === 'kuis' || route === 'kuis-diagnostik' || route === 'quiz') {
        return { view: 'kuis', moduleId: null, moduleTab: 'materi' }
      }
      if (route === 'guru' || route === 'panel-guru') {
        return { view: 'guru', moduleId: null, moduleTab: 'materi' }
      }
      if (route === 'referensi' || route === 'pustaka') {
        return { view: 'referensi', moduleId: null, moduleTab: 'materi' }
      }
      if (route === 'dashboard' || route === 'home') {
        return { view: 'dashboard', moduleId: null, moduleTab: 'materi' }
      }
    }

    // Fallback ke sessionStorage jika URL hash kosong
    try {
      const saved = sessionStorage.getItem('kimiaku-active-view-state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.view) {
          return {
            view: parsed.view,
            moduleId: parsed.moduleId || null,
            moduleTab: parsed.moduleTab || 'materi'
          }
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  return { view: 'dashboard', moduleId: null, moduleTab: 'materi' }
}

/**
 * Menyinkronkan rute aktif ke URL hash dan sessionStorage (Temuan 03-11)
 */
function syncLocationState(view, moduleId, tab) {
  if (typeof window === 'undefined') return
  let hashPath = `/${view}`
  if (view === 'modul' && moduleId) {
    hashPath = `/modul/${moduleId}`
    if (tab && tab !== 'materi') {
      hashPath += `/${tab}`
    }
  }

  try {
    if (window.location.hash !== `#${hashPath}`) {
      window.history.replaceState(null, '', `#${hashPath}`)
    }
    sessionStorage.setItem(
      'kimiaku-active-view-state',
      JSON.stringify({
        view,
        moduleId: view === 'modul' ? moduleId : null,
        moduleTab: tab || 'materi'
      })
    )
  } catch (e) {
    console.warn(e)
  }
}

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

  // Temuan 03-11: Inisialisasi posisi halaman dari hash URL / sessionStorage
  const [currentView, setCurrentView] = useState(() => parseLocationState().view)
  const [activeModuleId, setActiveModuleId] = useState(() => parseLocationState().moduleId)
  const [activeModuleTab, setActiveModuleTab] = useState(() => parseLocationState().moduleTab)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [configBannerDismissed, setConfigBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('kimiaku-hide-config-banner') === 'true'
    } catch {
      return false
    }
  })

  const isTeacher = checkIsTeacher(currentUser)
  const activeView = (currentView === 'guru' && !isTeacher) ? 'dashboard' : currentView

  useEffect(() => {
    // Temuan 03-01: Jika konfigurasi Firebase kosong atau tidak valid,
    // langsung jalankan mode tamu lokal secara otomatis agar aplikasi tidak crash atau tertahan di loading
    if (!isFirebaseConfigured) {
      setIsGuest(true)
      setIsAuthLoading(false)
      setCurrentUser(null)
      try {
        localStorage.setItem('kimiaku-guest-session', 'true')
      } catch (e) {
        console.warn(e)
      }
      return
    }

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

  // Temuan 03-02: Muat progres topik, nilai kuis, dan POE yang terisolasi per UID akun aktif
  // Mencegah Akun B melihat riwayat progres atau skor milik Akun A saat berganti akun
  useEffect(() => {
    const accId = currentUser?.uid || (isGuest ? 'guest' : 'guest')
    const progressKey = `${STORAGE_PROGRESS_KEY}-${accId}`
    const quizKey = `${STORAGE_QUIZ_KEY}-${accId}`
    const poeKey = `${STORAGE_POE_KEY}-${accId}`

    try {
      const saved = localStorage.getItem(progressKey) || (accId === 'guest' ? localStorage.getItem(STORAGE_PROGRESS_KEY) : null)
      setCompletedTopics(saved ? JSON.parse(saved) : [])
    } catch {
      setCompletedTopics([])
    }

    try {
      const saved = localStorage.getItem(quizKey) || (accId === 'guest' ? localStorage.getItem(STORAGE_QUIZ_KEY) : null)
      setQuizScores(saved ? JSON.parse(saved) : {})
    } catch {
      setQuizScores({})
    }

    try {
      const saved = localStorage.getItem(poeKey) || (accId === 'guest' ? localStorage.getItem(STORAGE_POE_KEY) : null)
      setPoeRecords(saved ? JSON.parse(saved) : [])
    } catch {
      setPoeRecords([])
    }
  }, [currentUser?.uid, isGuest])

  useEffect(() => {
    const accId = currentUser?.uid || (isGuest ? 'guest' : 'guest')
    const progressKey = `${STORAGE_PROGRESS_KEY}-${accId}`
    try {
      localStorage.setItem(progressKey, JSON.stringify(completedTopics))
      if (accId === 'guest') {
        localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(completedTopics))
      }
    } catch (e) {
      console.warn('Gagal menyimpan progres ke localStorage:', e)
    }
  }, [completedTopics, currentUser?.uid, isGuest])

  useEffect(() => {
    const accId = currentUser?.uid || (isGuest ? 'guest' : 'guest')
    const quizKey = `${STORAGE_QUIZ_KEY}-${accId}`
    try {
      localStorage.setItem(quizKey, JSON.stringify(quizScores))
      if (accId === 'guest') {
        localStorage.setItem(STORAGE_QUIZ_KEY, JSON.stringify(quizScores))
      }
    } catch (e) {
      console.warn('Gagal menyimpan nilai kuis ke localStorage:', e)
    }
  }, [quizScores, currentUser?.uid, isGuest])

  useEffect(() => {
    const accId = currentUser?.uid || (isGuest ? 'guest' : 'guest')
    const poeKey = `${STORAGE_POE_KEY}-${accId}`
    try {
      localStorage.setItem(poeKey, JSON.stringify(poeRecords))
      if (accId === 'guest') {
        localStorage.setItem(STORAGE_POE_KEY, JSON.stringify(poeRecords))
      }
    } catch (e) {
      console.warn('Gagal menyimpan data POE ke localStorage:', e)
    }
  }, [poeRecords, currentUser?.uid, isGuest])

  // Temuan 03-11: Sinkronisasi URL hash dan sessionStorage saat state rute berubah
  useEffect(() => {
    syncLocationState(currentView, activeModuleId, activeModuleTab)
  }, [currentView, activeModuleId, activeModuleTab])

  // Temuan 03-11: Tangkap navigasi browser (Back/Forward) via hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const state = parseLocationState()
      setCurrentView(state.view)
      setActiveModuleId(state.moduleId)
      setActiveModuleTab(state.moduleTab)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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
      const accId = currentUser?.uid || (isGuest ? 'guest' : 'guest')
      setCompletedTopics([])
      setQuizScores({})
      setPoeRecords([])
      resetQuizStore(accId)
      try {
        localStorage.removeItem(`${STORAGE_PROGRESS_KEY}-${accId}`)
        localStorage.removeItem(`${STORAGE_QUIZ_KEY}-${accId}`)
        localStorage.removeItem(`${STORAGE_POE_KEY}-${accId}`)
        if (accId === 'guest') {
          localStorage.removeItem(STORAGE_PROGRESS_KEY)
          localStorage.removeItem(STORAGE_QUIZ_KEY)
          localStorage.removeItem(STORAGE_POE_KEY)
        }
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
      sessionStorage.removeItem('kimiaku-active-view-state')
      window.history.replaceState(null, '', '#/dashboard')
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
        {/* Temuan 03-01: Indikator Status Konfigurasi Firebase yang Ramah & Edukatif */}
        {!isFirebaseConfigured && !configBannerDismissed && (
          <aside className="firebase-status-banner" role="status" aria-label="Status Konfigurasi Firebase">
            <div className="firebase-status-banner-inner">
              <div className="firebase-status-icon-box">
                <HardDrive size={18} className="firebase-status-icon text-teal" />
              </div>
              <div className="firebase-status-text-wrap">
                <div className="firebase-status-title-row">
                  <span className="firebase-status-badge">Mode Tamu Lokal Aktif</span>
                  <span className="firebase-status-subtitle">Konfigurasi Firebase belum terpasang (.env)</span>
                </div>
                <p className="firebase-status-desc">
                  Aplikasi KimiaKu berjalan dalam Mode Tamu Lokal. Seluruh fitur modul POE, simulasi partikel 2D Canvas, dan kuis tetap berfungsi normal menggunakan penyimpanan lokal peramban. Untuk mengaktifkan sinkronisasi cloud/Google Login, buat berkas <code>.env</code> berdasarkan template <code>.env.example</code>.
                </p>
              </div>
              <button
                type="button"
                className="btn-dismiss-firebase-banner"
                onClick={() => {
                  setConfigBannerDismissed(true)
                  try {
                    sessionStorage.setItem('kimiaku-hide-config-banner', 'true')
                  } catch (e) {
                    console.warn(e)
                  }
                }}
                title="Sembunyikan pemberitahuan"
                aria-label="Sembunyikan pemberitahuan konfigurasi"
              >
                <X size={15} />
              </button>
            </div>
          </aside>
        )}

        {activeView === 'modul' ? (
          activeModule ? (
            <ModuleDetailPage
              module={activeModule}
              initialTab={activeModuleTab}
              onTabChange={(newTab) => setActiveModuleTab(newTab)}
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
              currentUser={currentUser}
              isGuest={isGuest}
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
