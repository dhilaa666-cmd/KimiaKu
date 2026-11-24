import React, { useState } from 'react'
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Award,
  Sparkles,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  X,
  History,
  Clock
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { kuisDiagnostik } from '../data/lajuReaksiData'
import {
  getQuizStore,
  saveDraftAnswers,
  saveQuizResult,
  resetQuizStore,
  getQuizHistory,
  GUEST_USER_ID
} from '../lib/localStore'
import { auth } from '../lib/firebase'
import { syncQuizToFirestore } from '../utils/storage'

export default function KuisLajuReaksi({ onBack, onCompleteScore, currentUser = null, isGuest = false }) {
  const soalList = kuisDiagnostik || []

  // Temuan 03-02: Isolasi penyimpanan kuis per UID aktif
  const currentUid = currentUser?.uid || auth?.currentUser?.uid || GUEST_USER_ID

  // Inisialisasi state awal langsung dari localStorage terisolasi UID akun aktif
  const [answers, setAnswers] = useState(() => getQuizStore(currentUid)?.answers || {})
  const [isSubmitted, setIsSubmitted] = useState(() => Boolean(getQuizStore(currentUid)?.isSubmitted))
  const [score, setScore] = useState(() => {
    const s = getQuizStore(currentUid)?.score
    return typeof s === 'number' ? s : null
  })
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [storageWarning, setStorageWarning] = useState(null)
  const [quizHistory, setQuizHistory] = useState(() => getQuizHistory(currentUid))
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // Temuan 03-02: Reload data kuis saat akun berubah (Akun A logout -> Akun B login)
  // Memastikan Akun B tidak melihat jawaban atau skor milik Akun A
  React.useEffect(() => {
    const uid = currentUser?.uid || auth?.currentUser?.uid || GUEST_USER_ID
    const userStore = getQuizStore(uid)
    setAnswers(userStore?.answers || {})
    setIsSubmitted(Boolean(userStore?.isSubmitted))
    setScore(typeof userStore?.score === 'number' ? userStore.score : null)
    setQuizHistory(getQuizHistory(uid))
    setStorageWarning(null)
  }, [currentUser?.uid, isGuest])

  // Handler memilih opsi jawaban
  const handleSelectOption = (soalId, optionKey) => {
    if (isSubmitted) return // Kuis sudah disubmit, tidak bisa mengubah jawaban

    // Temuan 03-09: Pertahankan jawaban di state memori sementara aplikasi
    const updated = {
      ...answers,
      [soalId]: optionKey
    }
    setAnswers(updated)

    // Simpan draf ke localStorage ke slot UID akun aktif (Temuan 03-02 & 03-09)
    const uid = currentUser?.uid || auth?.currentUser?.uid || GUEST_USER_ID
    const saveStatus = saveDraftAnswers(updated, uid)
    if (saveStatus && saveStatus.success === false) {
      setStorageWarning(
        saveStatus.isQuotaExceeded
          ? 'Memori penyimpanan peramban (localStorage) penuh. Jawaban Anda saat ini tetap aman di memori sementara kuis, tetapi belum tersimpan permanen. Jangan muat ulang atau tutup peramban.'
          : 'Penyimpanan lokal peramban gagal diakses. Jawaban saat ini hanya tersimpan di memori sementara kuis.'
      )
    } else {
      setStorageWarning(null)
    }
  }

  // Handler submit kuis
  const handleSubmitQuiz = () => {
    // Hitung skor
    let correctCount = 0
    soalList.forEach((soal) => {
      if (answers[soal.id] === soal.jawabanBenar) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / soalList.length) * 100)
    setScore(finalScore)
    setIsSubmitted(true)
    setShowConfirmSubmit(false)

    // Temuan 03-02 & 03-09: Simpan ke localStorage dengan isolasi UID
    const uid = currentUser?.uid || auth?.currentUser?.uid || GUEST_USER_ID
    const saved = saveQuizResult({ answers, score: finalScore }, uid)
    if (saved && saved.success === false) {
      setStorageWarning(
        saved.isQuotaExceeded
          ? 'Memori penyimpanan lokal penuh (QuotaExceeded). Skor kuis Anda tampil di layar ini, tetapi tidak dapat disimpan permanen di riwayat peramban.'
          : 'Gagal menyimpan hasil kuis ke penyimpanan lokal. Skor kuis saat ini hanya ada di memori aktif layar.'
      )
    } else {
      setStorageWarning(null)
    }

    // Perbarui daftar riwayat percobaan kuis (Temuan 03-04)
    setQuizHistory(getQuizHistory(uid))

    // Sinkronkan ke Firestore jika siswa sudah login Google (Idempoten)
    const activeAuthUser = currentUser || auth?.currentUser
    if (activeAuthUser) {
      syncQuizToFirestore(activeAuthUser, saved).catch((err) => {
        console.warn('Gagal sinkronisasi otomatis kuis:', err)
      })
    }

    // Panggil callback skor jika ada
    if (onCompleteScore) {
      onCompleteScore(finalScore)
    }

    // Tembakkan konfeti jika skor memuaskan (>= 60)
    if (finalScore >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch (err) {
        console.warn('Confetti error:', err)
      }
    }

    // Scroll ke bagian atas untuk melihat skor
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handler reset kuis dengan pengarsipan riwayat (Temuan 03-04)
  const handleResetQuiz = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengatur ulang kuis? Hasil pengerjaan ini akan disimpan ke riwayat skor dan Anda akan memulai sesi kuis baru.'
      )
    ) {
      const uid = currentUser?.uid || auth?.currentUser?.uid || GUEST_USER_ID
      const res = resetQuizStore(uid)
      setAnswers({})
      setIsSubmitted(false)
      setScore(null)
      setShowConfirmSubmit(false)
      setQuizHistory(res?.history || getQuizHistory(uid))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Menghitung berapa soal yang telah dijawab
  const totalAnswered = Object.keys(answers).length
  const totalQuestions = soalList.length

  // Helper render notasi kimia dengan subskrip/superskrip
  const formatChemicalText = (text) => {
    if (!text) return ''
    return text
  }

  return (
    <div className="kuis-laju-container">
      {/* Header Bar Kuis */}
      <div className="kuis-top-bar">
        {onBack && (
          <button
            type="button"
            className="btn-back-home"
            onClick={onBack}
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={18} />
            <span>Kembali ke Beranda</span>
          </button>
        )}

        <div className="kuis-status-badge">
          <HelpCircle size={16} className="text-coral" />
          <span>Kuis Evaluasi Bab 3 • 10 Soal Laju Reaksi</span>
        </div>

        <div className="kuis-top-actions">
          <button
            type="button"
            className="btn-history-kuis-top"
            onClick={() => setShowHistoryModal(true)}
            title="Lihat riwayat percobaan kuis sebelumnya"
          >
            <History size={14} />
            <span>Riwayat Skor ({quizHistory.length})</span>
          </button>

          <button
            type="button"
            className="btn-reset-kuis-top"
            onClick={handleResetQuiz}
            title="Atur ulang kuis dan simpan hasil sebelumnya ke riwayat"
          >
            <RotateCcw size={14} />
            <span>Reset Kuis</span>
          </button>
        </div>
      </div>

      {/* Peringatan Kegagalan Penyimpanan Lokal (Temuan 03-09) */}
      {storageWarning && (
        <div className="kuis-storage-warning-banner" role="alert">
          <div className="warning-icon-wrap">
            <AlertTriangle size={20} className="warning-icon text-amber" />
          </div>
          <div className="warning-text-content">
            <strong className="warning-title">Penyimpanan Permanen Belum Berhasil</strong>
            <p className="warning-desc">{storageWarning}</p>
            <span className="warning-note">
              ✓ Jawaban Anda saat ini tetap tersimpan di memori aktif kuis.
            </span>
          </div>
          <button
            type="button"
            className="btn-dismiss-warning"
            onClick={() => setStorageWarning(null)}
            title="Tutup pesan peringatan"
            aria-label="Tutup pesan peringatan"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Banner / Card Skor Akhir jika sudah disubmit */}
      {isSubmitted && score !== null && (
        <div className="kuis-score-banner">
          <div className="score-badge-circle">
            <Award size={36} className="award-icon" />
            <div className="score-val">{score}</div>
            <div className="score-max">/ 100</div>
          </div>

          <div className="score-feedback-info">
            <div className="score-tagline">
              <Sparkles size={16} />
              <span>
                {score >= 80
                  ? 'Pemahaman Sangat Baik!'
                  : score >= 60
                  ? 'Pemahaman Cukup Baik!'
                  : 'Perlu Pendalaman Materi Lebih Lanjut'}
              </span>
            </div>
            <h3 className="score-title">
              Hasil Kuis Evaluasi Anda: {score}%
            </h3>
            <p className="score-desc">
              Tersimpan aman di peramban Anda (Local First:{' '}
              <code>kimiaku:laju-reaksi:v1</code>). Pelajari pembahasan ilmiah di setiap soal di bawah ini untuk menguatkan konsep faktor laju reaksi dan teori tumbukan.
            </p>

            <div className="score-cta-row">
              <button
                type="button"
                className="btn-restart-action"
                onClick={handleResetQuiz}
              >
                <RotateCcw size={15} />
                <span>Ulangi Kuis</span>
              </button>
              {onBack && (
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={onBack}
                >
                  <BookOpen size={15} />
                  <span>Pelajari Ulang Materi Modul 1</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Progres Pengerjaan jika belum disubmit */}
      {!isSubmitted && (
        <div className="kuis-progress-banner">
          <div className="progress-info-text">
            <strong>Progres Pengerjaan:</strong> {totalAnswered} dari {totalQuestions} soal terjawab
          </div>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill-kuis"
              style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Daftar 10 Soal Kuis Evaluasi */}
      <div className="soal-list-wrapper">
        {soalList.map((soal, idx) => {
          const selectedAnswer = answers[soal.id]
          const isCorrect = selectedAnswer === soal.jawabanBenar
          const optionLetters = ['A', 'B', 'C', 'D', 'E']

          return (
            <div
              key={soal.id}
              className={`soal-card ${
                isSubmitted
                  ? isCorrect
                    ? 'card-correct'
                    : 'card-incorrect'
                  : ''
              }`}
            >
              <div className="soal-card-header">
                <div className="soal-number-pill">
                  <span>Nomor {idx + 1}</span>
                  <span className="soal-tag-faktor">{soal.faktor}</span>
                </div>

                {isSubmitted && (
                  <div
                    className={`status-result-pill ${
                      isCorrect ? 'status-correct' : 'status-incorrect'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Jawaban Benar (+{Math.round(100 / (soalList.length || 10))} Poin)</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Jawaban Salah (0 Poin)</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Teks Pertanyaan */}
              <p className="soal-pertanyaan-text">
                {formatChemicalText(soal.pertanyaan)}
              </p>

              {/* Pilihan Ganda (A, B, C, D) */}
              <div className="opsi-list-grid">
                {soal.opsi.map((opsiTeks, optIdx) => {
                  const letter = optionLetters[optIdx]
                  const isThisSelected = selectedAnswer === letter
                  const isThisCorrectAnswer = soal.jawabanBenar === letter

                  let btnClass = 'opsi-item-btn'
                  if (isSubmitted) {
                    if (isThisCorrectAnswer) {
                      btnClass += ' is-correct-answer'
                    } else if (isThisSelected && !isCorrect) {
                      btnClass += ' is-wrong-selected'
                    } else {
                      btnClass += ' is-dimmed'
                    }
                  } else if (isThisSelected) {
                    btnClass += ' is-selected'
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      className={btnClass}
                      onClick={() => handleSelectOption(soal.id, letter)}
                      disabled={isSubmitted}
                    >
                      <div className="opsi-letter-box">{letter}</div>
                      <div className="opsi-content-text">
                        {formatChemicalText(opsiTeks)}
                      </div>
                      {isSubmitted && isThisCorrectAnswer && (
                        <CheckCircle2 size={18} className="opsi-status-icon text-emerald" />
                      )}
                      {isSubmitted && isThisSelected && !isThisCorrectAnswer && (
                        <XCircle size={18} className="opsi-status-icon text-red" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Pembahasan Ilmiah Detail (Muncul saat Kuis telah disubmit) */}
              {isSubmitted && (
                <div className="pembahasan-box">
                  <div className="pembahasan-header">
                    <BookOpen size={16} />
                    <span>Pembahasan Ilmiah:</span>
                  </div>
                  <div className="pembahasan-answer-key">
                    Kunci Jawaban: <strong>Opsi {soal.jawabanBenar}</strong>
                  </div>
                  <p className="pembahasan-text">
                    {formatChemicalText(soal.pembahasan)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bagian Bawah: Tombol Submit / Reset */}
      <div className="kuis-footer-actions">
        {!isSubmitted ? (
          <div className="submit-action-box">
            {totalAnswered < totalQuestions && (
              <p className="unanswered-warning">
                Catatan: Masih ada {totalQuestions - totalAnswered} soal yang belum Anda jawab. Anda tetap dapat mengirim kuis atau melengkapinya terlebih dahulu.
              </p>
            )}

            <button
              type="button"
              className="btn-submit-kuis"
              onClick={() => setShowConfirmSubmit(true)}
              disabled={totalAnswered === 0}
            >
              <Send size={18} />
              <span>Kirim Jawaban Kuis</span>
            </button>
          </div>
        ) : (
          <div className="completed-action-box">
            <button
              type="button"
              className="btn-history-kuis-bottom"
              onClick={() => setShowHistoryModal(true)}
            >
              <History size={16} />
              <span>Lihat Riwayat Skor ({quizHistory.length})</span>
            </button>

            <button
              type="button"
              className="btn-reset-kuis-bottom"
              onClick={handleResetQuiz}
            >
              <RotateCcw size={16} />
              <span>Atur Ulang / Kerjakan Kuis Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Riwayat Skor Percobaan Kuis Siswa (Temuan 03-04) */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div
            className="modal-content modal-history-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="history-modal-header">
              <div className="title-row">
                <History size={20} className="text-coral" />
                <h3 className="history-title">Riwayat Percobaan Kuis Siswa</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowHistoryModal(false)}
                title="Tutup riwayat"
              >
                <X size={18} />
              </button>
            </div>

            <p className="history-subtitle">
              Setiap kali Anda menekan "Reset Kuis" atau menyelesaikan kuis, hasil pengerjaan sebelumnya diarsipkan secara otomatis sehingga Anda dapat memantau peningkatan pemahaman materi kinetika kimia.
            </p>

            <div className="history-list-wrapper">
              {quizHistory.length === 0 ? (
                <div className="history-empty-state">
                  <BookOpen size={36} className="text-muted" />
                  <h4>Belum Ada Riwayat Percobaan</h4>
                  <p>Selesaikan kuis saat ini. Hasil Anda akan otomatis tersimpan dalam arsip riwayat ini.</p>
                </div>
              ) : (
                <div className="history-cards-list">
                  {quizHistory.map((item, index) => {
                    const attemptNum = quizHistory.length - index
                    const hasScore = typeof item.score === 'number'
                    const isPass = hasScore && item.score >= 60
                    const correctCount = Object.keys(item.answers || {}).filter(
                      (qId) => {
                        const s = soalList.find((soal) => soal.id === qId)
                        return s && item.answers[qId] === s.jawabanBenar
                      }
                    ).length

                    return (
                      <div key={item.id || index} className="history-item-card">
                        <div className="item-header-row">
                          <span className="attempt-badge">Percobaan #{attemptNum}</span>
                          <span className={`history-score-pill ${isPass ? 'pass' : 'fail'}`}>
                            {hasScore ? `${item.score}%` : 'Draf Belum Selesai'}
                          </span>
                        </div>

                        <div className="item-details-row">
                          <div className="item-detail">
                            <Clock size={13} className="text-muted" />
                            <span>
                              {item.completedAt || item.archivedAt
                                ? new Date(item.completedAt || item.archivedAt).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  })
                                : 'Waktu tidak tercatat'}{' '}
                              WIB
                            </span>
                          </div>

                          <div className="item-detail">
                            <CheckCircle2 size={13} className={isPass ? 'text-emerald' : 'text-muted'} />
                            <span>
                              {hasScore
                                ? `${correctCount} dari ${soalList.length} Soal Benar`
                                : `${Object.keys(item.answers || {}).length} Soal Dijawab`}
                            </span>
                          </div>
                        </div>

                        <div className="item-footer-code">
                          <code>ID: {item.id}</code>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="history-modal-footer">
              <button
                type="button"
                className="btn-history-close"
                onClick={() => setShowHistoryModal(false)}
              >
                Tutup Jendela Riwayat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pengiriman Kuis */}
      {showConfirmSubmit && (
        <div className="modal-overlay" onClick={() => setShowConfirmSubmit(false)}>
          <div
            className="modal-content modal-confirm-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="confirm-title">Konfirmasi Pengiriman Jawaban</h3>
            <p className="confirm-desc">
              Anda telah menjawab <strong>{totalAnswered}</strong> dari <strong>{totalQuestions}</strong> soal. Setelah dikirim, jawaban dan skor kuis akan disimpan ke <code>localStorage</code> dan pembahasan ilmiah akan ditampilkan.
            </p>

            <div className="confirm-actions-row">
              <button
                type="button"
                className="btn-cancel-confirm"
                onClick={() => setShowConfirmSubmit(false)}
              >
                Kembali Periksa
              </button>
              <button
                type="button"
                className="btn-confirm-submit"
                onClick={handleSubmitQuiz}
              >
                Ya, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
