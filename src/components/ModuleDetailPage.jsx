import React, { useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Atom,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  FlaskConical,
  GitMerge,
  BookMarked
} from 'lucide-react'
import PoeInteractiveSection from './PoeInteractiveSection'
import RealLifeVideoLab from './RealLifeVideoLab'
import ConceptMindMap from './ConceptMindMap'
import GlossaryModal from './GlossaryModal'

export default function ModuleDetailPage({
  module,
  initialTab = 'materi',
  onBack,
  isCompleted = false,
  onToggleComplete,
  _onSaveQuizScore,
  savedQuizScore = null,
  onCompletePoe,
  isPoeCompleted = false,
  onOpenKuis,
  currentUser,
  isGuest
}) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'materi' | 'simulasi' | 'lab-video' | 'mindmap'
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false)

  if (!module) return null

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const scrollContainer = document.querySelector('.main-content-scroll-area')
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
  }

  const renderFormulaBadges = (badges) => {
    if (!badges) return null
    return badges.map((badge, idx) => (
      <div key={idx} className="formula-pill">
        <span className="formula-pill-label">{badge.label}:</span>
        <span className="formula-pill-code">
          {badge.formulaParts.map((part, pIdx) => {
            if (part.sub) {
              return <sub key={pIdx}>{part.sub}</sub>
            }
            if (part.sup) {
              return <sup key={pIdx}>{part.sup}</sup>
            }
            return <span key={pIdx}>{part.text}</span>
          })}
        </span>
      </div>
    ))
  }

  const renderSampleReaction = (reaction) => {
    if (!reaction) return null
    return (
      <div className="reaction-equation-box">
        <div className="equation-label">Persamaan Reaksi Terkait:</div>
        <div className="equation-formula">
          {reaction.reactants.map((r, i) => (
            <span key={`react-${i}`}>
              {i > 0 && <span className="operator"> + </span>}
              {r.coeff && r.coeff !== '1' && <span className="coeff">{r.coeff}</span>}
              <span className="element">{r.formula}</span>
              {r.sub && <sub>{r.sub}</sub>}
              {r.formulaAfter && <span className="element">{r.formulaAfter}</span>}
              {r.sub2 && <sub>{r.sub2}</sub>}
              {r.formulaAfter2 && <span className="element">{r.formulaAfter2}</span>}
              {r.sub3 && <sub>{r.sub3}</sub>}
              {r.state && <span className="state">({r.state})</span>}
            </span>
          ))}
          <span className="operator arrow"> → </span>
          {reaction.products.map((p, i) => (
            <span key={`prod-${i}`}>
              {i > 0 && <span className="operator"> + </span>}
              {p.coeff && p.coeff !== '1' && <span className="coeff">{p.coeff}</span>}
              <span className="element">{p.formula}</span>
              {p.sub && <sub>{p.sub}</sub>}
              {p.formulaAfter && <span className="element">{p.formulaAfter}</span>}
              {p.state && <span className="state">({p.state})</span>}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="module-detail-fullpage-container">
      {/* 1. TOP BAR NAVIGASI DETAIL MODUL (Full Page View) */}
      <div className="module-detail-topbar">
        <button
          type="button"
          className="btn-back-to-modules"
          onClick={onBack}
          title="Kembali ke Daftar 3 Modul Laju Reaksi"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Daftar Modul</span>
        </button>

        <div className="module-topbar-actions">
          {/* Tombol Buka Glosarium Kimia */}
          <button
            type="button"
            className="btn-open-glossary-topbar"
            onClick={() => setIsGlossaryOpen(true)}
            title="Buka Kamus Mini Glosarium Kimia"
          >
            <BookMarked size={16} />
            <span>Kamus Glosarium</span>
          </button>

          {/* Tombol Toggle Selesai */}
          {onToggleComplete && (
            <button
              type="button"
              className={`btn-toggle-module-done ${isCompleted ? 'completed' : ''}`}
              onClick={() => onToggleComplete(module.id)}
            >
              <CheckCircle2 size={16} />
              <span>{isCompleted ? 'Modul Selesai' : 'Tandai Selesai'}</span>
            </button>
          )}

          {/* Tombol Kuis Diagnostik */}
          {onOpenKuis && (
            <button
              type="button"
              className="btn-quick-quiz-topbar"
              onClick={onOpenKuis}
              title="Kerjakan Kuis Diagnostik 5 Soal"
            >
              <HelpCircle size={16} />
              <span>{savedQuizScore !== null ? `Skor Kuis: ${savedQuizScore}%` : 'Kuis Diagnostik'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO BANNER MODUL LENGKAP */}
      <header className={`module-detail-hero ${module.accentColor}`}>
        <div className="module-hero-main-info">
          <div className="module-meta-pills-row">
            <span className="meta-number-tag">{module.badge}</span>
            <span className="meta-category-tag">{module.category}</span>
            <span className="meta-time-tag">
              <Clock size={13} />
              <span>Estimasi: {module.estimatedTime}</span>
            </span>
            {isPoeCompleted && (
              <span className="meta-poe-done-tag">
                <Sparkles size={13} />
                <span>POE Terselesaikan</span>
              </span>
            )}
          </div>

          <h1 className="module-detail-title">{module.title}</h1>
          <p className="module-detail-subtitle">{module.subtitle}</p>
          <p className="module-detail-desc">{module.description}</p>
        </div>
      </header>

      {/* 3. TAB NAVIGASI HALAMAN PENUH (Sticky) */}
      <nav className="module-detail-tabs-nav" aria-label="Tab Pembelajaran Modul">
        <button
          type="button"
          className={`tab-nav-item ${activeTab === 'materi' ? 'active' : ''}`}
          onClick={() => handleTabChange('materi')}
        >
          <BookOpen size={18} />
          <span>1. Materi & Konsep</span>
        </button>

        <button
          type="button"
          className={`tab-nav-item ${activeTab === 'simulasi' ? 'active' : ''}`}
          onClick={() => handleTabChange('simulasi')}
        >
          <Atom size={18} />
          <span>2. Sintaks POE Interaktif</span>
        </button>

        <button
          type="button"
          className={`tab-nav-item ${activeTab === 'lab-video' ? 'active' : ''}`}
          onClick={() => handleTabChange('lab-video')}
        >
          <FlaskConical size={18} />
          <span>3. Video Lab & Fenomena Nyata</span>
        </button>

        <button
          type="button"
          className={`tab-nav-item ${activeTab === 'mindmap' ? 'active' : ''}`}
          onClick={() => handleTabChange('mindmap')}
        >
          <GitMerge size={18} />
          <span>4. Peta Konsep & Glosarium</span>
        </button>
      </nav>

      {/* 4. KONTEN TAB UTAMA */}
      <div className="module-tab-body-container">
        {/* ========================================================
            TAB 1: MATERI & KONSEP LENGKAP
            ======================================================== */}
        {activeTab === 'materi' && (
          <div className="tab-pane-materi">
            {/* Seksi Poin-Poin Kunci */}
            <div className="materi-card-box">
              <div className="card-box-header">
                <Sparkles size={18} className="text-coral" />
                <h3 className="card-box-title">Intisari Konsep Penting</h3>
              </div>
              <ul className="key-points-grid">
                {module.keyPoints.map((point, idx) => (
                  <li key={idx} className="key-point-item">
                    <span className="point-bullet-num">{idx + 1}</span>
                    <p className="point-text">{point}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formula & Persamaan Kimia */}
            <div className="materi-card-box">
              <div className="card-box-header">
                <Atom size={18} className="text-indigo" />
                <h3 className="card-box-title">Notasi & Persamaan Reaksi Baku</h3>
              </div>
              <div className="formula-and-reaction-wrap">
                <div className="formulas-wrapper">
                  <span className="label-bold">Kaidah Notasi:</span>
                  <div className="formula-pills-row">{renderFormulaBadges(module.formulaBadges)}</div>
                </div>
                {renderSampleReaction(module.sampleReaction)}
              </div>
            </div>

            {/* Uraian Komprehensif per Bagian */}
            {module.comprehensiveContent && (
              <div className="materi-card-box">
                <div className="card-box-header">
                  <BookOpen size={18} className="text-teal" />
                  <h3 className="card-box-title">Uraian Materi Mendalam (Kurikulum Merdeka)</h3>
                </div>

                <div className="comprehensive-intro-text">
                  <p>{module.comprehensiveContent.introduction}</p>
                </div>

                <div className="sections-detail-list">
                  {module.comprehensiveContent.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="section-detail-item">
                      <h4 className="section-item-title">{sec.title}</h4>
                      <p className="section-item-text">{sec.explanation}</p>

                      {sec.notations && sec.notations.length > 0 && (
                        <div className="notations-chips-wrap">
                          {sec.notations.map((note, nIdx) => (
                            <span key={nIdx} className="notation-chip">
                              {note}
                            </span>
                          ))}
                        </div>
                      )}

                      {sec.dailyExample && (
                        <div className="daily-example-highlight">
                          <strong>Contoh Sehari-hari:</strong> {sec.dailyExample}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Lanjut ke Sintaks POE */}
            <div className="materi-bottom-cta-banner">
              <div className="cta-banner-text">
                <Sparkles size={24} className="text-coral" />
                <div>
                  <h4 className="cta-banner-title">Siap Menguji Pemahaman Lewat Sintaks POE?</h4>
                  <p className="cta-banner-sub">
                    Buktikan dugaan awal Anda dengan simulasi partikel interaktif dan kirimkan analisis Anda ke Panel Guru!
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-cta-go-poe"
                onClick={() => handleTabChange('simulasi')}
              >
                <span>Buka Sintaks POE Sekarang</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: SINTAKS POE INTERAKTIF (Predict - Observe - Explain)
            ======================================================== */}
        {activeTab === 'simulasi' && (
          <div className="tab-pane-poe">
            <PoeInteractiveSection
              key={module.id}
              module={module}
              onCompletePoe={onCompletePoe}
              currentUser={currentUser}
              isGuest={isGuest}
            />
          </div>
        )}

        {/* ========================================================
            TAB 3: VIDEO LAB NYATA & STUDI KASUS KONTEKSTUAL
            ======================================================== */}
        {activeTab === 'lab-video' && (
          <div className="tab-pane-lab">
            <RealLifeVideoLab />
          </div>
        )}

        {/* ========================================================
            TAB 4: PETA KONSEP & GLOSARIUM
            ======================================================== */}
        {activeTab === 'mindmap' && (
          <div className="tab-pane-mindmap">
            <ConceptMindMap onOpenGlossary={() => setIsGlossaryOpen(true)} />

            {/* Kartu CTA Kuis Diagnostik di Akhir */}
            <div className="mindmap-quiz-cta-card">
              <div className="quiz-cta-left">
                <div className="quiz-cta-badge">Langkah Terakhir Modul</div>
                <h3 className="quiz-cta-title">Uji Kompetensi Kinetika Kimia (5 Soal Diagnostik)</h3>
                <p className="quiz-cta-desc">
                  Ukur pemahaman Anda mengenai seluruh faktor laju reaksi, energi aktivasi (Ea), persamaan laju, dan teori tumbukan. Jawaban tersimpan otomatis secara Local-First dan tersinkronisasi ke Firestore.
                </p>
              </div>
              <div className="quiz-cta-right">
                <button
                  type="button"
                  className="btn-start-quiz-from-module"
                  onClick={onOpenKuis}
                >
                  <HelpCircle size={18} />
                  <span>Mulai Kuis Diagnostik Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Komponen Modal Glosarium Terpisah */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </div>
  )
}
