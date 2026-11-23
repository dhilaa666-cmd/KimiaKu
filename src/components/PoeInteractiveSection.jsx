import React, { useState, useEffect, useRef } from 'react'
import {
  HelpCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  FileEdit,
  RotateCw,
  AlertCircle
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

  const currentUid = currentUser?.uid || 'guest'

  // State Input Form Siswa POE diinisialisasi langsung dari data tersimpan terisolasi per akun
  const [predictChoiceId, setPredictChoiceId] = useState(() => {
    return getStoredPoeData(module.id, currentUid)?.predictChoiceId || ''
  })
  const [predictText, setPredictText] = useState(() => {
    return getStoredPoeData(module.id, currentUid)?.predictText || ''
  })
  const [observeNotes, setObserveNotes] = useState(() => {
    return getStoredPoeData(module.id, currentUid)?.observeNotes || ''
  })
  const [explainText, setExplainText] = useState(() => {
    return getStoredPoeData(module.id, currentUid)?.explainText || ''
  })

  // State Status Pengiriman & Penyimpanan
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return Boolean(getStoredPoeData(module.id, currentUid)?.isSubmitted)
  })
  const [syncStatus, setSyncStatus] = useState(() => {
    return getStoredPoeData(module.id, currentUid)?.syncStatus || SYNC_STATUS.LOCAL
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const debounceTimerRef = useRef(null)
  const isInitialMount = useRef(true)

  // Efek pergantian akun atau modul: muat ulang data terisolasi milik akun aktif
  useEffect(() => {
    const data = getStoredPoeData(module.id, currentUid)
    setPredictChoiceId(data?.predictChoiceId || '')
    setPredictText(data?.predictText || '')
    setObserveNotes(data?.observeNotes || '')
    setExplainText(data?.explainText || '')
    setIsSubmitted(Boolean(data?.isSubmitted))
    setSyncStatus(data?.syncStatus || SYNC_STATUS.LOCAL)
    isInitialMount.current = true
  }, [module.id, currentUid])

  // Auto-save dengan debounce (600ms) saat siswa mengetik di formulir POE (Temuan 03-07)
  useEffect(() => {
    // Lewati saat initial mount atau setelah pergantian modul/akun
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const payload = {
        moduleId: module.id,
        predictChoiceId,
        predictText,
        observeNotes,
        explainText
      }
      savePoeDraft(payload, currentUid)
      setIsSaving(false)
      setSaveMessage('Tersimpan')
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    }, 600)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [predictChoiceId, predictText, observeNotes, explainText, module.id, currentUid])

  // Simpan segera jika tab di-refresh atau ditutup sebelum jeda debounce selesai (Temuan 03-07)
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePoeDraft(
        {
          moduleId: module.id,
          predictChoiceId,
          predictText,
          observeNotes,
          explainText
        },
        currentUid
      )
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [module.id, predictChoiceId, predictText, observeNotes, explainText, currentUid])

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
    savePoeDraft(payload, currentUid)
    setTimeout(() => {
      setIsSaving(false)
      setSaveMessage('Tersimpan')
      setTimeout(() => setSaveMessage(''), 2500)
    }, 150)
  }

  // Go to step with scroll reset
  const goToStep = (step) => {
    handleSaveDraft()
    setPoeStep(step)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const scrollContainer = document.querySelector('.main-content-scroll-area')
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
  }

  const [isRetrying, setIsRetrying] = useState(false)

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
    }, currentUid)

    setIsSubmitted(true)
    let finalStatus = saved.syncStatus
    setSyncStatus(finalStatus)

    // Mark completion in parent
    if (onCompletePoe) {
      onCompletePoe(module.id)
    }

    // Jika pengguna dalam mode tamu atau belum login
    if (isGuest || !currentUser?.uid) {
      setSyncStatus(SYNC_STATUS.LOCAL)
      setIsSaving(false)
      alert('Tersimpan secara lokal di perangkat (Mode Tamu). Masuk dengan akun Google untuk dapat mengirimkan tugas langsung ke Panel Guru secara daring.')
      return
    }

    // Pengguna login: coba sinkronisasi ke Firestore
    setSyncStatus(SYNC_STATUS.PENDING)
    try {
      const res = await syncPoeToFirestore(currentUser, module.id)
      if (res.success && !res.offline) {
        setSyncStatus(SYNC_STATUS.SYNCED)
        finalStatus = SYNC_STATUS.SYNCED
        alert('Tugas Sintaks POE Anda berhasil disimpan dan dikirimkan ke Panel Guru!')
      } else {
        setSyncStatus(SYNC_STATUS.FAILED)
        finalStatus = SYNC_STATUS.FAILED
        alert('Gagal menyinkronkan tugas ke cloud. Jawaban Anda tetap tersimpan secara aman di perangkat lokal. Silakan gunakan tombol "Coba Lagi" untuk mengirim ulang.')
      }
    } catch (err) {
      console.warn('Sync POE failed:', err)
      setSyncStatus(SYNC_STATUS.FAILED)
      finalStatus = SYNC_STATUS.FAILED
      alert('Gagal menyinkronkan tugas ke cloud. Jawaban Anda tetap tersimpan secara aman di perangkat lokal. Silakan periksa koneksi internet Anda dan gunakan tombol "Coba Lagi".')
    } finally {
      setIsSaving(false)
    }
  }

  // Tombol Coba Lagi untuk sinkronisasi ke Firestore saat gagal (Temuan 03-03)
  const handleRetrySync = async () => {
    if (isGuest || !currentUser?.uid) {
      alert('Mode Tamu: Masuk dengan akun Google untuk menyinkronkan tugas ke cloud Panel Guru.')
      return
    }
    setIsRetrying(true)
    setSyncStatus(SYNC_STATUS.PENDING)
    try {
      const res = await syncPoeToFirestore(currentUser, module.id)
      if (res.success && !res.offline) {
        setSyncStatus(SYNC_STATUS.SYNCED)
        alert('Tugas Sintaks POE Anda berhasil disinkronkan dan dikirimkan ke Panel Guru!')
      } else {
        setSyncStatus(SYNC_STATUS.FAILED)
        alert('Sinkronisasi ulang gagal. Jawaban Anda tetap tersimpan aman di perangkat lokal.')
      }
    } catch (err) {
      console.warn('Retry sync POE error:', err)
      setSyncStatus(SYNC_STATUS.FAILED)
      alert('Sinkronisasi ulang gagal. Periksa koneksi internet Anda.')
    } finally {
      setIsRetrying(false)
    }
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
            <span className="save-status-text saving">Menyimpan...</span>
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
          {isSubmitted && syncStatus === SYNC_STATUS.SYNCED && (
            <span className="submitted-check-badge">
              <CheckCircle2 size={13} />
              <span>Terkirim ke Panel Guru</span>
            </span>
          )}
          {isSubmitted && (syncStatus === SYNC_STATUS.LOCAL || isGuest) && (
            <span className="submitted-local-badge">
              <CheckCircle2 size={13} />
              <span>Tersimpan di Perangkat (Mode Tamu)</span>
            </span>
          )}
          {isSubmitted && syncStatus === SYNC_STATUS.FAILED && (
            <span className="submitted-failed-badge">
              <AlertCircle size={13} />
              <span>Belum Terkirim ke Cloud</span>
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

          {/* Baris Peringatan jika Gagal Sinkronisasi dengan Tombol Coba Lagi */}
          {syncStatus === SYNC_STATUS.FAILED && (
            <div className="poe-sync-alert-banner">
              <div className="alert-content">
                <AlertCircle size={18} className="text-amber" />
                <div className="alert-text-block">
                  <strong>Sinkronisasi ke Cloud Belum Berhasil</strong>
                  <p>Jawaban Anda tetap aman tersimpan di perangkat lokal ini. Silakan gunakan tombol Coba Lagi.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-poe-retry-inline"
                onClick={handleRetrySync}
                disabled={isSaving || isRetrying}
              >
                <RotateCw size={14} className={isRetrying ? 'spin' : ''} />
                <span>{isRetrying ? 'Mengirim Ulang...' : 'Coba Lagi'}</span>
              </button>
            </div>
          )}

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

            <div className="poe-submit-actions-group">
              {syncStatus === SYNC_STATUS.FAILED && (
                <button
                  type="button"
                  className="btn-poe-retry-action"
                  onClick={handleRetrySync}
                  disabled={isSaving || isRetrying}
                >
                  <RotateCw size={15} className={isRetrying ? 'spin' : ''} />
                  <span>{isRetrying ? 'Mengirim Ulang...' : 'Coba Lagi Kirim ke Guru'}</span>
                </button>
              )}

              <button
                type="button"
                className="btn-submit-poe-final"
                onClick={handleSubmitPoe}
                disabled={isSaving || isRetrying}
              >
                <Send size={17} />
                <span>
                  {isGuest
                    ? (isSubmitted ? 'Perbarui Simpanan Lokal' : 'Simpan Tugas (Mode Tamu)')
                    : (isSubmitted ? 'Perbarui Jawaban ke Panel Guru' : 'Kirim Tugas POE ke Panel Guru')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
