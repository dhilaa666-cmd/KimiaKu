import React, { useState } from 'react'
import {
  HelpCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  FileEdit
} from 'lucide-react'
import {
  getStoredPoeData,
  savePoeDraft,
  savePoeSubmission,
  syncPoeToFirestore,
  SYNC_STATUS
} from '../utils/storage'
import PoeSimulation from './PoeSimulation'

export default function PoeInteractiveSection({
  module,
  onCompletePoe,
  currentUser,
  isGuest
}) {
  const [poeStep, setPoeStep] = useState('predict') // 'predict' | 'observe' | 'explain'
  const poeScenario = module.poeScenario

  // State Input Form Siswa POE diinisialisasi langsung dari data tersimpan
  const [predictChoiceId, setPredictChoiceId] = useState(() => {
    return getStoredPoeData(module.id)?.predictChoiceId || ''
  })
  const [predictText, setPredictText] = useState(() => {
    return getStoredPoeData(module.id)?.predictText || ''
  })
  const [observeNotes, setObserveNotes] = useState(() => {
    return getStoredPoeData(module.id)?.observeNotes || ''
  })
  const [explainText, setExplainText] = useState(() => {
    return getStoredPoeData(module.id)?.explainText || ''
  })

  // State Status Pengiriman & Penyimpanan
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return Boolean(getStoredPoeData(module.id)?.isSubmitted)
  })
  const [syncStatus, setSyncStatus] = useState(() => {
    return getStoredPoeData(module.id)?.syncStatus || SYNC_STATUS.LOCAL
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Auto-save draft locally on change
  const handleSaveDraft = (overrides = {}) => {
    setIsSaving(true)
    const payload = {
      moduleId: module.id,
      predictChoiceId: overrides.predictChoiceId ?? predictChoiceId,
      predictText: overrides.predictText ?? predictText,
      observeNotes: overrides.observeNotes ?? observeNotes,
      explainText: overrides.explainText ?? explainText
    }
    savePoeDraft(payload)
    setTimeout(() => {
      setIsSaving(false)
      setSaveMessage('Draf tersimpan di peramban')
      setTimeout(() => setSaveMessage(''), 2500)
    }, 200)
  }

  // Go to step with scroll reset
  const goToStep = (step) => {
    handleSaveDraft()
    setPoeStep(step)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const scrollContainer = document.querySelector('.main-content-scroll-area')
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Submit final POE answers to teacher (local + Firestore)
  const handleSubmitPoe = async () => {
    if (!predictText.trim()) {
      alert('Harap isi kolom Dugaan Awal (Prediksi) Anda sebelum mengirimkan tugas POE.')
      setPoeStep('predict')
      return
    }
    if (!explainText.trim()) {
      alert('Harap lengkapi kolom Penjelasan Ilmiah (Explain) Anda sebelum mengirimkan tugas POE.')
      return
    }

    setIsSaving(true)
    const saved = savePoeSubmission({
      moduleId: module.id,
      predictChoiceId,
      predictText,
      observeNotes,
      explainText,
      currentUser,
      isGuest
    })

    setIsSubmitted(true)
    setSyncStatus(saved.syncStatus)

    // Mark completion in parent
    if (onCompletePoe) {
      onCompletePoe(module.id)
    }

    // Attempt sync to Firestore if user logged in
    if (currentUser && currentUser.uid) {
      setSyncStatus(SYNC_STATUS.PENDING)
      try {
        const res = await syncPoeToFirestore(currentUser, module.id)
        if (res.success) {
          setSyncStatus(SYNC_STATUS.SYNCED)
        } else {
          setSyncStatus(SYNC_STATUS.FAILED)
        }
      } catch (err) {
        console.warn('Sync POE failed:', err)
        setSyncStatus(SYNC_STATUS.FAILED)
      }
    } else {
      setSyncStatus(SYNC_STATUS.LOCAL)
    }

    setIsSaving(false)
    alert('Tugas Sintaks POE Anda berhasil disimpan dan dikirimkan ke Panel Guru!')
  }

  return (
    <div className="poe-interactive-wrapper">
      {/* Stepper Header POE (Predict - Observe - Explain) */}
      <div className="poe-steps-nav">
        <button
          type="button"
          className={`poe-nav-step ${poeStep === 'predict' ? 'active' : ''} ${predictText.trim() ? 'done' : ''}`}
          onClick={() => goToStep('predict')}
        >
          <div className="step-circle">1</div>
          <div className="step-info">
            <span className="step-phase-name">Predict</span>
            <small className="step-phase-sub">Dugaan Awal</small>
          </div>
        </button>

        <div className="step-connector-line"></div>

        <button
          type="button"
          className={`poe-nav-step ${poeStep === 'observe' ? 'active' : ''} ${observeNotes.trim() ? 'done' : ''}`}
          onClick={() => goToStep('observe')}
        >
          <div className="step-circle">2</div>
          <div className="step-info">
            <span className="step-phase-name">Observe</span>
            <small className="step-phase-sub">Simulasi & Pengamatan</small>
          </div>
        </button>

        <div className="step-connector-line"></div>

        <button
          type="button"
          className={`poe-nav-step ${poeStep === 'explain' ? 'active' : ''} ${isSubmitted ? 'done' : ''}`}
          onClick={() => goToStep('explain')}
        >
          <div className="step-circle">3</div>
          <div className="step-info">
            <span className="step-phase-name">Explain</span>
            <small className="step-phase-sub">Penjelasan Ilmiah</small>
          </div>
        </button>
      </div>

      {/* Bar Notifikasi Status Sinkronisasi */}
      <div className="poe-status-bar">
        <div className="status-indicator-left">
          {isSaving ? (
            <span className="save-status-text saving">Menyimpan draf...</span>
          ) : saveMessage ? (
            <span className="save-status-text success">{saveMessage}</span>
          ) : (
            <span className="save-status-text normal">Penyimpanan Otomatis Aktif</span>
          )}
        </div>

        <div className="status-indicator-right">
          <span className={`sync-badge ${syncStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            Status Pengiriman: {syncStatus}
          </span>
          {isSubmitted && (
            <span className="submitted-check-badge">
              <CheckCircle2 size={13} />
              <span>Terkirim ke Panel Guru</span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================
          LANGKAH 1: PREDICT (MEMBUAT PREDIKSI / DUGAAN AWAL)
          ======================================================== */}
      {poeStep === 'predict' && (
        <div className="poe-stage-box predict-stage">
          <div className="stage-banner">
            <div className="stage-icon-wrap amber">
              <HelpCircle size={22} />
            </div>
            <div>
              <span className="stage-tag">LANGKAH 1: PREDICT (PREDIKSI)</span>
              <h3 className="stage-title">Rumuskan Hipotesis Awal Anda Sebelum Eksperimen</h3>
              <p className="stage-desc">
                Jangan takut salah! Sains berakar dari keberanian menyusun dugaan logis sebelum menguji fakta di laboratorium.
              </p>
            </div>
          </div>

          {/* Pertanyaan Kasus Sintaks */}
          <div className="poe-scenario-card">
            <h4 className="scenario-question-title">{poeScenario.question}</h4>

            {/* Opsi Dugaan */}
            <div className="prediction-options-list">
              {poeScenario.predictions.map((opt) => (
                <label
                  key={opt.id}
                  className={`prediction-option-label ${predictChoiceId === opt.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="predictionOption"
                    value={opt.id}
                    checked={predictChoiceId === opt.id}
                    onChange={() => {
                      setPredictChoiceId(opt.id)
                      handleSaveDraft({ predictChoiceId: opt.id })
                    }}
                    className="prediction-radio"
                  />
                  <span className="option-text">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kolom Teks Input Hipotesis Mandiri Siswa (Wajib Guru) */}
          <div className="student-input-card">
            <div className="input-card-header">
              <FileEdit size={18} className="text-coral" />
              <div>
                <strong className="input-field-title">
                  Kolom Jawaban Siswa (Dugaan Awal & Alasan Anda):
                </strong>
                <p className="input-field-hint">
                  Tuliskan dalam 2–4 kalimat: Mengapa Anda memilih prediksi tersebut? Apa yang Anda perkirakan terjadi pada partikel dan gelembung gas?
                </p>
              </div>
            </div>

            <textarea
              className="poe-textarea"
              rows={4}
              placeholder="Contoh: Menurut dugaan saya, reaksi akan lebih cepat karena kenaikan suhu membuat partikel bergerak lebih lincah sehingga frekuensi tabrakan meningkat..."
              value={predictText}
              onChange={(e) => setPredictText(e.target.value)}
              onBlur={() => handleSaveDraft()}
            />

            <div className="textarea-footer-info">
              <span>Jawaban akan diverifikasi oleh Guru di Panel Guru</span>
              <button
                type="button"
                className="btn-quick-save-draft"
                onClick={() => handleSaveDraft()}
              >
                <Save size={14} />
                <span>Simpan Draf</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="stage-action-row">
            <button
              type="button"
              className="btn-poe-next"
              onClick={() => goToStep('observe')}
            >
              <span>Lanjut ke Langkah 2: Observe (Pengamatan Simulasi)</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          LANGKAH 2: OBSERVE (SIMULASI DINAMIS & CATATAN PENGAMATAN)
          ======================================================== */}
      {poeStep === 'observe' && (
        <div className="poe-stage-box observe-stage">
          <div className="stage-banner">
            <div className="stage-icon-wrap emerald">
              <Eye size={22} />
            </div>
            <div>
              <span className="stage-tag">LANGKAH 2: OBSERVE (PENGAMATAN)</span>
              <h3 className="stage-title">Uji Simulasi Interaktif & Catat Bukti Pengamatan Anda</h3>
              <p className="stage-desc">
                Manipulasi variabel independen (suhu, konsentrasi, luas permukaan, katalis) lalu perhatikan bagaimana partikel dan gelembung gas bereaksi!
              </p>
            </div>
          </div>

          {/* Simulator Partikel / Reaksi Makroskopis */}
          <div className="poe-sim-container-card">
            <PoeSimulation
              module={module}
              onCompletePoe={() => {}}
              isCompleted={false}
            />
          </div>

          {/* Kolom Catatan Pengamatan Siswa (Wajib Guru) */}
          <div className="student-input-card">
            <div className="input-card-header">
              <FileEdit size={18} className="text-emerald" />
              <div>
                <strong className="input-field-title">
                  Kolom Catatan Pengamatan Anda:
                </strong>
                <p className="input-field-hint">
                  Catat apa yang Anda amati: Apakah partikel bergerak lebih cepat? Berapa banyak tumbukan efektif yang terjadi? Bagaimana volume gas CO₂ pada kurva waktu?
                </p>
              </div>
            </div>

            <textarea
              className="poe-textarea"
              rows={4}
              placeholder="Contoh: Saat suhu dinaikkan ke 60°C dan konsentrasi 2 M, partikel di wadah bergerak sangat cepat dan percikan tumbukan efektif bertambah banyak. Pada grafik makroskopis, kurva volume gas melesat curam dalam 15 detik pertama..."
              value={observeNotes}
              onChange={(e) => setObserveNotes(e.target.value)}
              onBlur={() => handleSaveDraft()}
            />

            <div className="textarea-footer-info">
              <span>Catatan ini tersimpan dan dapat dibaca oleh Aulia di Panel Guru</span>
              <button
                type="button"
                className="btn-quick-save-draft"
                onClick={() => handleSaveDraft()}
              >
                <Save size={14} />
                <span>Simpan Draf</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="stage-action-row between">
            <button
              type="button"
              className="btn-poe-back"
              onClick={() => goToStep('predict')}
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Prediksi</span>
            </button>

            <button
              type="button"
              className="btn-poe-next"
              onClick={() => goToStep('explain')}
            >
              <span>Lanjut ke Langkah 3: Explain (Penjelasan Ilmiah)</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          LANGKAH 3: EXPLAIN (PENJELASAN ILMIAH & PENGIRIMAN GURU)
          ======================================================== */}
      {poeStep === 'explain' && (
        <div className="poe-stage-box explain-stage">
          <div className="stage-banner">
            <div className="stage-icon-wrap indigo">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="stage-tag">LANGKAH 3: EXPLAIN (PENJELASAN ILMIAH)</span>
              <h3 className="stage-title">Jelaskan Fakta Pengamatan Berdasarkan Konsep Ilmiah</h3>
              <p className="stage-desc">
                Cocokkan dugaan awal Anda dengan temuan observasi, lalu uraikan alasan ilmiahnya menggunakan Teori Tumbukan dan Energi Aktivasi.
              </p>
            </div>
          </div>

          {/* Komparasi Prediksi Awal */}
          <div className="prediction-recap-box">
            <div className="recap-header">
              <CheckCircle2 size={18} className="text-coral" />
              <strong>Rekapitulasi Prediksi Awal Anda:</strong>
            </div>
            <p className="recap-text">
              <em>"{predictText || '(Belum mengisi dugaan awal di langkah 1)'}"</em>
            </p>
          </div>

          {/* Landasan Mekanisme Sains dari Kurikulum */}
          <div className="official-explanation-box">
            <h4 className="official-title">Mekanisme Sains Resmi (Kurikulum Merdeka):</h4>
            <div
              className="official-content"
              dangerouslySetInnerHTML={{ __html: poeScenario.explanationPoe }}
            />
          </div>

          {/* Kolom Teks Penjelasan Siswa Sendiri (Dikirim ke Guru) */}
          <div className="student-input-card highlight">
            <div className="input-card-header">
              <FileEdit size={18} className="text-coral" />
              <div>
                <strong className="input-field-title">
                  Penjelasan Ilmiah Siswa (Wajib Dinilai Guru):
                </strong>
                <p className="input-field-hint">
                  Gunakan istilah ilmiah: <strong>Tumbukan Efektif</strong>, <strong>Energi Kinetik</strong>,{' '}
                  <strong>Energi Aktivasi (Ea)</strong>, atau <strong>Luas Bidang Sentuh</strong> untuk menjelaskan mengapa fenomena tersebut terjadi.
                </p>
              </div>
            </div>

            <textarea
              className="poe-textarea"
              rows={5}
              placeholder="Tuliskan analisis ilmiah Anda secara mendalam di sini untuk dinilai oleh Aulia di Panel Guru..."
              value={explainText}
              onChange={(e) => setExplainText(e.target.value)}
              onBlur={() => handleSaveDraft()}
            />

            <div className="textarea-footer-info">
              <span>Data tersimpan otomatis di localStorage dan disinkronkan ke Firestore</span>
            </div>
          </div>

          {/* Tombol Kirim Jawaban POE ke Guru */}
          <div className="stage-action-row between">
            <button
              type="button"
              className="btn-poe-back"
              onClick={() => goToStep('observe')}
            >
              <ArrowLeft size={16} />
              <span>Ulangi Observasi Simulasi</span>
            </button>

            <button
              type="button"
              className="btn-submit-poe-final"
              onClick={handleSubmitPoe}
              disabled={isSaving}
            >
              <Send size={17} />
              <span>{isSubmitted ? 'Perbarui Jawaban ke Panel Guru' : 'Kirim Tugas POE ke Panel Guru'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
