import React from 'react'
import {
  LayoutDashboard,
  Layers,
  HelpCircle,
  GraduationCap,
  Bookmark,
  LogOut,
  FlaskConical,
  Sparkles
} from 'lucide-react'
import { checkIsTeacher } from '../lib/authConfig'

export default function Sidebar({
  currentView,
  onNavigate,
  currentUser,
  isGuest,
  onLogout,
  completedTopicsCount = 0,
  totalTopicsCount = 3,
  isTeacher
}) {
  const verifiedTeacher = typeof isTeacher === 'boolean' ? isTeacher : checkIsTeacher(currentUser)
  const percent = Math.round((completedTopicsCount / totalTopicsCount) * 100)
  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    (isGuest ? 'Siswa Tamu' : 'Siswa')
  const email = currentUser?.email || 'Mode Tamu Lokal'

  const allMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard / Beranda',
      sublabel: 'Ikhtisar & Pengantar',
      icon: LayoutDashboard
    },
    {
      id: 'modul',
      label: 'Modul POE',
      sublabel: '3 Modul Laju Reaksi',
      icon: Layers
    },
    {
      id: 'kuis',
      label: 'Kuis Evaluasi',
      sublabel: '10 Soal Evaluasi',
      icon: HelpCircle
    },
    {
      id: 'guru',
      label: 'Panel Guru',
      sublabel: 'Hasil & Evaluasi Kelas',
      icon: GraduationCap,
      teacherOnly: true
    },
    {
      id: 'referensi',
      label: 'Referensi & Pustaka',
      sublabel: 'Buku & Sumber Belajar',
      icon: Bookmark
    }
  ]

  // Filter: Sembunyikan Panel Guru jika bukan Guru
  const menuItems = allMenuItems.filter((item) => !item.teacherOnly || verifiedTeacher)

  return (
    <aside className="app-sidebar hidden md:flex" aria-label="Sidebar Navigasi Desktop">
      {/* 1. Header Sidebar: Logo & Identitas Brand KimiaKu */}
      <div className="sidebar-brand-box">
        <div className="sidebar-logo-icon-wrap">
          <FlaskConical size={22} className="sidebar-logo-icon" />
          <span className="sidebar-logo-glow" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">KimiaKu</span>
          <span className="sidebar-badge-fase">Fase F • Kelas XI</span>
        </div>
      </div>

      {/* 2. Menu Navigasi Utama dengan Indikator Menu Aktif Jelas */}
      <nav className="sidebar-nav-list" aria-label="Menu Utama">
        <div className="sidebar-section-label">MENU UTAMA</div>
        {menuItems.map((item) => {
          const IconComp = item.icon
          const isHomeActive = currentView === 'dashboard' || currentView === 'home'
          const isActive = item.id === 'dashboard' ? isHomeActive : currentView === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item transition-all duration-200 ${
                isActive
                  ? 'active bg-rose-50 text-rose-600 font-semibold border-r-4 border-rose-500'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="nav-item-icon-wrap">
                <IconComp size={19} className="nav-item-icon" />
              </div>
              <div className="nav-item-text-wrap">
                <span className="nav-item-label">{item.label}</span>
                <small className="nav-item-sublabel">{item.sublabel}</small>
              </div>
              {isActive && <div className="active-pill-bar" />}
            </button>
          )
        })}
      </nav>

      {/* 3. Kartu Ringkas Progres Belajar di Sidebar */}
      <div className="sidebar-progress-card">
        <div className="progress-card-top">
          <Sparkles size={16} className="text-coral" />
          <strong>Progres Modul</strong>
        </div>
        <div className="progress-card-bar">
          <div className="progress-card-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="progress-card-footer">
          <span>{completedTopicsCount} dari {totalTopicsCount} Selesai</span>
          <span className="progress-percent-text">{percent}%</span>
        </div>
      </div>

      {/* 4. Bagian Profil Pengguna & Logout di Bawah Sidebar */}
      <div className="sidebar-footer-user">
        <div className="user-info-row">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt={displayName} className="sidebar-user-avatar" />
          ) : (
            <div className="sidebar-user-fallback">
              {displayName[0].toUpperCase()}
            </div>
          )}
          <div className="sidebar-user-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong className="sidebar-user-name">{displayName}</strong>
              {verifiedTeacher && (
                <span className="sidebar-role-badge-teacher">Guru</span>
              )}
            </div>
            <small className="sidebar-user-email">{email}</small>
          </div>
        </div>

        <button
          type="button"
          className="btn-sidebar-logout transition-all duration-200"
          onClick={onLogout}
          title="Keluar dari sesi akun saat ini"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
