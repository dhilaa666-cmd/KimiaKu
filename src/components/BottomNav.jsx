import React from 'react'
import {
  Home,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Bookmark,
  User
} from 'lucide-react'

export default function BottomNav({ currentView, onNavigate, isTeacher = false }) {
  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home
    },
    {
      id: 'modul',
      label: 'Materi',
      icon: BookOpen
    },
    {
      id: 'kuis',
      label: 'Kuis',
      icon: HelpCircle
    },
    {
      id: 'guru',
      label: 'Guru',
      icon: GraduationCap,
      teacherOnly: true
    },
    {
      id: 'referensi',
      label: 'Pustaka',
      icon: Bookmark
    },
    {
      id: 'profil',
      label: 'Profil',
      icon: User
    }
  ]

  // Filter: Sembunyikan Panel Guru di layar mobile jika bukan Guru
  const navItems = allNavItems.filter((item) => !item.teacherOnly || isTeacher)

  return (
    <nav className="mobile-bottom-nav-bar block md:hidden" aria-label="Navigasi Bawah Layar Mobile">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const IconComp = item.icon
          const isHomeActive = currentView === 'dashboard' || currentView === 'home'
          const isActive = item.id === 'dashboard' ? isHomeActive : currentView === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav-item transition-all duration-200 ${
                isActive
                  ? 'active bg-rose-50 text-rose-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onNavigate(item.id)}
              aria-label={`Buka halaman ${item.label}`}
            >
              <div className="bottom-nav-icon-wrap">
                <IconComp size={20} className="bottom-nav-icon" />
                {isActive && <span className="bottom-nav-active-dot" />}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
