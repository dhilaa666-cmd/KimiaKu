import React, { useState, useMemo } from 'react'
import { Search, X, BookOpen, Atom, HelpCircle, ArrowRight } from 'lucide-react'
import { MODULES_DATA } from '../data/modulesData'
import { QUIZ_DATA } from '../data/quizData'

export default function SearchBar({ isOpen, onClose, onSelectModule }) {
  const [query, setQuery] = useState('')

  // Indexing searchable items across modules and quizzes
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) return []

    const results = []

    MODULES_DATA.forEach((module) => {
      // 1. Match module title/subtitle/description
      if (
        module.title.toLowerCase().includes(q) ||
        module.subtitle.toLowerCase().includes(q) ||
        module.description.toLowerCase().includes(q) ||
        module.category.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'module',
          moduleId: module.id,
          tab: 'materi',
          title: module.title,
          subtitle: module.subtitle,
          matchedIn: 'Modul Utama',
          accent: module.accentColor
        })
      }

      // 2. Match module key points
      module.keyPoints.forEach((point) => {
        if (point.toLowerCase().includes(q)) {
          results.push({
            type: 'concept',
            moduleId: module.id,
            tab: 'materi',
            title: `Konsep: ${module.title}`,
            subtitle: point,
            matchedIn: 'Poin Kunci Materi',
            accent: module.accentColor
          })
        }
      })

      // 3. Match comprehensive sections
      if (module.comprehensiveContent?.sections) {
        module.comprehensiveContent.sections.forEach((sec) => {
          if (
            sec.title.toLowerCase().includes(q) ||
            sec.explanation.toLowerCase().includes(q) ||
            sec.dailyExample?.toLowerCase().includes(q)
          ) {
            results.push({
              type: 'section',
              moduleId: module.id,
              tab: 'materi',
              title: sec.title,
              subtitle: sec.explanation.slice(0, 120) + '...',
              matchedIn: `Materi ${module.title}`,
              accent: module.accentColor
            })
          }
        })
      }

      // 4. Match POE scenario
      if (
        module.poeScenario?.question.toLowerCase().includes(q) ||
        module.poeScenario?.explanationPoe.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'poe',
          moduleId: module.id,
          tab: 'simulasi',
          title: `Simulasi POE: ${module.title}`,
          subtitle: module.poeScenario.question,
          matchedIn: 'Aktivitas Predict-Observe-Explain',
          accent: module.accentColor
        })
      }
    })

    // 5. Match Quizzes
    Object.entries(QUIZ_DATA).forEach(([modId, questions]) => {
      const parentMod = MODULES_DATA.find((m) => m.id === modId)
      questions.forEach((qItem, idx) => {
        if (
          qItem.question.toLowerCase().includes(q) ||
          qItem.explanation.toLowerCase().includes(q) ||
          qItem.options.some((opt) => opt.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'quiz',
            moduleId: modId,
            tab: 'kuis',
            title: `Soal Kuis ${idx + 1}: ${parentMod ? parentMod.title : modId}`,
            subtitle: qItem.question,
            matchedIn: 'Bank Soal Kuis Laju Reaksi',
            accent: parentMod ? parentMod.accentColor : 'cyan'
          })
        }
      })
    })

    return results.slice(0, 8)
  }, [query])

  if (!isOpen) return null

  const handleSelect = (item) => {
    onSelectModule(item.moduleId, item.tab)
    onClose()
  }

  const getResultIcon = (type) => {
    switch (type) {
      case 'module':
      case 'section':
      case 'concept':
        return <BookOpen size={16} />
      case 'poe':
        return <Atom size={16} />
      case 'quiz':
        return <HelpCircle size={16} />
      default:
        return <Search size={16} />
    }
  }

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div
        className="search-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian Materi Laju Reaksi"
      >
        <div className="search-input-wrapper">
          <Search size={20} className="search-input-icon" />
          <input
            type="text"
            className="search-text-input"
            placeholder="Cari materi (misal: suhu, katalis, tumbukan, CaCO₃, energi aktivasi)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery('')}
              aria-label="Hapus kata kunci"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="search-body">
          {query.trim().length < 2 ? (
            <div className="search-empty-state">
              <p className="search-hint-title">Ketik minimal 2 huruf untuk mulai mencari materi.</p>
              <div className="search-tag-cloud">
                <span>Rekomendasi kata kunci:</span>
                {['Suhu', 'Konsentrasi', 'Luas Permukaan', 'Katalis', 'Energi Aktivasi', 'Tumbukan Efektif', 'CaCO₃', 'Eksoterm'].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="search-quick-tag"
                      onClick={() => setQuery(tag)}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty-state">
              <p className="search-no-results">
                Tidak ditemukan materi yang cocok dengan "<strong>{query}</strong>". Coba kata kunci kimia lainnya.
              </p>
            </div>
          ) : (
            <div className="search-results-list">
              <div className="search-results-count">
                Ditemukan {searchResults.length} hasil terkait "{query}":
              </div>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  className="search-result-item"
                  onClick={() => handleSelect(item)}
                >
                  <div className={`search-item-icon ${item.accent}`}>
                    {getResultIcon(item.type)}
                  </div>
                  <div className="search-item-info">
                    <div className="search-item-header">
                      <span className="search-item-title">{item.title}</span>
                      <span className="search-item-badge">{item.matchedIn}</span>
                    </div>
                    <p className="search-item-desc">{item.subtitle}</p>
                  </div>
                  <ArrowRight size={16} className="search-item-arrow" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-footer">
          <small>Tekan tombol ESC atau klik di luar untuk menutup</small>
          <button type="button" className="search-close-action" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

