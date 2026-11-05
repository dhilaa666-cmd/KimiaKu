import React from 'react'
import {
  Flame,
  Layers,
  Atom,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  BookOpen,
  ChevronRight,
  HelpCircle
} from 'lucide-react'
import { MODULES_DATA } from '../data/modulesData'

export default function TopicCards({
  completedTopics = [],
  onToggleTopicProgress,
  onOpenModule,
  quizScores = {},
  poeRecords = []
}) {
  const getTopicIcon = (id) => {
    switch (id) {
      case 'faktor-laju':
        return <Flame size={24} className="topic-icon-svg emerald" />
      case 'teori-tumbukan':
        return <Atom size={24} className="topic-icon-svg amber" />
      case 'makroskopis-fenomena':
        return <Layers size={24} className="topic-icon-svg indigo" />
      default:
        return <BookOpen size={24} className="topic-icon-svg" />
    }
  }

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
    <section id="modul-belajar" className="topic-cards-section">
      <div className="section-header">
        <div className="section-badge">
          <BookOpen size={15} />
          <span>Materi Inti Fase F SMA Kelas XI • Pendekatan POE</span>
        </div>
        <h2 className="section-title">Tiga Modul Utama Laju Reaksi</h2>
        <p className="section-subtitle">
          Pahami konsep abstrak faktor laju reaksi dan teori tumbukan melalui visualisasi mikroskopis dan bukti
          makroskopis yang nyata.
        </p>
      </div>

      {/* Grid 3 Kartu Modul Utama Sesuai PRD.md */}
      <div className="cards-grid">
        {MODULES_DATA.map((module) => {
          const isCompleted = completedTopics.includes(module.id)
          const quizScore = quizScores[module.id]
          const isPoeDone = poeRecords.includes(module.id)

          return (
            <article
              key={module.id}
              className={`topic-card card-${module.accentColor} ${isCompleted ? 'is-completed' : ''}`}
            >
              <div className="card-top">
                <div className="card-badge-row">
                  <span className={`category-tag ${module.accentColor}`}>
                    {module.badge} • {module.category}
                  </span>
                  <button
                    type="button"
                    className={`status-toggle-btn ${isCompleted ? 'completed' : 'pending'}`}
                    onClick={() => onToggleTopicProgress(module.id)}
                    title={isCompleted ? 'Klik untuk tandai belum selesai' : 'Klik untuk tandai selesai'}
                    aria-label={`Status modul ${module.title}`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 size={16} className="status-icon completed" />
                        <span>Selesai</span>
                      </>
                    ) : (
                      <>
                        <Circle size={16} className="status-icon pending" />
                        <span>Belum Selesai</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="card-title-row">
                  <div className={`topic-icon-box ${module.accentColor}`}>
                    {getTopicIcon(module.id)}
                  </div>
                  <div>
                    <h3 className="card-title">{module.title}</h3>
                    <p className="card-subtitle">{module.subtitle}</p>
                  </div>
                </div>

                <p className="card-description">{module.description}</p>
              </div>

              {/* Box Notasi Rumus Kimia Baku */}
              <div className="card-formulas">
                <div className="formulas-label">Kaidah Notasi Baku:</div>
                <div className="formula-list">{renderFormulaBadges(module.formulaBadges)}</div>
              </div>

              {/* Persamaan Reaksi Setara */}
              <div className="card-reaction">
                {renderSampleReaction(module.sampleReaction)}
              </div>

              {/* Status Lencana POE & Kuis */}
              <div className="card-status-badges-row">
                {isPoeDone ? (
                  <span className="badge-chip poe-done">
                    <Sparkles size={12} />
                    <span>Simulasi POE Selesai</span>
                  </span>
                ) : (
                  <span className="badge-chip poe-pending">
                    <Atom size={12} />
                    <span>Ada Simulasi POE</span>
                  </span>
                )}

                {quizScore !== undefined ? (
                  <button
                    type="button"
                    className="badge-chip quiz-done clickable"
                    onClick={() => onOpenModule(module.id, 'kuis')}
                    title="Buka Kuis Diagnostik (Lihat Skor & Pembahasan)"
                  >
                    <CheckCircle2 size={12} />
                    <span>Skor Kuis: {quizScore}%</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="badge-chip quiz-pending clickable"
                    onClick={() => onOpenModule(module.id, 'kuis')}
                    title="Kerjakan Kuis Diagnostik 5 Soal"
                  >
                    <HelpCircle size={12} />
                    <span>Kuis 5 Soal</span>
                  </button>
                )}
              </div>

              {/* Card Meta & Tombol Aksi */}
              <div className="card-bottom">
                <div className="card-meta">
                  <span className="meta-item">
                    <Clock size={14} />
                    <span>{module.estimatedTime}</span>
                  </span>
                  <span className="meta-item">
                    <Sparkles size={14} />
                    <span>3 Tahap POE</span>
                  </span>
                </div>

                <div className="card-action-group">
                  <button
                    type="button"
                    className="btn-card-quick-poe"
                    onClick={() => onOpenModule(module.id, 'simulasi')}
                    title="Buka simulasi interaktif POE"
                  >
                    <Atom size={15} />
                    <span>Uji POE</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-explore ${module.accentColor}`}
                    onClick={() => onOpenModule(module.id, 'materi')}
                  >
                    <span>Buka Materi</span>
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
