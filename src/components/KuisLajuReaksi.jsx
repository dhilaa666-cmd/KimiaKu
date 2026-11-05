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
  BookOpen
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { kuisDiagnostik } from '../data/lajuReaksiData'
import {
  getQuizStore,
  saveDraftAnswers,
  saveQuizResult,
  resetQuizStore
} from '../lib/localStore'

export default function KuisLajuReaksi({ onBack, onCompleteScore }) {
  const soalList = kuisDiagnostik || []

  // Inisialisasi state awal langsung dari localStorage (Local First)
  const [initialStore] = useState(() => getQuizStore())
  const [answers, setAnswers] = useState(() => initialStore?.answers || {})
  const [isSubmitted, setIsSubmitted] = useState(() => Boolean(initialStore?.isSubmitted))
  const [score, setScore] = useState(() => (typeof initialStore?.score === 'number' ? initialStore.score : null))
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  // Handler memilih opsi jawaban
  const handleSelectOption = (soalId, optionKey) => {
    if (isSubmitted) return // Kuis sudah disubmit, tidak bisa mengubah jawaban

    const updated = {
      ...answers,
      [soalId]: optionKey
    }
    setAnswers(updated)
    // Simpan draf ke localStorage secara otomatis
    saveDraftAnswers(updated)
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

    // Simpan ke localStorage sesuai kontrak DATABASE.md
    saveQuizResult({ answers, score: finalScore })

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

  // Handler reset kuis
  const handleResetQuiz = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang kuis dan mengulang dari awal?')) {
      resetQuizStore()
      setAnswers({})
      setIsSubmitted(false)
      setScore(null)
      setShowConfirmSubmit(false)
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
          <span>Kuis Diagnostik Bab 3 • 5 Soal Laju Reaksi</span>
        </div>

        <div className="kuis-top-actions">
          <button
            type="button"
            className="btn-reset-kuis-top"
            onClick={handleResetQuiz}
            title="Atur ulang kuis dan hapus data tersimpan"
          >
            <RotateCcw size={14} />
            <span>Reset Kuis</span>
          </button>
        </div>
      </div>

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
              Hasil Kuis Diagnostik Anda: {score}%
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

      {/* Daftar 5 Soal Kuis Diagnostik */}
      <div className="soal-list-wrapper">
        {soalList.map((soal, idx) => {
          const selectedAnswer = answers[soal.id]
          const isCorrect = selectedAnswer === soal.jawabanBenar
          const optionLetters = ['A', 'B', 'C', 'D']

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
                        <span>Jawaban Benar (+20 Poin)</span>
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
              className="btn-reset-kuis-bottom"
              onClick={handleResetQuiz}
            >
              <RotateCcw size={16} />
              <span>Atur Ulang / Kerjakan Kuis Baru</span>
            </button>
          </div>
        )}
      </div>

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
