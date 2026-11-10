import React, { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  Layers,
  Zap,
  Clock,
  FlaskConical,
  Lightbulb,
  ShieldAlert,
  Car,
  HeartPulse
} from 'lucide-react'

const REAL_LIFE_EXPERIMENTS = [
  {
    id: 'exp-suhu',
    title: 'Eksperimen 1: Pengaruh Suhu (Tablet Effervescent)',
    category: 'Faktor Suhu',
    icon: Flame,
    color: 'coral',
    reactionText: 'C₆H₈O₇(aq) + 3NaHCO₃(aq) → Na₃C₆H₅O₇(aq) + 3H₂O(l) + 3CO₂(g)↑',
    durationTargetA: 42, // detik air dingin
    durationTargetB: 12, // detik air hangat
    beakerA: { label: 'Air Dingin (15°C)', temp: '15°C', rate: 'Lambat', desc: 'Gelembung CO₂ muncul lamban dan terpisah-pisah' },
    beakerB: { label: 'Air Hangat (50°C)', temp: '50°C', rate: 'Sangat Cepat', desc: 'Semburan gelembung CO₂ berbusa deras seketika' },
    scientificReason:
      'Pada air hangat (50°C), partikel air dan reaktan memiliki energi kinetik rata-rata yang jauh lebih tinggi. Frekuensi tumbukan melonjak dan fraksi molekul yang memiliki energi ≥ Ea meningkat pesat, sehingga tablet habis larut 3,5 kali lebih cepat dibanding air dingin.'
  },
  {
    id: 'exp-luas',
    title: 'Eksperimen 2: Luas Permukaan (Bongkahan vs Serbuk CaCO₃)',
    category: 'Faktor Luas Permukaan',
    icon: Layers,
    color: 'emerald',
    reactionText: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
    durationTargetA: 60, // bongkahan
    durationTargetB: 15, // serbuk
    beakerA: { label: 'Bongkahan Pualam (Kepingan)', temp: '25°C', rate: 'Lambat', desc: 'Reaksi hanya terjadi di tepi luar bongkahan marmer' },
    beakerB: { label: 'Serbuk Halus Marmer', temp: '25°C', rate: 'Sangat Cepat', desc: 'Jutaan partikel serbuk langsung bereaksi bersamaan' },
    scientificReason:
      'Meskipun massanya sama-sama 5 gram, serbuk marmer memiliki luas bidang sentuh total berlipat ganda dibanding bongkahan. Asam klorida dapat menyerang seluruh butiran serbuk secara serentak, menghasilkan desisan gas CO₂ yang sangat kuat.'
  },
  {
    id: 'exp-katalis',
    title: 'Eksperimen 3: Peran Katalis (Penguraian Hidrogen Peroksida)',
    category: 'Faktor Katalis',
    icon: Zap,
    color: 'amber',
    reactionText: '2H₂O₂(aq) —[MnO₂]→ 2H₂O(l) + O₂(g)↑',
    durationTargetA: 90, // tanpa katalis
    durationTargetB: 8,  // dengan MnO2
    beakerA: { label: 'H₂O₂ 3% Tanpa Katalis', temp: '25°C', rate: 'Sangat Lambat', desc: 'Hampir tidak tampak gelembung gas oksigen' },
    beakerB: { label: 'H₂O₂ 3% + Serbuk MnO₂', temp: '25°C', rate: 'Spontan & Eksplosif', desc: 'Pancuran busa putih tebal gas O₂ meluap tinggi' },
    scientificReason:
      'Hidrogen peroksida terurai secara alami sangat lambat karena Energi Aktivasi (Ea) dekomposisinya tinggi (~75 kJ/mol). Penambahan sedikit katalis serbuk hitam MnO₂ memangkas nilai Ea menjadi hanya ~58 kJ/mol, membuat reaksi bergolak seketika tanpa katalis ikut habis.'
  }
]

const CONTEXTUAL_STUDIES = [
  {
    id: 'case-kulkas',
    title: 'Mengapa Makanan Wajib Disimpan di Lemari Es (Kulkas)?',
    category: 'Pengawetan Pangan',
    icon: Flame,
    color: 'coral',
    summary:
      'Suhu rendah kulkas (~4°C) atau freezer (−18°C) menurunkan drastis energi kinetik bakteri dan enzim pembusuk.',
    detail:
      'Pembusukan makanan adalah rangkaian reaksi kimia biokimia yang dikatalisis oleh enzim bakteri. Berdasarkan kaidah kinetika kimia, penurunan suhu sebesar 10°C memperlambat laju reaksi kimia hingga separuh atau sepertiganya. Di dalam kulkas, mikroorganisme pembusuk kehilangan energi kinetik untuk melampaui Ea metabolisme, sehingga bahan pangan tetap segar berminggu-minggu.'
  },
  {
    id: 'case-catalytic',
    title: 'Fungsi Catalytic Converter pada Sistem Knalpot Mobil Modern',
    category: 'Teknologi & Lingkungan',
    icon: Car,
    color: 'indigo',
    summary:
      'Mengubah gas beracun CO dan NOx menjadi CO₂ dan N₂ dalam hitungan milidetik sebelum dilepas ke udara.',
    detail:
      'Gas buang mesin mobil mengandung racun berbahaya: karbon monoksida (CO) dan nitrogen oksida (NO). Reaksi penguraian kedua gas ini di udara bebas berlangsung sangat lambat karena energi aktivasinya tinggi. Catalytic converter berisi kisi keramik berlapis logam mulia Platina (Pt), Paladium (Pd), dan Rodium (Rh) yang bertindak sebagai katalis heterogen untuk menurunkan Ea reaksi secara drastis: 2CO + 2NO → 2CO₂ + N₂.'
  },
  {
    id: 'case-antasida',
    title: 'Mengapa Tablet Obat Maag (Antasida) Harus Dikunyah Dulu?',
    category: 'Kesehatan & Farmasi',
    icon: HeartPulse,
    color: 'emerald',
    summary:
      'Mengunyah tablet memecah padatan menjadi serbuk halus, memperluas bidang sentuh penetralan asam lambung.',
    detail:
      'Saat asam lambung berlebih (HCl tinggi), dinding lambung terasa perih. Tablet antasida mengandung basa padat seperti Al(OH)₃ dan Mg(OH)₂. Jika ditelan utuh berupa tablet padat, penetralan asam lambung membutuhkan waktu lama karena bidang sentuh kecil. Mengunyahnya hingga lumat menghasilkan partikel renik dengan luas permukaan besar, sehingga rasa nyeri lambung hilang dalam beberapa detik.'
  },
  {
    id: 'case-dust-explosion',
    title: 'Bahaya Fenomena Ledakan Debu (Dust Explosion) di Industri',
    category: 'Keamanan Industri',
    icon: ShieldAlert,
    color: 'amber',
    summary:
      'Partikel serbuk tepung atau gula yang melayang di udara memiliki luas permukaan masif yang mudah meledak.',
    detail:
      'Bongkahan gula atau tumpukan tepung terigu di atas meja tidak dapat meledak. Namun, jika tepung terigu atau serbuk batubara berhamburan di udara sebagai debu halus, luas kontak setiap butir serbuk dengan oksigen udara menjadi luar biasa raksasa. Satu percikan api kecil saja sudah cukup untuk memicu reaksi pembakaran simultan berantai berkecepatan supersonik (ledakan debu).'
  }
]

export default function RealLifeVideoLab() {
  const [selectedExpId, setSelectedExpId] = useState('exp-suhu')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const exp = REAL_LIFE_EXPERIMENTS.find((e) => e.id === selectedExpId) || REAL_LIFE_EXPERIMENTS[0]

  useEffect(() => {
    let timer = null
    if (isRunning) {
      timer = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= 60) {
            setIsRunning(false)
            return 60
          }
          return prev + 1
        })
      }, 350)
    }
    return () => clearInterval(timer)
  }, [isRunning])

  const handleSelectExp = (id) => {
    setSelectedExpId(id)
    setIsRunning(false)
    setElapsed(0)
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsed(0)
  }

  // Hitung persentase reaksi untuk Beaker A dan Beaker B
  const progressA = Math.min(100, Math.round((elapsed / exp.durationTargetA) * 100))
  const progressB = Math.min(100, Math.round((elapsed / exp.durationTargetB) * 100))

  return (
    <div className="real-life-lab-container">
      {/* 1. SEKSI VIDEO & OBSERVASI LAB NYATA */}
      <div className="lab-section-card">
        <div className="lab-card-header">
          <div className="lab-header-title">
            <FlaskConical size={20} className="text-coral" />
            <div>
              <h3 className="lab-main-title">Laboratorium Nyata: Komparasi Makroskopis Laju Reaksi</h3>
              <p className="lab-sub-title">
                Amati rekaman eksperimen perbandingan nyata secara berdampingan (*side-by-side*) dengan pengatur waktu interaktif.
              </p>
            </div>
          </div>

          <div className="exp-selector-tabs">
            {REAL_LIFE_EXPERIMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`exp-tab-btn ${selectedExpId === item.id ? 'active' : ''}`}
                onClick={() => handleSelectExp(item.id)}
              >
                {item.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Info Persamaan Reaksi Setara */}
        <div className="lab-reaction-banner">
          <span className="reaction-tag">Reaksi Eksperimen:</span>
          <code className="reaction-code">{exp.reactionText}</code>
        </div>

        {/* Viewport Komparasi 2 Gelas Kimia (Beaker) */}
        <div className="beaker-comparison-viewport">
          {/* Wadah A */}
          <div className="beaker-cell beaker-a">
            <div className="beaker-header-tag">
              <span className="beaker-badge a">Kondisi Kontrol (A)</span>
              <strong className="beaker-name">{exp.beakerA.label}</strong>
            </div>

            <div className="beaker-visual-stage">
              <div className="beaker-glass">
                <div className="beaker-liquid">
                  {/* Partikel atau Gelembung Berdasarkan Progress */}
                  <div className={`reaction-foam slow ${isRunning ? 'active' : ''}`} style={{ height: `${progressA * 0.7}%` }}>
                    {isRunning && progressA < 100 && (
                      <div className="bubbles-container">
                        <span className="b-dot b1"></span>
                        <span className="b-dot b2"></span>
                        <span className="b-dot b3"></span>
                      </div>
                    )}
                  </div>
                  <div className="beaker-solid-bottom">
                    <span className="solid-indicator">{progressA >= 100 ? 'Reaktan Habis' : 'Reaktan Bereaksi'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="beaker-stats-box">
              <div className="stat-line">
                <span>Laju Reaksi:</span>
                <span className="stat-value text-muted">{exp.beakerA.rate}</span>
              </div>
              <div className="stat-line">
                <span>Waktu Tuntas:</span>
                <span className="stat-value">{exp.durationTargetA} detik</span>
              </div>
              <div className="stat-line">
                <span>Progres Selesai:</span>
                <span className="stat-value font-bold">{progressA}%</span>
              </div>
              <p className="beaker-obs-note">{exp.beakerA.desc}</p>
            </div>
          </div>

          {/* Kolom Tengah: Kontrol Timer & Play/Pause */}
          <div className="beaker-controls-col">
            <div className="timer-display-circle">
              <Clock size={20} className="text-coral" />
              <span className="timer-seconds-num">{elapsed}s</span>
              <small className="timer-label">Waktu Reaksi</small>
            </div>

            <div className="timer-action-buttons">
              <button
                type="button"
                className={`btn-timer-play ${isRunning ? 'running' : ''}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <Pause size={16} />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Mulai Amati</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-timer-reset"
                onClick={handleReset}
                title="Atur ulang timer pengamatan"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            </div>

            <div className="timer-comparison-hint">
              <Sparkles size={14} className="text-coral" />
              <span>
                {progressB >= 100 && progressA < 100
                  ? 'Kondisi B sudah tuntas lebih dulu!'
                  : 'Klik "Mulai Amati" untuk melihat perbedaan kecepatan kedua wadah'}
              </span>
            </div>
          </div>

          {/* Wadah B */}
          <div className="beaker-cell beaker-b">
            <div className="beaker-header-tag">
              <span className="beaker-badge b">Kondisi Uji Dioptimalkan (B)</span>
              <strong className="beaker-name">{exp.beakerB.label}</strong>
            </div>

            <div className="beaker-visual-stage">
              <div className="beaker-glass optimal">
                <div className="beaker-liquid optimal">
                  {/* Busa Gelembung Deras */}
                  <div className={`reaction-foam fast ${isRunning ? 'active' : ''}`} style={{ height: `${progressB * 0.9}%` }}>
                    {isRunning && progressB < 100 && (
                      <div className="bubbles-container dense">
                        <span className="b-dot bf1"></span>
                        <span className="b-dot bf2"></span>
                        <span className="b-dot bf3"></span>
                        <span className="b-dot bf4"></span>
                        <span className="b-dot bf5"></span>
                      </div>
                    )}
                  </div>
                  <div className="beaker-solid-bottom">
                    <span className="solid-indicator fast">{progressB >= 100 ? 'Reaktan Tuntas Sempurna!' : 'Bergolak Cepat!'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="beaker-stats-box">
              <div className="stat-line">
                <span>Laju Reaksi:</span>
                <span className="stat-value text-emerald font-bold">{exp.beakerB.rate}</span>
              </div>
              <div className="stat-line">
                <span>Waktu Tuntas:</span>
                <span className="stat-value font-bold text-coral">{exp.durationTargetB} detik</span>
              </div>
              <div className="stat-line">
                <span>Progres Selesai:</span>
                <span className="stat-value font-bold text-emerald">{progressB}%</span>
              </div>
              <p className="beaker-obs-note">{exp.beakerB.desc}</p>
            </div>
          </div>
        </div>

        {/* Penjelasan Ilmiah Eksperimen */}
        <div className="lab-explanation-card">
          <div className="exp-icon-col">
            <Lightbulb size={22} className="text-amber" />
          </div>
          <div className="exp-text-col">
            <h4 className="exp-why-title">Analisis Ilmiah Pengamatan:</h4>
            <p className="exp-why-text">{exp.scientificReason}</p>
          </div>
        </div>
      </div>

      {/* 2. SEKSI STUDI KASUS KEHIDUPAN SEHARI-HARI (Contextual Learning) */}
      <div className="contextual-cases-card">
        <div className="cases-header">
          <div className="cases-header-title">
            <Sparkles size={20} className="text-coral" />
            <div>
              <h3 className="cases-main-title">Studi Kasus Kontekstual dalam Kehidupan Sehari-hari</h3>
              <p className="cases-sub-title">
                Penerapan prinsip laju reaksi dalam pengawetan pangan, teknologi otomotif, farmasi, dan keselamatan kerja.
              </p>
            </div>
          </div>
        </div>

        <div className="cases-grid">
          {CONTEXTUAL_STUDIES.map((study) => {
            const IconComp = study.icon
            return (
              <div key={study.id} className={`context-case-item ${study.color}`}>
                <div className="case-item-header">
                  <div className={`case-icon-box ${study.color}`}>
                    <IconComp size={20} />
                  </div>
                  <div>
                    <span className="case-category-pill">{study.category}</span>
                    <h4 className="case-item-title">{study.title}</h4>
                  </div>
                </div>

                <div className="case-summary-highlight">
                  <strong>Intisari:</strong> {study.summary}
                </div>

                <p className="case-item-detail">{study.detail}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
