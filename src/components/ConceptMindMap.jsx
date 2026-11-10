import React, { useState } from 'react'
import {
  GitMerge,
  ArrowRight,
  Flame,
  Layers,
  Atom,
  Zap,
  Sparkles,
  CheckCircle2,
  Gauge
} from 'lucide-react'

export default function ConceptMindMap({ onOpenGlossary }) {
  const [activeFactor, setActiveFactor] = useState('suhu')

  const factorsData = {
    suhu: {
      title: 'Peningkatan Suhu (T)',
      color: 'coral',
      icon: Flame,
      macroDesc: 'Reaksi berlangsung jauh lebih cepat saat dipanaskan (ΔT = +10°C melipatgandakan laju 2-3x).',
      microEffect: 'Energi Kinetik (Ek) partikel melonjak drastis',
      collisionLink: 'Fraksi partikel dengan Ek ≥ Ea meningkat tajam (Kurva Maxwell-Boltzmann bergeser ke kanan)',
      outcome: 'Frekuensi tumbukan efektif naik eksponensial → laju reaksi (v) melonjak tinggi'
    },
    konsentrasi: {
      title: 'Kenaikan Konsentrasi [Reaktan]',
      color: 'indigo',
      icon: Gauge,
      macroDesc: 'Larutan pekat (konsentrasi tinggi) bereaksi jauh lebih lekas dibanding larutan encer.',
      microEffect: 'Kerapatan jumlah partikel per satuan volume menjadi sangat padat',
      collisionLink: 'Jarak antarmolekul merapat → Peluang tabrakan (Frekuensi Tumbukan Z) meningkat',
      outcome: 'Jumlah tumbukan efektif per detik berlipat ganda → laju reaksi bertambah cepat'
    },
    luas: {
      title: 'Luas Bidang Sentuh (Bongkahan vs Serbuk)',
      color: 'emerald',
      icon: Layers,
      macroDesc: 'Serbuk padatan bereaksi dalam hitungan detik, sedangkan bongkahan besar butuh menit.',
      microEffect: 'Menghaluskan padatan membuka jutaan permukaan partikel baru di bagian dalam',
      collisionLink: 'Lebih banyak partikel reaktan bersentuhan langsung secara simultan setiap detik',
      outcome: 'Frekuensi tumbukan di antarmuka padat-cair melonjak → reaksi cepat tuntas'
    },
    katalis: {
      title: 'Penambahan Katalis',
      color: 'amber',
      icon: Zap,
      macroDesc: 'Reaksi yang lambat atau mandek langsung bergolak cepat saat katalis dimasukkan.',
      microEffect: 'Menyediakan rute/mekanisme reaksi baru dengan keadaan transisi berenergi rendah',
      collisionLink: 'Menurunkan nilai Energi Aktivasi (Ea_katalis < Ea_tanpa_katalis) tanpa mengubah ΔH',
      outcome: 'Jauh lebih banyak partikel yang mampu melampaui bukit Ea pada suhu kamar'
    }
  }

  const current = factorsData[activeFactor]

  return (
    <div className="concept-mindmap-box">
      {/* Header Peta Konsep */}
      <div className="mindmap-header">
        <div className="mindmap-title-row">
          <GitMerge size={20} className="text-coral" />
          <h3 className="mindmap-main-title">Peta Konsep Visual: Hubungan Faktor Laju & Teori Tumbukan</h3>
        </div>
        <p className="mindmap-sub-title">
          Klik salah satu faktor di bawah untuk melihat jembatan logika dari tindakan makroskopis hingga mekanisme tumbukan partikel.
        </p>
      </div>

      {/* Selector 4 Faktor */}
      <div className="mindmap-factors-selector">
        {Object.entries(factorsData).map(([key, item]) => {
          const IconComp = item.icon
          const isActive = activeFactor === key
          return (
            <button
              key={key}
              type="button"
              className={`factor-select-chip ${item.color} ${isActive ? 'active' : ''}`}
              onClick={() => setActiveFactor(key)}
            >
              <IconComp size={16} />
              <span>{item.title}</span>
            </button>
          )
        })}
      </div>

      {/* Diagram Alur Jembatan Logika (3 Node Interaktif) */}
      <div className="mindmap-flow-grid">
        {/* Node 1: Tindakan Makroskopis */}
        <div className={`mindmap-node-card macro ${current.color}`}>
          <div className="node-step-tag">1. TINGKAT MAKROSKOPIS</div>
          <div className="node-card-body">
            <h4 className="node-title">{current.title}</h4>
            <p className="node-desc">{current.macroDesc}</p>
          </div>
        </div>

        {/* Panah Penghubung */}
        <div className="mindmap-flow-arrow">
          <ArrowRight size={22} className="text-coral" />
          <span className="arrow-label">Memengaruhi Partikel</span>
        </div>

        {/* Node 2: Fenomena Sub-Mikroskopis (Teori Tumbukan) */}
        <div className="mindmap-node-card micro">
          <div className="node-step-tag">2. TINGKAT SUB-MIKROSKOPIS</div>
          <div className="node-card-body">
            <h4 className="node-title micro-title">
              <Atom size={16} className="text-amber" />
              <span>{current.microEffect}</span>
            </h4>
            <div className="collision-detail-box">
              <span className="collision-tag">Mekanisme Tumbukan:</span>
              <p className="collision-text">{current.collisionLink}</p>
            </div>
          </div>
        </div>

        {/* Panah Penghubung */}
        <div className="mindmap-flow-arrow">
          <ArrowRight size={22} className="text-coral" />
          <span className="arrow-label">Hasil Akhir</span>
        </div>

        {/* Node 3: Dampak Laju Reaksi */}
        <div className="mindmap-node-card result">
          <div className="node-step-tag">3. HASIL LAJU REAKSI</div>
          <div className="node-card-body">
            <h4 className="node-title result-title">
              <Sparkles size={16} className="text-emerald" />
              <span>Laju Reaksi Cepat</span>
            </h4>
            <p className="node-desc">{current.outcome}</p>
          </div>
        </div>
      </div>

      {/* Ringkasan Syarat Tumbukan Efektif */}
      <div className="mindmap-summary-footer">
        <div className="summary-rule-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div className="summary-text">
            <strong>Hukum Kunci Tumbukan:</strong> Laju reaksi berbanding lurus dengan{' '}
            <em>frekuensi tumbukan (Z)</em>, <em>fraksi energi kinetik ≥ Ea (f)</em>, dan{' '}
            <em>faktor ketepatan orientasi geometri (p)</em>.
          </div>
        </div>

        {onOpenGlossary && (
          <button
            type="button"
            className="btn-open-glossary-from-map"
            onClick={onOpenGlossary}
          >
            <span>Buka Glosarium Lengkap</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
