import React, { useState } from 'react'
import {
  Scale,
  Flame,
  Droplets,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  ChevronRight,
  X
} from 'lucide-react'
import { TOPICS_DATA } from '../data/topicsData'

export default function TopicCards({ completedTopics = [], onToggleTopicProgress }) {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [activeTab, setActiveTab] = useState('ringkasan') // 'ringkasan' | 'simulasi'

  // Mini-simulation states for educational interactivity
  const [molGrams, setMolGrams] = useState(36) // Stoikiometri: misal H2O (Mr = 18)
  const [isExothermic, setIsExothermic] = useState(true) // Termokimia
  const [phValue, setPhValue] = useState(7.0) // Asam Basa

  const getTopicIcon = (id) => {
    switch (id) {
      case 'stoikiometri':
        return <Scale size={24} className="topic-icon-svg emerald" />
      case 'termokimia':
        return <Flame size={24} className="topic-icon-svg amber" />
      case 'asam-basa':
        return <Droplets size={24} className="topic-icon-svg indigo" />
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
        <div className="equation-label">Contoh Persamaan Reaksi Setara:</div>
        <div className="equation-formula">
          {reaction.reactants.map((r, i) => (
            <span key={`react-${i}`}>
              {i > 0 && <span className="operator"> + </span>}
              {r.coeff !== '1' && <span className="coeff">{r.coeff}</span>}
              <span className="element">{r.formula}</span>
              {r.sub && <sub>{r.sub}</sub>}
              {r.formulaAfter && <span className="element">{r.formulaAfter}</span>}
              {r.state && <span className="state">({r.state})</span>}
            </span>
          ))}
          <span className="operator arrow"> → </span>
          {reaction.products.map((p, i) => (
            <span key={`prod-${i}`}>
              {i > 0 && <span className="operator"> + </span>}
              {p.coeff !== '1' && <span className="coeff">{p.coeff}</span>}
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
          <span>Materi Inti Semester Gasal & Genap</span>
        </div>
        <h2 className="section-title">Pilih Modul Pembelajaran</h2>
        <p className="section-subtitle">
          Tiga konsep penting kimia SMA kelas X dengan visualisasi interaktif dan notasi rumus kimia baku.
        </p>
      </div>

      {/* Grid 3 Kartu Topik */}
      <div className="cards-grid">
        {TOPICS_DATA.map((topic) => {
          const isCompleted = completedTopics.includes(topic.id)

          return (
            <article
              key={topic.id}
              className={`topic-card card-${topic.accentColor} ${isCompleted ? 'is-completed' : ''}`}
            >
              <div className="card-top">
                <div className="card-badge-row">
                  <span className={`category-tag ${topic.accentColor}`}>
                    {topic.badge} • {topic.category}
                  </span>
                  <button
                    type="button"
                    className={`status-toggle-btn ${isCompleted ? 'completed' : 'pending'}`}
                    onClick={() => onToggleTopicProgress(topic.id)}
                    title={isCompleted ? 'Klik untuk tandai belum selesai' : 'Klik untuk tandai telah dipelajari'}
                    aria-label={`Tandai status modul ${topic.title}`}
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
                  <div className={`topic-icon-box ${topic.accentColor}`}>
                    {getTopicIcon(topic.id)}
                  </div>
                  <div>
                    <h3 className="card-title">{topic.title}</h3>
                    <p className="card-subtitle">{topic.subtitle}</p>
                  </div>
                </div>

                <p className="card-description">{topic.description}</p>
              </div>

              {/* Box Notasi Rumus */}
              <div className="card-formulas">
                <div className="formulas-label">Kaidah Notasi Baku:</div>
                <div className="formula-list">{renderFormulaBadges(topic.formulaBadges)}</div>
              </div>

              {/* Persamaan Reaksi Setara */}
              <div className="card-reaction">
                {renderSampleReaction(topic.sampleReaction)}
              </div>

              {/* Card Meta & Tombol Aksi */}
              <div className="card-bottom">
                <div className="card-meta">
                  <span className="meta-item">
                    <Clock size={14} />
                    <span>{topic.estimatedTime}</span>
                  </span>
                  <span className="meta-item">
                    <Sparkles size={14} />
                    <span>{topic.totalActivities} Aktivitas</span>
                  </span>
                </div>

                <button
                  type="button"
                  className={`btn-explore ${topic.accentColor}`}
                  onClick={() => {
                    setSelectedTopic(topic)
                    setActiveTab('ringkasan')
                  }}
                >
                  <span>Eksplorasi Konsep</span>
                  <ChevronRight size={17} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Modal Interaktif Edukasi Sains saat kartu diklik */}
      {selectedTopic && (
        <div className="modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className={`modal-icon-wrap ${selectedTopic.accentColor}`}>
                  {getTopicIcon(selectedTopic.id)}
                </div>
                <div>
                  <h3 id="modal-title" className="modal-title">
                    Modul {selectedTopic.title}
                  </h3>
                  <span className="modal-subtitle">{selectedTopic.subtitle}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setSelectedTopic(null)}
                aria-label="Tutup jendela penjelasan"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigasi Modal */}
            <div className="modal-tabs">
              <button
                type="button"
                className={`modal-tab ${activeTab === 'ringkasan' ? 'active' : ''}`}
                onClick={() => setActiveTab('ringkasan')}
              >
                Ringkasan Materi
              </button>
              <button
                type="button"
                className={`modal-tab ${activeTab === 'simulasi' ? 'active' : ''}`}
                onClick={() => setActiveTab('simulasi')}
              >
                Simulasi Singkat
              </button>
            </div>

            <div className="modal-body">
              {activeTab === 'ringkasan' ? (
                <div className="modal-summary">
                  <p className="summary-desc">{selectedTopic.description}</p>

                  <div className="summary-points-box">
                    <div className="points-label">Poin Kunci yang Harus Dipahami:</div>
                    <ul className="points-list">
                      {selectedTopic.keyPoints.map((point, idx) => (
                        <li key={idx} className="point-item">
                          <CheckCircle2 size={16} className="point-check" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="reaction-preview-box">
                    {renderSampleReaction(selectedTopic.sampleReaction)}
                  </div>
                </div>
              ) : (
                /* Tab Simulasi Interaktif Sesuai Modul */
                <div className="interactive-sim-box">
                  {selectedTopic.id === 'stoikiometri' && (
                    <div className="sim-stoichiometry">
                      <h4>Simulasi Cepat Konsep Mol Air (H<sub>2</sub>O)</h4>
                      <p className="sim-hint">
                        Massa molar air H<sub>2</sub>O adalah 18 g/mol (dari 2 × Ar H = 1 dan 1 × Ar O = 16).
                      </p>

                      <div className="slider-control">
                        <label>
                          Massa H<sub>2</sub>O: <strong>{molGrams} gram</strong>
                        </label>
                        <input
                          type="range"
                          min="9"
                          max="180"
                          step="9"
                          value={molGrams}
                          onChange={(e) => setMolGrams(Number(e.target.value))}
                        />
                      </div>

                      <div className="sim-results-grid">
                        <div className="result-card">
                          <small>Jumlah Mol (n = m / M<sub>r</sub>)</small>
                          <div className="result-value">{(molGrams / 18).toFixed(2)} mol</div>
                        </div>
                        <div className="result-card">
                          <small>Jumlah Molekul H<sub>2</sub>O</small>
                          <div className="result-value">
                            {((molGrams / 18) * 6.02).toFixed(2)} × 10<sup>23</sup>
                          </div>
                        </div>
                        <div className="result-card">
                          <small>Volume Gas (STP)</small>
                          <div className="result-value">
                            {((molGrams / 18) * 22.4).toFixed(1)} Liter
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTopic.id === 'termokimia' && (
                    <div className="sim-thermochemistry">
                      <h4>Perbandingan Reaksi Eksoterm & Endoterm</h4>
                      <p className="sim-hint">
                        Perhatikan aliran kalor antara sistem (wadah reaksi) dan lingkungan.
                      </p>

                      <div className="therm-toggle-buttons">
                        <button
                          type="button"
                          className={`therm-btn ${isExothermic ? 'active exo' : ''}`}
                          onClick={() => setIsExothermic(true)}
                        >
                          Reaksi Eksoterm (ΔH &lt; 0)
                        </button>
                        <button
                          type="button"
                          className={`therm-btn ${!isExothermic ? 'active endo' : ''}`}
                          onClick={() => setIsExothermic(false)}
                        >
                          Reaksi Endoterm (ΔH &gt; 0)
                        </button>
                      </div>

                      <div className={`therm-visual-display ${isExothermic ? 'exo-mode' : 'endo-mode'}`}>
                        {isExothermic ? (
                          <div className="therm-info-card">
                            <div className="therm-title">🔥 Melepas Kalor ke Lingkungan</div>
                            <p>
                              Energi produk lebih rendah daripada reaktan. Wadah terasa{' '}
                              <strong>panas</strong> karena kalor mengalir keluar.
                            </p>
                            <div className="therm-formula-box">
                              ΔH = H<sub>produk</sub> − H<sub>reaktan</sub> &lt; 0 (Bernilai Negatif)
                            </div>
                            <small>Contoh: Pembakaran gas metana CH<sub>4(g)</sub> + 2O<sub>2(g)</sub> → CO<sub>2(g)</sub> + 2H<sub>2</sub>O<sub>(g)</sub></small>
                          </div>
                        ) : (
                          <div className="therm-info-card">
                            <div className="therm-title">❄️ Menyerap Kalor dari Lingkungan</div>
                            <p>
                              Energi produk lebih tinggi daripada reaktan. Wadah terasa{' '}
                              <strong>dingin</strong> karena kalor diserap dari lingkungan ke dalam sistem.
                            </p>
                            <div className="therm-formula-box">
                              ΔH = H<sub>produk</sub> − H<sub>reaktan</sub> &gt; 0 (Bernilai Positif)
                            </div>
                            <small>Contoh: Pelarutan pupuk urea CO(NH<sub>2</sub>)<sub>2</sub> dalam air</small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTopic.id === 'asam-basa' && (
                    <div className="sim-acidbase">
                      <h4>Simulasi Derajat Keasaman (Skala pH)</h4>
                      <p className="sim-hint">
                        Geser nilai pH untuk melihat konsentrasi ion H<sup>+</sup> dan OH<sup>−</sup> serta perubahan warna indikator lakmus.
                      </p>

                      <div className="slider-control">
                        <label>
                          Nilai pH: <strong className="ph-badge">{phValue.toFixed(1)}</strong>
                          <span className="ph-status">
                            {phValue < 6.9 ? ' (Larutan Bersifat Asam)' : phValue > 7.1 ? ' (Larutan Bersifat Basa)' : ' (Larutan Netral)'}
                          </span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="14"
                          step="0.5"
                          value={phValue}
                          onChange={(e) => setPhValue(Number(e.target.value))}
                        />
                      </div>

                      <div className="ph-spectrum-bar">
                        <div
                          className="ph-indicator-needle"
                          style={{ left: `${((phValue - 1) / 13) * 100}%` }}
                        ></div>
                      </div>

                      <div className="ph-results-grid">
                        <div className="result-card">
                          <small>Konsentrasi [H<sup>+</sup>]</small>
                          <div className="result-value">
                            10<sup>−{phValue.toFixed(1)}</sup> M
                          </div>
                        </div>
                        <div className="result-card">
                          <small>Konsentrasi [OH<sup>−</sup>]</small>
                          <div className="result-value">
                            10<sup>−{(14 - phValue).toFixed(1)}</sup> M
                          </div>
                        </div>
                        <div className="result-card">
                          <small>Warna Lakmus</small>
                          <div className="result-value">
                            {phValue < 7 ? (
                              <span className="lakmus red">Merah (Asam)</span>
                            ) : phValue > 7 ? (
                              <span className="lakmus blue">Biru (Basa)</span>
                            ) : (
                              <span className="lakmus green">Tetap (Netral)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className={`btn-modal-progress ${
                  completedTopics.includes(selectedTopic.id) ? 'completed' : ''
                }`}
                onClick={() => onToggleTopicProgress(selectedTopic.id)}
              >
                {completedTopics.includes(selectedTopic.id) ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Tandai Belum Selesai</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Tandai Selesai Dipelajari</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedTopic(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
