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
import confetti from 'canvas-confetti'
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
  onToggleComplete,
  isCompleted = false,
  currentUser,
  isGuest,
  poeStep: controlledPoeStep,
  setPoeStep: setControlledPoeStep
}) {
  const [internalPoeStep, setInternalPoeStep] = useState('predict')
  const poeStep = controlledPoeStep !== undefined ? controlledPoeStep : internalPoeStep
  const setPoeStep = setControlledPoeStep || setInternalPoeStep
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
  const [syncErrorMessage, setSyncErrorMessage] = useState(() => {
    return getStoredPoeData(module.id, currentUid)?.syncError || null
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
    setSyncErrorMessage(data?.syncError || null)
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

  // Go to step with scroll reset and minimum 20-character validation
  const MIN_CHARS = 20

  const goToStep = (targetStep) => {
    // Validasi saat berpindah maju antar-tahap
    if (poeStep === 'predict' && (targetStep === 'observe' || targetStep === 'explain')) {
      if (!predictText || predictText.trim().length < MIN_CHARS) {
        alert(`Harap tuliskan dugaan awal dan alasanmu minimal ${MIN_CHARS} karakter terlebih dahulu sebelum melanjutkan ke tahap ${targetStep === 'observe' ? 'Observe' : 'Explain'}.`)
        return
      }
    }

    if (poeStep === 'observe' && targetStep === 'explain') {
      if (!observeNotes || observeNotes.trim().length < MIN_CHARS) {
        alert(`Harap tuliskan catatan hasil pengamatan simulasi minimal ${MIN_CHARS} karakter terlebih dahulu sebelum melanjutkan ke tahap Explain.`)
        return
      }
    }

    // Jika langsung klik step Explain dari stepper navigasi
    if (targetStep === 'explain') {
      if (!predictText || predictText.trim().length < MIN_CHARS) {
        alert(`Harap lengkapi tahap Predict (minimal ${MIN_CHARS} karakter) terlebih dahulu.`)
        setPoeStep('predict')
        return
      }
      if (!observeNotes || observeNotes.trim().length < MIN_CHARS) {
        alert(`Harap lengkapi tahap Observe (minimal ${MIN_CHARS} karakter) terlebih dahulu.`)
        setPoeStep('observe')
        return
      }
    }

    handleSaveDraft()
    setPoeStep(targetStep)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const scrollContainer = document.querySelector('.main-content-scroll-area')
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
  }

  const [isRetrying, setIsRetrying] = useState(false)

  // Submit final POE answers to teacher (local + Firestore)
  const handleSubmitPoe = async () => {
    if (!predictText || predictText.trim().length < MIN_CHARS) {
      alert(`Harap isi kolom Dugaan Awal (Prediksi) Anda minimal ${MIN_CHARS} karakter sebelum mengirimkan tugas POE.`)
      setPoeStep('predict')
      return
    }
    if (!observeNotes || observeNotes.trim().length < MIN_CHARS) {
      alert(`Harap lengkapi kolom Catatan Pengamatan (Observe) Anda minimal ${MIN_CHARS} karakter sebelum mengirimkan tugas POE.`)
      setPoeStep('observe')
      return
    }
    if (!explainText || explainText.trim().length < MIN_CHARS) {
      alert(`Harap lengkapi kolom Penjelasan Ilmiah (Explain) Anda minimal ${MIN_CHARS} karakter sebelum mengirimkan tugas POE.`)
      return
    }

    setIsSaving(true)
    setSyncErrorMessage(null)

    // Bersihkan semua properti agar tidak ada nilai undefined yang ditolak Firestore
    const safePayload = {
      moduleId: String(module?.id || ''),
      predictChoiceId: String(predictChoiceId || ''),
      predictText: String(predictText || '').trim(),
      observeNotes: String(observeNotes || '').trim(),
      explainText: String(explainText || '').trim(),
      currentUser: currentUser || null,
      isGuest: Boolean(isGuest)
    }

    const saved = savePoeSubmission(safePayload, currentUid)

    // Buka kotak refleksi & mekanisme sains resmi
    setIsSubmitted(true)
    let finalStatus = saved.syncStatus
    setSyncStatus(finalStatus)

    // Tandai penyelesaian di modul agar progres bertambah
    if (onCompletePoe) {
      onCompletePoe(module.id)
    }
    if (onToggleComplete && !isCompleted) {
      onToggleComplete(module.id)
    }

    // Jalankan efek konfeti perayaan
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      })
    } catch (err) {
      console.warn('[KimiaKu POE] Confetti error:', err)
    }

    // Jika pengguna dalam mode tamu atau belum login
    if (isGuest || !currentUser?.uid) {
      setSyncStatus(SYNC_STATUS.LOCAL)
      setSyncErrorMessage(null)
      setIsSaving(false)
      alert('Tugas Sintaks POE Anda berhasil diselesaikan dan tersimpan di perangkat lokal (Mode Tamu). Masuk dengan akun Google untuk dapat mengirimkan tugas langsung ke Panel Guru secara daring.')
      return
    }

    // Pengguna login: coba sinkronisasi ke Firestore
    setSyncStatus(SYNC_STATUS.PENDING)
    try {
      const res = await syncPoeToFirestore(currentUser, module.id)
      if (res.success && !res.offline) {
        setSyncStatus(SYNC_STATUS.SYNCED)
        setSyncErrorMessage(null)
        finalStatus = SYNC_STATUS.SYNCED
        alert('Tugas Sintaks POE Anda berhasil disimpan dan dikirimkan ke Panel Guru!')
      } else if (res.offline) {
        setSyncStatus(SYNC_STATUS.LOCAL)
        const offlineMsg = res.message || 'Firebase Firestore sedang luring atau belum terkonfigurasi di lingkungan ini.'
        setSyncErrorMessage(offlineMsg)
        finalStatus = SYNC_STATUS.LOCAL
        alert(`Tugas Sintaks POE Anda berhasil disimpan di penyimpanan lokal. (${offlineMsg})`)
      } else {
        const errDetail = res.error || res.message || 'Gagal menyinkronkan tugas ke cloud.'
        console.error('[KimiaKu POE Sync Error]:', errDetail, res)
        setSyncStatus(SYNC_STATUS.FAILED)
        setSyncErrorMessage(errDetail)
        finalStatus = SYNC_STATUS.FAILED
        alert(`Jawaban Anda aman tersimpan di perangkat lokal, namun sinkronisasi ke cloud gagal: ${errDetail}`)
      }
    } catch (err) {
      const errDetail = err?.message || err?.code || String(err)
      console.error('[KimiaKu POE Sync Exception]:', err)
      setSyncStatus(SYNC_STATUS.FAILED)
      setSyncErrorMessage(errDetail)
      finalStatus = SYNC_STATUS.FAILED
      alert(`Jawaban Anda aman tersimpan di perangkat lokal. Gagal terhubung ke cloud: ${errDetail}`)
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
    setSyncErrorMessage(null)
    try {
      const res = await syncPoeToFirestore(currentUser, module.id)
      if (res.success && !res.offline) {
        setSyncStatus(SYNC_STATUS.SYNCED)
        setSyncErrorMessage(null)
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          })
        } catch (e) {
          console.warn(e)
        }
        alert('Tugas Sintaks POE Anda berhasil disinkronkan dan dikirimkan ke Panel Guru!')
      } else if (res.offline) {
        setSyncStatus(SYNC_STATUS.LOCAL)
        const offlineMsg = res.message || 'Firebase Firestore sedang luring atau belum terkonfigurasi di lingkungan ini.'
        setSyncErrorMessage(offlineMsg)
        alert(`Data tersimpan di penyimpanan lokal: ${offlineMsg}`)
      } else {
        const errDetail = res.error || res.message || 'Gagal menyinkronkan tugas ke cloud.'
        console.error('[KimiaKu POE Retry Sync Error]:', errDetail, res)
        setSyncStatus(SYNC_STATUS.FAILED)
        setSyncErrorMessage(errDetail)
        alert(`Sinkronisasi ulang belum berhasil: ${errDetail}. Jawaban Anda tetap tersimpan aman di perangkat lokal.`)
      }
    } catch (err) {
      const errDetail = err?.message || err?.code || String(err)
      console.error('[KimiaKu POE Retry Exception]:', err)
      setSyncStatus(SYNC_STATUS.FAILED)
      setSyncErrorMessage(errDetail)
      alert(`Sinkronisasi ulang gagal: ${errDetail}. Periksa koneksi internet atau hak akses Firebase Anda.`)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="poe-interactive-wrapper">
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
                  Tuliskan dugaan awal dan alasanmu berdasarkan pemahamanmu sebelum menguji simulasi.
                </p>
              </div>
            </div>

            <textarea
              className="poe-textarea"
              rows={4}
              placeholder="Tuliskan dugaan awal dan alasanmu berdasarkan pemahamanmu sebelum menguji simulasi (minimal 20 karakter)..."
              value={predictText}
              onChange={(e) => setPredictText(e.target.value)}
              onBlur={() => handleSaveDraft()}
            />

            <div className="textarea-footer-info">
              <span>Minimal 20 karakter &bull; Terisi: {predictText.trim().length} karakter</span>
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

          {/* a) Ringkasan Teks Prediksi Awal Siswa (Read-only) */}
          <div className="prediction-recap-box">
            <div className="recap-header">
              <CheckCircle2 size={18} className="text-emerald" />
              <strong>Ringkasan Prediksi Awal Anda (Tahap Predict):</strong>
            </div>
            {predictChoiceId && (
              <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                Pilihan Hipotesis: {poeScenario?.predictions?.find(p => p.id === predictChoiceId)?.text || predictChoiceId}
              </p>
            )}
            <p className="recap-text">
              <em>&quot;{predictText.trim() ? predictText : '(Belum mengisi dugaan awal di langkah 1)'}&quot;</em>
            </p>
          </div>

          {/* b) Kotak Panduan Singkat Prosedur Penggunaan Simulasi */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#166534'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
              <Sparkles size={18} className="text-emerald" />
              <span>Prosedur Penggunaan Simulasi:</span>
            </div>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', lineHeight: '1.6', color: '#15803D' }}>
              <li>Tinjau kembali hipotesis awal Anda.</li>
              <li>Atur variabel Suhu Reaksi, Konsentrasi Reaktan, Luas Bidang Sentuh, dan Katalisator pada panel kiri.</li>
              <li>Amati pergerakan partikel serta tumbukan efektif pada Visualisasi Tumbukan Mikroskopis di panel kanan.</li>
              <li>Klik tombol &quot;Uji Laju Pembentukan Produk&quot; untuk melihat hasil laju reaksi.</li>
              <li>Tuliskan hasil pengamatan pada Kolom Catatan Pengamatan Anda, lalu lanjut ke Tahap 3: Explain.</li>
            </ol>
          </div>

          {/* c) Simulator Partikel / Reaksi Makroskopis */}
          <div className="poe-sim-container-card">
            <style>{`.poe-sim-container-card .poe-action-row { display: none !important; }`}</style>
            <PoeSimulation
              module={module}
              initialStage="observe"
              hideStepper={true}
              onCompletePoe={() => {}}
              isCompleted={false}
            />
          </div>

          {/* d) Kolom Catatan Pengamatan Siswa (Wajib Guru) */}
          <div className="student-input-card">
            <div className="input-card-header">
              <FileEdit size={18} className="text-emerald" />
              <div>
                <strong className="input-field-title">
                  Kolom Catatan Pengamatan Anda:
                </strong>
                <p className="input-field-hint">
                  Tuliskan hasil pengamatanmu dari simulasi: (1) Bagaimana perubahan gerak partikel saat variabel diubah? (2) Bagaimana perbandingan jumlah tumbukan efektifnya? (3) Bagaimana perubahan laju pembentukan produk?
                </p>
              </div>
            </div>

            <textarea
              className="poe-textarea"
              rows={4}
              placeholder="Tuliskan hasil pengamatanmu dari simulasi:&#10;(1) Bagaimana perubahan gerak partikel saat variabel diubah?&#10;(2) Bagaimana perbandingan jumlah tumbukan efektifnya?&#10;(3) Bagaimana perubahan laju pembentukan produk?&#10;(Minimal 20 karakter)..."
              value={observeNotes}
              onChange={(e) => setObserveNotes(e.target.value)}
              onBlur={() => handleSaveDraft()}
            />

            <div className="textarea-footer-info">
              <span>Minimal 20 karakter &bull; Terisi: {observeNotes.trim().length} karakter</span>
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

          {/* SEBELUM SUBMIT: Rekapitulasi Catatan Observasi untuk Membantu Siswa Menulis Penjelasan */}
          {!isSubmitted && (
            <div className="prediction-recap-box">
              <div className="recap-header">
                <CheckCircle2 size={18} className="text-coral" />
                <strong>Catatan Pengamatan Anda dari Tahap Observe:</strong>
              </div>
              <p className="recap-text">
                <em>&quot;{observeNotes.trim() ? observeNotes : '(Belum ada catatan pengamatan)'}&quot;</em>
              </p>
            </div>
          )}

          {/* SETELAH SUBMIT: Evaluasi Kebenaran Prediksi Awal & Mekanisme Sains Resmi (disembunyikan sebelum siswa submit jawaban Explain) */}
          {isSubmitted && (
            <>
              <div className="prediction-recap-box" style={{ background: '#F0F9FF', borderLeftColor: '#0EA5E9' }}>
                <div className="recap-header">
                  <CheckCircle2 size={18} className="text-sky" />
                  <strong>Refleksi &amp; Evaluasi Prediksi Awal Anda:</strong>
                </div>
                {predictChoiceId && (
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                    Hipotesis yang Anda pilih:{' '}
                    <span style={{ color: '#0369A1' }}>
                      {poeScenario?.predictions?.find(p => p.id === predictChoiceId)?.text || predictChoiceId}
                    </span>
                  </p>
                )}
                <p className="recap-text" style={{ marginBottom: '8px' }}>
                  <em>Dugaan Awal Anda: &quot;{predictText || '(Belum mengisi)'}&quot;</em>
                </p>
                <p style={{ fontSize: '0.84rem', color: '#0369A1', margin: 0 }}>
                  Bandingkan penjelasan ilmiah akhir Anda dengan hipotesis awal di atas berdasarkan hasil eksperimen simulasi.
                </p>
              </div>

              {poeScenario?.explanationPoe && (
                <div className="official-explanation-box">
                  <h4 className="official-title">Mekanisme Sains Resmi (Kurikulum Merdeka):</h4>
                  <div
                    className="official-content"
                    dangerouslySetInnerHTML={{ __html: poeScenario.explanationPoe }}
                  />
                </div>
              )}
            </>
          )}

          {/* Kolom Teks Penjelasan Siswa Sendiri (Dikirim ke Guru) */}
          <div className="student-input-card highlight">
            <div className="input-card-header">
              <FileEdit size={18} className="text-coral" />
              <div>
                <strong className="input-field-title">
                  Penjelasan Ilmiah Siswa (Wajib Dinilai Guru):
                </strong>
                <p className="input-field-hint">
                  Hubungkan hasil pengamatanmu dari simulasi dengan konsep <strong>Tumbukan Efektif</strong>, <strong>Energi Kinetik</strong>,{' '}
                  <strong>Energi Aktivasi (Ea)</strong>, atau <strong>Luas Bidang Sentuh</strong>. Mengapa fenomena laju reaksi tersebut dapat terjadi?
                </p>
              </div>
            </div>

            <textarea
              className="poe-textarea"
              rows={5}
              placeholder="Hubungkan hasil pengamatan simulasi dengan konsep Tumbukan Efektif, Energi Kinetik, Energi Aktivasi (Ea), atau Luas Bidang Sentuh. Mengapa fenomena laju reaksi tersebut dapat terjadi? (Minimal 20 karakter)..."
              value={explainText}
              onChange={(e) => setExplainText(e.target.value)}
              onBlur={() => handleSaveDraft()}
            />

            <div className="textarea-footer-info">
              <span>Minimal 20 karakter &bull; Terisi: {explainText.trim().length} karakter</span>
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

          {/* Baris Peringatan jika Gagal Sinkronisasi dengan Tombol Coba Lagi & Detail Error Inline */}
          {syncStatus === SYNC_STATUS.FAILED && (
            <div className="poe-sync-alert-banner" style={{ borderLeft: '4px solid #EF4444', background: '#FEF2F2' }}>
              <div className="alert-content">
                <AlertCircle size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                <div className="alert-text-block">
                  <strong style={{ color: '#991B1B' }}>Sinkronisasi ke Cloud Belum Berhasil</strong>
                  <p style={{ color: '#7F1D1D', margin: '4px 0', fontSize: '0.86rem' }}>
                    Jawaban Anda tetap <strong>aman tersimpan di perangkat lokal</strong> ini dan modul sudah tercatat selesai.
                  </p>
                  {syncErrorMessage && (
                    <div style={{
                      marginTop: '6px',
                      padding: '8px 12px',
                      background: '#FEE2E2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      color: '#991B1B',
                      wordBreak: 'break-word'
                    }}>
                      <strong>Detail Error:</strong> {syncErrorMessage}
                    </div>
                  )}
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
