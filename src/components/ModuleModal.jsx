import React, { useState } from 'react'
import {
  X,
  BookOpen,
  Atom,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import PoeSimulation from './PoeSimulation'
import QuizModal from './QuizModal'

export default function ModuleModal({
  module,
  initialTab = 'materi',
  onClose,
  isCompleted = false,
  onToggleComplete,
  onSaveQuizScore,
  savedQuizScore = null,
  onCompletePoe,
  isPoeCompleted = false
}) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'materi' | 'simulasi' | 'kuis'

  if (!module) return null

  const renderFormulaBadges = (badges) => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content large-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header Modal */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className={`modal-icon-wrap ${module.accentColor}`}>
              <Atom size={24} />
            </div>
            <div>
              <div className="modal-badge-row">
                <span className={`category-tag ${module.accentColor}`}>
                  {module.badge} • {module.category}
                </span>
                {savedQuizScore !== null && (
                  <span className="quiz-score-tag">
                    Skor Kuis: <strong>{savedQuizScore}%</strong>
                  </span>
                )}
                {isPoeCompleted && (
                  <span className="poe-done-tag">
                    <Sparkles size={12} />
                    <span>POE Selesai</span>
                  </span>
                )}
              </div>
              <h2 id="modal-title" className="modal-title">
                {module.title}
              </h2>
              <span className="modal-subtitle">{module.subtitle}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Tutup jendela pembelajaran"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3 Main Tabs: Materi | Simulasi POE | Kuis */}
        <div className="modal-tabs">
          <button
            type="button"
            className={`modal-tab ${activeTab === 'materi' ? 'active' : ''}`}
            onClick={() => setActiveTab('materi')}
          >
            <BookOpen size={16} />
            <span>Materi Lengkap</span>
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'simulasi' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulasi')}
          >
            <Atom size={16} />
            <span>Simulasi POE</span>
            {isPoeCompleted && <CheckCircle2 size={14} className="tab-check-icon" />}
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'kuis' ? 'active' : ''}`}
            onClick={() => setActiveTab('kuis')}
          >
            <HelpCircle size={16} />
            <span>Kuis Pemahaman (5 Soal)</span>
            {savedQuizScore !== null && (
              <span className="tab-score-badge">{savedQuizScore}%</span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body custom-scroll">
          {/* TAB 1: MATERI LENGKAP & KOMPREHENSIF */}
          {activeTab === 'materi' && (
            <div className="materi-full-container">
              {/* Seksi Pendahuluan */}
              <div className="materi-intro-banner">
                <p className="intro-text">
                  {module.comprehensiveContent?.introduction || module.description}
                </p>
                <div className="materi-reaction-holder">
                  {renderSampleReaction(module.sampleReaction)}
                </div>
              </div>

              {/* Box Notasi Rumus Kimia Baku */}
              <div className="materi-formulas-strip">
                <div className="formulas-label">Kaidah Notasi & Rumus Baku Kinetika:</div>
                <div className="formula-list">{renderFormulaBadges(module.formulaBadges)}</div>
              </div>

              {/* Sub-bab Pembahasan Materi Detail */}
              <div className="materi-sections-stack">
                {module.comprehensiveContent?.sections?.map((section, idx) => (
                  <div key={idx} className="materi-section-card">
                    <h3 className="section-card-title">{section.title}</h3>
                    <p className="section-card-text">{section.explanation}</p>

                    {section.notations && section.notations.length > 0 && (
                      <div className="section-notations-pill-row">
                        {section.notations.map((n, nIdx) => (
                          <span key={nIdx} className="sec-notation-pill">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}

                    {section.dailyExample && (
                      <div className="section-daily-box">
                        <div className="daily-label">
                          <Sparkles size={14} className="text-amber" />
                          <span>Contoh Nyata Sehari-hari:</span>
                        </div>
                        <p className="daily-text">{section.dailyExample}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Poin Kunci yang Harus Diingat */}
              <div className="materi-keypoints-box">
                <h4 className="keypoints-title">Rangkuman Konsep Kunci:</h4>
                <ul className="points-list">
                  {module.keyPoints.map((pt, idx) => (
                    <li key={idx} className="point-item">
                      <CheckCircle2 size={16} className="point-check" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navigasi Cepat ke Tab Berikutnya */}
              <div className="materi-next-cta">
                <div>
                  <strong>Sudah paham konsep materinya?</strong>
                  <p>Lanjutkan ke pengamatan interaktif dengan pendekatan Predict-Observe-Explain.</p>
                </div>
                <button
                  type="button"
                  className="btn-go-to-poe"
                  onClick={() => setActiveTab('simulasi')}
                >
                  <span>Buka Simulasi POE</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULASI INTERAKTIF DENGAN PENDEKATAN POE */}
          {activeTab === 'simulasi' && (
            <div className="poe-tab-wrapper">
              <PoeSimulation
                module={module}
                onCompletePoe={onCompletePoe}
                isCompleted={isPoeCompleted}
              />
            </div>
          )}

          {/* TAB 3: KUIS MODUL DENGAN UMPAN BALIK SEKETIKA */}
          {activeTab === 'kuis' && (
            <div className="quiz-tab-wrapper">
              <QuizModal
                module={module}
                onSaveQuizScore={onSaveQuizScore}
                savedScore={savedQuizScore}
                onClose={onClose}
              />
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="modal-footer">
          <div className="footer-left-info">
            <button
              type="button"
              className={`btn-modal-progress ${isCompleted ? 'completed' : ''}`}
              onClick={() => onToggleComplete(module.id)}
            >
              <CheckCircle2 size={16} />
              <span>{isCompleted ? 'Tandai Belum Selesai' : 'Tandai Selesai Dipelajari'}</span>
            </button>
          </div>

          <div className="footer-right-actions">
            <button
              type="button"
              className="btn-modal-close"
              onClick={onClose}
            >
              Tutup Jendela
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
