import React, { useState, useEffect, useRef } from 'react'
import {
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  Layers,
  Zap,
  Gauge,
  Activity,
  ArrowRight
} from 'lucide-react'

export default function PoeSimulation({ module, onCompletePoe, isCompleted = false }) {
  // Current POE stage: 'predict' | 'observe' | 'explain'
  const [stage, setStage] = useState('predict')
  const [selectedPrediction, setSelectedPrediction] = useState(null)
  const [hasSubmittedPrediction, setHasSubmittedPrediction] = useState(false)

  // ==========================================
  // STATE MODUL 1: FAKTOR LAJU REAKSI
  // ==========================================
  const [temperature, setTemperature] = useState(25) // °C (20 - 80)
  const [concentration, setConcentration] = useState(1.0) // M (0.5, 1.0, 2.0)
  const [surfaceArea, setSurfaceArea] = useState('sedang') // 'bongkahan' | 'butiran' | 'serbuk'
  const [useCatalyst, setUseCatalyst] = useState(false)
  const [simRunningM1, setSimRunningM1] = useState(false)
  const [reactionProgressM1, setReactionProgressM1] = useState(0) // 0 - 100%
  const [collisionStatsM1, setCollisionStatsM1] = useState({ total: 0, effective: 0 })
  const canvasRefM1 = useRef(null)

  // ==========================================
  // STATE MODUL 2: TEORI TUMBUKAN & Ea
  // ==========================================
  const [kineticEnergy, setKineticEnergy] = useState(40) // kJ/mol (10 - 100)
  const [orientationMode, setOrientationMode] = useState('tepat') // 'tepat' | 'miring'
  const [catalystM2, setCatalystM2] = useState(false) // Ea: 60 without, 30 with catalyst
  const [collisionStatusM2, setCollisionStatusM2] = useState('ready') // 'ready' | 'colliding' | 'success' | 'failed'
  const [collisionAnimStep, setCollisionAnimStep] = useState(0) // 0 to 100

  // ==========================================
  // STATE MODUL 3: TAMPILAN MAKROSKOPIS
  // ==========================================
  const [solidTypeM3, setSolidTypeM3] = useState('serbuk') // 'bongkahan' | 'serbuk'
  const [tempM3, setTempM3] = useState(25) // 25°C or 50°C
  const [simRunningM3, setSimRunningM3] = useState(false)
  const [elapsedSecondsM3, setElapsedSecondsM3] = useState(0)
  const [gasVolumeM3, setGasVolumeM3] = useState(0) // 0 to 100 mL
  const [graphPointsM3, setGraphPointsM3] = useState([{ t: 0, v: 0 }])

  const poeData = module.poeScenario

  // ----------------------------------------------------
  // SIMULASI MODUL 1: PARTIKEL 2D CANVAS
  // ----------------------------------------------------
  useEffect(() => {
    if (module.id !== 'faktor-laju' || stage !== 'observe') return

    const canvas = canvasRefM1.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let isMounted = true

    // Generate particles based on concentration and surface area
    const particleCount = Math.round(concentration * 20)
    const speedMultiplier = (temperature / 25) * (useCatalyst ? 1.4 : 1.0)
    const effectiveThreshold = useCatalyst ? 0.35 : 0.65 // Lower barrier with catalyst

    // Create particles
    const particles = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: Math.random() * (canvas.height - 20) + 10,
        vx: (Math.random() - 0.5) * 2.5 * speedMultiplier,
        vy: (Math.random() - 0.5) * 2.5 * speedMultiplier,
        radius: surfaceArea === 'serbuk' ? 4 : surfaceArea === 'butiran' ? 7 : 11,
        color: i % 2 === 0 ? '#FD8A8A' : '#9EA1D4',
        energy: Math.random() * (temperature / 20)
      })
    }

    const collisionSparks = []

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw container boundary
      ctx.strokeStyle = 'rgba(45, 55, 72, 0.15)'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      particles.forEach((p, idx) => {
        p.x += p.vx
        p.y += p.vy

        // Wall collisions
        if (p.x - p.radius < 0 || p.x + p.radius > canvas.width) {
          p.vx *= -1
          p.x = Math.max(p.radius, Math.min(canvas.width - p.radius, p.x))
        }
        if (p.y - p.radius < 0 || p.y + p.radius > canvas.height) {
          p.vy *= -1
          p.y = Math.max(p.radius, Math.min(canvas.height - p.radius, p.y))
        }

        // Particle-particle collisions
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p2.x - p.x
          const dy = p2.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < p.radius + p2.radius) {
            // Elastic collision bounce
            p.vx *= -1
            p.vy *= -1
            p2.vx *= -1
            p2.vy *= -1

            const combinedEnergy = (p.energy + p2.energy) / 2
            const isEffective = combinedEnergy > effectiveThreshold

            if (isMounted) {
              setCollisionStatsM1((prev) => ({
                total: prev.total + 1,
                effective: isEffective ? prev.effective + 1 : prev.effective
              }))
            }

            collisionSparks.push({
              x: (p.x + p2.x) / 2,
              y: (p.y + p2.y) / 2,
              radius: isEffective ? 12 : 5,
              color: isEffective ? '#10b981' : 'rgba(255,255,255,0.4)',
              life: 15
            })
          }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Draw collision sparks
      for (let s = collisionSparks.length - 1; s >= 0; s--) {
        const spark = collisionSparks[s]
        ctx.beginPath()
        ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2)
        ctx.fillStyle = spark.color
        ctx.fill()
        spark.radius *= 0.88
        spark.life--
        if (spark.life <= 0) {
          collisionSparks.splice(s, 1)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      isMounted = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [module.id, stage, temperature, concentration, surfaceArea, useCatalyst])

  // Progress reaction timer in Modul 1 when running
  useEffect(() => {
    if (!simRunningM1) return
    const rateFactor = (temperature / 25) * concentration * (surfaceArea === 'serbuk' ? 2 : surfaceArea === 'butiran' ? 1.3 : 0.7) * (useCatalyst ? 2 : 1)
    const interval = setInterval(() => {
      setReactionProgressM1((prev) => {
        if (prev >= 100) {
          setSimRunningM1(false)
          return 100
        }
        return Math.min(100, prev + rateFactor * 1.5)
      })
    }, 150)
    return () => clearInterval(interval)
  }, [simRunningM1, temperature, concentration, surfaceArea, useCatalyst])

  // ----------------------------------------------------
  // SIMULASI MODUL 2: TUMBUKAN DUA PARTIKEL & PROFIL Ea
  // ----------------------------------------------------
  const handleLaunchCollisionM2 = () => {
    setCollisionStatusM2('colliding')
    setCollisionAnimStep(0)
    let currentStep = 0

    const thresholdEa = catalystM2 ? 30 : 60
    const isSuccess = kineticEnergy >= thresholdEa && orientationMode === 'tepat'

    const timer = setInterval(() => {
      currentStep += 5
      setCollisionAnimStep(currentStep)

      if (currentStep >= 50 && currentStep < 55) {
        // Moment of collision
      }

      if (currentStep >= 100) {
        clearInterval(timer)
        setCollisionStatusM2(isSuccess ? 'success' : 'failed')
      }
    }, 40)
  }

  // ----------------------------------------------------
  // SIMULASI MODUL 3: MAKROSKOPIS PEMBENTUKAN GAS CO2
  // ----------------------------------------------------
  useEffect(() => {
    if (!simRunningM3) return

    const rateSpeed = (solidTypeM3 === 'serbuk' ? 3.5 : 1.2) * (tempM3 === 50 ? 2.2 : 1.0)

    const timer = setInterval(() => {
      setElapsedSecondsM3((prevSec) => {
        const nextSec = prevSec + 1
        setGasVolumeM3(() => {
          // Asymptotic curve toward 100 mL max
          const k = 0.05 * rateSpeed
          const nextVol = Math.min(100, Math.round(100 * (1 - Math.exp(-k * nextSec))))
          setGraphPointsM3((prevPts) => [...prevPts, { t: nextSec, v: nextVol }])

          if (nextVol >= 98 || nextSec >= 40) {
            setSimRunningM3(false)
          }
          return nextVol
        })
        return nextSec
      })
    }, 500)

    return () => clearInterval(timer)
  }, [simRunningM3, solidTypeM3, tempM3])

  const handleResetSimM3 = () => {
    setSimRunningM3(false)
    setElapsedSecondsM3(0)
    setGasVolumeM3(0)
    setGraphPointsM3([{ t: 0, v: 0 }])
  }

  // Handlers for POE Stages
  const handleConfirmPrediction = () => {
    if (!selectedPrediction) return
    setHasSubmittedPrediction(true)
    setStage('observe')
  }

  const handleProceedToExplain = () => {
    setStage('explain')
    if (onCompletePoe) {
      onCompletePoe(module.id)
    }
  }

  return (
    <div className="poe-container">
      {/* POE Stepper Navigation */}
      <div className="poe-stepper-header">
        <div
          className={`poe-step-chip ${stage === 'predict' ? 'active' : hasSubmittedPrediction ? 'completed' : ''}`}
          onClick={() => setStage('predict')}
        >
          <div className="step-num">1</div>
          <div className="step-label">
            <span className="step-title">Tahap Predict</span>
            <small>Dugaan Awal</small>
          </div>
        </div>

        <div className="poe-step-divider"></div>

        <div
          className={`poe-step-chip ${stage === 'observe' ? 'active' : stage === 'explain' ? 'completed' : ''} ${!hasSubmittedPrediction ? 'disabled' : ''}`}
          onClick={() => hasSubmittedPrediction && setStage('observe')}
        >
          <div className="step-num">2</div>
          <div className="step-label">
            <span className="step-title">Tahap Observe</span>
            <small>Simulasi Interaktif</small>
          </div>
        </div>

        <div className="poe-step-divider"></div>

        <div
          className={`poe-step-chip ${stage === 'explain' ? 'active' : isCompleted ? 'completed' : ''} ${stage !== 'explain' && !isCompleted ? 'disabled' : ''}`}
          onClick={() => (stage === 'explain' || isCompleted) && setStage('explain')}
        >
          <div className="step-num">3</div>
          <div className="step-label">
            <span className="step-title">Tahap Explain</span>
            <small>Konfirmasi Ilmiah</small>
          </div>
        </div>
      </div>

      {/* ========================================================
          TAHAP 1: PREDICT (MEMBUAT PREDIKSI)
          ======================================================== */}
      {stage === 'predict' && (
        <div className="poe-section-content predict-phase">
          <div className="poe-intro-card">
            <div className="poe-badge">
              <HelpCircle size={16} />
              <span>Sintaks Pembelajaran POE (Tahap 1: Predict)</span>
            </div>
            <h3 className="poe-question-title">{poeData.question}</h3>
            <p className="poe-question-instruction">
              Sebelum mengamati visualisasi, pilihlah hipotesis atau dugaan ilmiah yang menurut Anda paling tepat.
            </p>
          </div>

          <div className="predictions-list">
            {poeData.predictions.map((p) => {
              const isSelected = selectedPrediction?.id === p.id
              return (
                <div
                  key={p.id}
                  className={`prediction-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedPrediction(p)}
                >
                  <div className="prediction-radio">
                    <span className="radio-dot"></span>
                  </div>
                  <div className="prediction-text">{p.text}</div>
                </div>
              )
            })}
          </div>

          <div className="poe-action-row">
            <button
              type="button"
              className="btn-poe-submit"
              disabled={!selectedPrediction}
              onClick={handleConfirmPrediction}
            >
              <span>Simpan Prediksi & Masuk ke Observasi</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAHAP 2: OBSERVE (MELAKUKAN PENGAMATAN INTERAKTIF)
          ======================================================== */}
      {stage === 'observe' && (
        <div className="poe-section-content observe-phase">
          <div className="observe-guide-banner">
            <div className="guide-icon-box">
              <Eye size={20} />
            </div>
            <div>
              <strong>Tahap Observe: Lakukan Eksperimen & Amati Buktinya!</strong>
              <p>
                Prediksi Anda: <em>"{selectedPrediction?.text}"</em>. Sekarang ubah variabel di bawah dan perhatikan apa yang terjadi!
              </p>
            </div>
          </div>

          {/* SIMULASI INTERAKTIF MODUL 1: FAKTOR LAJU */}
          {module.id === 'faktor-laju' && (
            <div className="sim-interactive-wrapper">
              <div className="sim-controls-panel">
                <h4>Pengendali Faktor Reaksi:</h4>

                {/* 1. Suhu Slider */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Flame size={15} className="text-amber" />
                      Suhu Reaksi:
                    </span>
                    <strong className="control-val">{temperature}°C</strong>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                  <div className="range-hints">
                    <span>20°C (Lambat)</span>
                    <span>50°C</span>
                    <span>80°C (Sangat Cepat)</span>
                  </div>
                </div>

                {/* 2. Konsentrasi */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Gauge size={15} className="text-cyan" />
                      Konsentrasi Reaktan:
                    </span>
                    <strong className="control-val">{concentration.toFixed(1)} M</strong>
                  </div>
                  <div className="toggle-chip-group">
                    {[0.5, 1.0, 2.0].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`chip-btn ${concentration === c ? 'active' : ''}`}
                        onClick={() => setConcentration(c)}
                      >
                        {c.toFixed(1)} M {c === 0.5 ? '(Encer)' : c === 2.0 ? '(Pekat)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Luas Permukaan */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Layers size={15} className="text-emerald" />
                      Luas Bidang Sentuh:
                    </span>
                    <strong className="control-val capitalize">{surfaceArea}</strong>
                  </div>
                  <div className="toggle-chip-group">
                    {[
                      { id: 'bongkahan', label: 'Bongkahan' },
                      { id: 'butiran', label: 'Butiran' },
                      { id: 'serbuk', label: 'Serbuk Halus' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`chip-btn ${surfaceArea === s.id ? 'active' : ''}`}
                        onClick={() => setSurfaceArea(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Katalis */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Zap size={15} className="text-purple" />
                      Katalisator:
                    </span>
                    <strong className="control-val">{useCatalyst ? 'Aktif (Ea Turun)' : 'Tanpa Katalis'}</strong>
                  </div>
                  <button
                    type="button"
                    className={`btn-catalyst-toggle ${useCatalyst ? 'active' : ''}`}
                    onClick={() => setUseCatalyst(!useCatalyst)}
                  >
                    <Sparkles size={16} />
                    <span>{useCatalyst ? 'Katalis Digunakan' : 'Tambahkan Katalis'}</span>
                  </button>
                </div>

                {/* Action Reaksi */}
                <div className="sim-reaction-cta">
                  <button
                    type="button"
                    className="btn-start-sim"
                    onClick={() => {
                      setReactionProgressM1(0)
                      setSimRunningM1(true)
                    }}
                  >
                    <Play size={16} />
                    <span>Uji Laju Pembentukan Produk</span>
                  </button>
                </div>
              </div>

              {/* Viewport Canvas Partikel */}
              <div className="sim-viewport-panel">
                <div className="canvas-header-bar">
                  <span className="canvas-title">Visualisasi Tumbukan Mikroskopis (2D Partikulat)</span>
                  <div className="canvas-legend">
                    <span className="legend-item"><span className="legend-dot blue"></span> Reaktan A</span>
                    <span className="legend-item"><span className="legend-dot orange"></span> Reaktan B</span>
                    <span className="legend-item"><span className="legend-dot green"></span> Tumbukan Efektif</span>
                  </div>
                </div>

                <div className="canvas-container">
                  <canvas ref={canvasRefM1} width={420} height={260} className="particle-canvas"></canvas>
                </div>

                {/* Telemetri Laju & Tumbukan */}
                <div className="telemetry-bar">
                  <div className="telemetry-item">
                    <span className="tele-label">Total Tumbukan:</span>
                    <strong className="tele-val">{collisionStatsM1.total}</strong>
                  </div>
                  <div className="telemetry-item">
                    <span className="tele-label">Tumbukan Efektif:</span>
                    <strong className="tele-val text-emerald">{collisionStatsM1.effective}</strong>
                  </div>
                  <div className="telemetry-item">
                    <span className="tele-label">Kecepatan Partikel:</span>
                    <strong className="tele-val text-amber">{((temperature / 25) * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                {/* Progress Pembentukan Produk */}
                <div className="product-progress-box">
                  <div className="progress-label-row">
                    <span>Laju Pembentukan Produk ({reactionProgressM1.toFixed(0)}%):</span>
                    <span className="progress-status-badge">
                      {reactionProgressM1 >= 100 ? 'Reaksi Selesai!' : simRunningM1 ? 'Reaksi Berjalan...' : 'Tekan Uji Laju'}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${reactionProgressM1}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULASI INTERAKTIF MODUL 2: TEORI TUMBUKAN & ENERGI AKTIVASI */}
          {module.id === 'teori-tumbukan' && (
            <div className="sim-interactive-wrapper modul2-sim">
              <div className="sim-controls-panel">
                <h4>Parameter Tumbukan Partikel:</h4>

                {/* Slider Energi Kinetik */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Zap size={15} className="text-amber" />
                      Energi Kinetik Partikel:
                    </span>
                    <strong className="control-val">{kineticEnergy} kJ/mol</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={kineticEnergy}
                    onChange={(e) => {
                      setKineticEnergy(Number(e.target.value))
                      setCollisionStatusM2('ready')
                    }}
                  />
                  <div className="range-hints">
                    <span>10 kJ/mol (Rendah)</span>
                    <span>Ambang Ea: {catalystM2 ? '30 kJ/mol' : '60 kJ/mol'}</span>
                    <span>100 kJ/mol</span>
                  </div>
                </div>

                {/* Pilihan Orientasi Ruang */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Activity size={15} className="text-cyan" />
                      Orientasi Geometri Tumbukan:
                    </span>
                    <strong className="control-val capitalize">{orientationMode}</strong>
                  </div>
                  <div className="toggle-chip-group">
                    <button
                      type="button"
                      className={`chip-btn ${orientationMode === 'tepat' ? 'active' : ''}`}
                      onClick={() => {
                        setOrientationMode('tepat')
                        setCollisionStatusM2('ready')
                      }}
                    >
                      Tepat Berhadapan (0°)
                    </button>
                    <button
                      type="button"
                      className={`chip-btn ${orientationMode === 'miring' ? 'active' : ''}`}
                      onClick={() => {
                        setOrientationMode('miring')
                        setCollisionStatusM2('ready')
                      }}
                    >
                      Meleset / Miring (60°)
                    </button>
                  </div>
                </div>

                {/* Sakelar Katalis */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Sparkles size={15} className="text-purple" />
                      Pengaruh Katalis:
                    </span>
                    <strong className="control-val">{catalystM2 ? 'Ea = 30 kJ/mol' : 'Ea = 60 kJ/mol'}</strong>
                  </div>
                  <button
                    type="button"
                    className={`btn-catalyst-toggle ${catalystM2 ? 'active' : ''}`}
                    onClick={() => {
                      setCatalystM2(!catalystM2)
                      setCollisionStatusM2('ready')
                    }}
                  >
                    <span>{catalystM2 ? 'Katalis Aktif (Ea Rendah)' : 'Reaksi Normal (Ea Tinggi)'}</span>
                  </button>
                </div>

                <div className="sim-reaction-cta">
                  <button
                    type="button"
                    className="btn-start-sim"
                    disabled={collisionStatusM2 === 'colliding'}
                    onClick={handleLaunchCollisionM2}
                  >
                    <Play size={16} />
                    <span>Luncurkan Tumbukan Molekul</span>
                  </button>
                </div>
              </div>

              {/* Viewport Tumbukan & Diagram Profil Energi */}
              <div className="sim-viewport-panel">
                <div className="canvas-header-bar">
                  <span className="canvas-title">Uji Syarat Tumbukan Efektif: E ≥ E<sub>a</sub> & Orientasi Tepat</span>
                </div>

                {/* Stage Tumbukan Partikel */}
                <div className="collision-stage-box">
                  <div className="molecule-track">
                    {/* Molekul A */}
                    <div
                      className={`molecule-box mol-a ${collisionStatusM2 === 'success' ? 'bonded' : ''}`}
                      style={{
                        transform: `translateX(${
                          collisionStatusM2 === 'colliding'
                            ? collisionAnimStep * 1.4
                            : collisionStatusM2 === 'success'
                            ? 120
                            : collisionStatusM2 === 'failed'
                            ? 30
                            : 0
                        }px)`
                      }}
                    >
                      <div className="atom-circle atom-n">N</div>
                      <div className="atom-circle atom-o">O</div>
                      <span className="mol-label">Molekul NO</span>
                    </div>

                    {/* Titik Benturan */}
                    <div className="collision-impact-zone">
                      {collisionStatusM2 === 'success' && (
                        <div className="impact-flash success">
                          <Sparkles size={28} />
                          <span>Tumbukan Efektif! Terbentuk NO₂</span>
                        </div>
                      )}
                      {collisionStatusM2 === 'failed' && (
                        <div className="impact-flash failed">
                          <XCircle size={28} />
                          <span>Tumbukan Gagal! Memantul Kembali</span>
                        </div>
                      )}
                    </div>

                    {/* Molekul B */}
                    <div
                      className={`molecule-box mol-b ${orientationMode === 'miring' ? 'rotated-skew' : ''} ${collisionStatusM2 === 'success' ? 'bonded' : ''}`}
                      style={{
                        transform: `translateX(-${
                          collisionStatusM2 === 'colliding'
                            ? collisionAnimStep * 1.4
                            : collisionStatusM2 === 'success'
                            ? 120
                            : collisionStatusM2 === 'failed'
                            ? 30
                            : 0
                        }px) ${orientationMode === 'miring' ? 'rotate(50deg)' : ''}`
                      }}
                    >
                      <div className="atom-circle atom-o">O</div>
                      <div className="atom-circle atom-o">O</div>
                      <span className="mol-label">Molekul O₂</span>
                    </div>
                  </div>

                  {/* Keterangan Status Tumbukan */}
                  <div className="collision-feedback-badge">
                    {collisionStatusM2 === 'ready' && (
                      <span className="status-badge ready">Siap Diluncurkan. Atur energi dan sudut orientasi.</span>
                    )}
                    {collisionStatusM2 === 'colliding' && (
                      <span className="status-badge running">Partikel melesat saling mendekat...</span>
                    )}
                    {collisionStatusM2 === 'success' && (
                      <span className="status-badge success">
                        Berhasil! Energi ({kineticEnergy} kJ/mol) ≥ E<sub>a</sub> ({catalystM2 ? 30 : 60} kJ/mol) & orientasi pas berhadapan!
                      </span>
                    )}
                    {collisionStatusM2 === 'failed' && (
                      <span className="status-badge error">
                        Gagal! {kineticEnergy < (catalystM2 ? 30 : 60) ? 'Energi kurang dari Ea.' : 'Orientasi miring/meleset.'} Partikel memantul tanpa bereaksi.
                      </span>
                    )}
                  </div>
                </div>

                {/* Profil Kurva Energi Aktivasi */}
                <div className="energy-profile-card">
                  <div className="energy-chart-header">
                    <span>Kurva Profil Energi Reaksi Potensial</span>
                    <small>Garis Putus-putus = Jalur Katalis</small>
                  </div>
                  <div className="energy-curve-svg-box">
                    <svg viewBox="0 0 380 130" className="energy-svg">
                      {/* Grid Lines */}
                      <line x1="40" y1="110" x2="360" y2="110" stroke="rgba(45, 55, 72, 0.2)" strokeWidth="1" />
                      <line x1="40" y1="20" x2="40" y2="110" stroke="rgba(45, 55, 72, 0.2)" strokeWidth="1" />

                      {/* Kurva Reaksi Normal (Ea = 60) */}
                      <path
                        d="M 50 85 C 100 85, 120 25, 180 25 C 240 25, 270 95, 340 95"
                        fill="none"
                        stroke="#FD8A8A"
                        strokeWidth="3"
                      />

                      {/* Kurva dengan Katalis (Ea = 30) */}
                      <path
                        d="M 50 85 C 100 85, 130 55, 180 55 C 230 55, 270 95, 340 95"
                        fill="none"
                        stroke="#0D9488"
                        strokeWidth="2.5"
                        strokeDasharray={catalystM2 ? 'none' : '4 4'}
                        opacity={catalystM2 ? 1 : 0.6}
                      />

                      {/* Current Energy Level Marker */}
                      <line
                        x1="45"
                        y1={110 - (kineticEnergy / 100) * 85}
                        x2="350"
                        y2={110 - (kineticEnergy / 100) * 85}
                        stroke="#9EA1D4"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />

                      {/* Labels */}
                      <text x="52" y="80" fill="#2D3748" fontSize="10" fontWeight="600">Reaktan</text>
                      <text x="145" y="18" fill="#FD8A8A" fontSize="10" fontWeight="700">Ea Normal (60)</text>
                      <text x="145" y="50" fill="#0D9488" fontSize="10" fontWeight="700">Ea Katalis (30)</text>
                      <text x="310" y="90" fill="#2D3748" fontSize="10" fontWeight="600">Produk</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULASI INTERAKTIF MODUL 3: TAMPILAN MAKROSKOPIS */}
          {module.id === 'makroskopis-fenomena' && (
            <div className="sim-interactive-wrapper modul3-sim">
              <div className="sim-controls-panel">
                <h4>Reaksi: CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)</h4>

                {/* Bentuk Kalsium Karbonat */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Layers size={15} className="text-emerald" />
                      Bentuk Padatan Marmer (CaCO₃):
                    </span>
                    <strong className="control-val capitalize">{solidTypeM3}</strong>
                  </div>
                  <div className="toggle-chip-group">
                    <button
                      type="button"
                      className={`chip-btn ${solidTypeM3 === 'bongkahan' ? 'active' : ''}`}
                      onClick={() => {
                        setSolidTypeM3('bongkahan')
                        handleResetSimM3()
                      }}
                    >
                      Bongkahan Batu Marmer
                    </button>
                    <button
                      type="button"
                      className={`chip-btn ${solidTypeM3 === 'serbuk' ? 'active' : ''}`}
                      onClick={() => {
                        setSolidTypeM3('serbuk')
                        handleResetSimM3()
                      }}
                    >
                      Serbuk Halus Marmer
                    </button>
                  </div>
                </div>

                {/* Suhu Larutan */}
                <div className="control-group">
                  <div className="control-label-row">
                    <span className="control-name">
                      <Flame size={15} className="text-amber" />
                      Suhu Larutan HCl:
                    </span>
                    <strong className="control-val">{tempM3}°C</strong>
                  </div>
                  <div className="toggle-chip-group">
                    <button
                      type="button"
                      className={`chip-btn ${tempM3 === 25 ? 'active' : ''}`}
                      onClick={() => {
                        setTempM3(25)
                        handleResetSimM3()
                      }}
                    >
                      25°C (Suhu Kamar)
                    </button>
                    <button
                      type="button"
                      className={`chip-btn ${tempM3 === 50 ? 'active' : ''}`}
                      onClick={() => {
                        setTempM3(50)
                        handleResetSimM3()
                      }}
                    >
                      50°C (Dipanaskan)
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sim-button-row">
                  <button
                    type="button"
                    className="btn-start-sim"
                    disabled={simRunningM3}
                    onClick={() => setSimRunningM3(true)}
                  >
                    <Play size={16} />
                    <span>Mulai Reaksi & Amati Gelembung</span>
                  </button>
                  <button
                    type="button"
                    className="btn-reset-sim"
                    onClick={handleResetSimM3}
                  >
                    <RotateCcw size={16} />
                    <span>Atur Ulang</span>
                  </button>
                </div>

                <div className="reaction-summary-pill">
                  <small>Waktu Berjalan:</small> <strong>{elapsedSecondsM3} detik</strong> |
                  <small> Gas Terkumpul:</small> <strong>{gasVolumeM3} mL CO₂</strong>
                </div>
              </div>

              {/* Viewport Makroskopis Tabung Erlenmeyer & Balon */}
              <div className="sim-viewport-panel">
                <div className="canvas-header-bar">
                  <span className="canvas-title">Tampilan Makroskopis: Pembentukan Gelembung & Pemuaian Balon CO₂</span>
                </div>

                <div className="macro-reaction-box">
                  <div className="erlenmeyer-apparatus">
                    {/* Balon Gas CO2 di mulut labu */}
                    <div
                      className="balloon-elastic"
                      style={{
                        transform: `scale(${1 + (gasVolumeM3 / 100) * 1.6})`,
                        background: gasVolumeM3 > 5 ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'
                      }}
                    >
                      <span className="balloon-text">
                        {gasVolumeM3 > 10 ? `${gasVolumeM3} mL CO₂` : ''}
                      </span>
                    </div>

                    {/* Labu Erlenmeyer */}
                    <div className="erlenmeyer-glass">
                      {/* Cairan Larutan HCl */}
                      <div className="liquid-solution">
                        {/* Partikel Padatan di Dasar */}
                        <div className={`solid-sediment ${solidTypeM3}`}>
                          {solidTypeM3 === 'bongkahan' ? (
                            <div className="chunk-rock">Bongkahan CaCO₃</div>
                          ) : (
                            <div className="powder-cloud">Serbuk Renik CaCO₃</div>
                          )}
                        </div>

                        {/* Gelembung Gas yang Naik ke Atas */}
                        {simRunningM3 && (
                          <div className={`bubbles-stream ${solidTypeM3 === 'serbuk' ? 'dense' : 'sparse'}`}>
                            <span className="bubble b1"></span>
                            <span className="bubble b2"></span>
                            <span className="bubble b3"></span>
                            <span className="bubble b4"></span>
                            <span className="bubble b5"></span>
                            <span className="bubble b6"></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grafik Volume Gas vs Waktu (Makroskopis) */}
                  <div className="macro-graph-box">
                    <div className="graph-label-row">
                      <span>Kurva Volume Gas CO₂ (mL) vs Waktu (detik)</span>
                    </div>
                    <div className="graph-plot-area">
                      <svg viewBox="0 0 240 120" className="chart-svg">
                        <line x1="30" y1="100" x2="230" y2="100" stroke="rgba(45, 55, 72, 0.25)" strokeWidth="1" />
                        <line x1="30" y1="10" x2="30" y2="100" stroke="rgba(45, 55, 72, 0.25)" strokeWidth="1" />

                        {/* Titik-titik plot */}
                        {graphPointsM3.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#FD8A8A"
                            strokeWidth="2.5"
                            points={graphPointsM3
                              .map((pt) => `${30 + (pt.t / 40) * 190},${100 - (pt.v / 100) * 85}`)
                              .join(' ')}
                          />
                        )}

                        <text x="5" y="20" fill="#2D3748" fontSize="8" fontWeight="600">100 mL</text>
                        <text x="12" y="100" fill="#2D3748" fontSize="8" fontWeight="600">0</text>
                        <text x="210" y="115" fill="#2D3748" fontSize="8" fontWeight="600">40 s</text>
                      </svg>
                    </div>
                    <small className="graph-insight">
                      {solidTypeM3 === 'serbuk'
                        ? 'Grafik serbuk: kemiringan awal sangat curam karena laju reaksi awal tinggi!'
                        : 'Grafik bongkahan: kemiringan landai karena luas bidang sentuh terbatas.'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Row untuk Lanjut ke Explain */}
          <div className="poe-action-row">
            <button
              type="button"
              className="btn-poe-submit"
              onClick={handleProceedToExplain}
            >
              <span>Lanjut ke Tahap 3: Explain (Penjelasan Ilmiah)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAHAP 3: EXPLAIN (MENJELASKAN & MEREFLEKSIKAN)
          ======================================================== */}
      {stage === 'explain' && (
        <div className="poe-section-content explain-phase">
          {/* Komparasi Prediksi dengan Fakta Observasi */}
          <div className="reflection-card">
            <div className="reflection-header">
              <div className="reflection-icon">
                {selectedPrediction?.isCorrect ? (
                  <CheckCircle2 size={24} className="text-emerald" />
                ) : (
                  <Sparkles size={24} className="text-amber" />
                )}
              </div>
              <div>
                <h3 className="reflection-title">
                  {selectedPrediction?.isCorrect
                    ? 'Prediksi Anda Tepat dan Sesuai Pengamatan!'
                    : 'Mari Refleksikan Hasil Pengamatan Anda!'}
                </h3>
                <p className="reflection-subtitle">
                  Prediksi Awal Anda: <em>"{selectedPrediction?.text}"</em>
                </p>
              </div>
            </div>

            <div className="scientific-explanation-body">
              <div className="exp-label">Mekanisme Sains yang Terjadi:</div>
              <div
                className="exp-text"
                dangerouslySetInnerHTML={{ __html: poeData.explanationPoe }}
              ></div>
            </div>

            <div className="poe-conclusion-highlight">
              <strong>Simpulan Kunci:</strong>
              <p>
                Konsep laju reaksi tidak hanya dipahami dari rumus matematika, melainkan dari keterkaitan utuh antara
                perilaku partikel renik mikroskopis (energi kinetik dan sudut tumbukan) dengan bukti nyata yang teramati
                pada skala makroskopis (gelembung gas, warna, dan waktu reaksi).
              </p>
            </div>
          </div>

          <div className="poe-action-row between">
            <button
              type="button"
              className="btn-poe-secondary"
              onClick={() => setStage('observe')}
            >
              <RotateCcw size={16} />
              <span>Ulangi Observasi Simulasi</span>
            </button>

            <button
              type="button"
              className="btn-poe-submit"
              onClick={() => {
                if (onCompletePoe) onCompletePoe(module.id)
                alert('Aktivitas POE berhasil diselesaikan! Anda dapat melanjutkan membaca materi lengkap atau menguji pemahaman di tab Kuis.')
              }}
            >
              <CheckCircle2 size={18} />
              <span>Selesaikan Aktivitas POE Modul Ini</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
