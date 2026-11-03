import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  Check
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { QUIZ_DATA } from '../data/quizData'

export default function QuizModal({
  module,
  onSaveQuizScore,
  onClose
}) {
  const questions = QUIZ_DATA[module.id] || []
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { [idx]: selectedOptionIndex }
  const [isFinished, setIsFinished] = useState(false)

  const currentQ = questions[currentIdx]
  const currentAnswer = userAnswers[currentIdx]

  const handleSelectOption = (optIdx) => {
    if (userAnswers[currentIdx] !== undefined) return // already answered this question
    setUserAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }))
  }

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1)
    } else {
      // Calculate final score
      let correctCount = 0
      questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) {
          correctCount++
        }
      })
      const finalScore = Math.round((correctCount / questions.length) * 100)
      setIsFinished(true)

      // Trigger celebratory confetti if score is >= 60%
      if (finalScore >= 60) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          })
        } catch (e) {
          console.warn('Confetti error:', e)
        }
      }

      if (onSaveQuizScore) {
        onSaveQuizScore(module.id, finalScore)
      }
    }
  }

  const handleRestartQuiz = () => {
    setUserAnswers({})
    setCurrentIdx(0)
    setIsFinished(false)
  }

  // Calculate score if finished
  const correctTotal = questions.filter(
    (q, idx) => userAnswers[idx] === q.correctIndex
  ).length
  const calculatedPercent = Math.round((correctTotal / questions.length) * 100)

  return (
    <div className="quiz-container">
      {!isFinished ? (
        <div className="quiz-active-card">
          {/* Quiz Header Bar */}
          <div className="quiz-header-bar">
            <div className="quiz-meta-info">
              <span className="quiz-module-badge">{module.badge}</span>
              <h3 className="quiz-title">Kuis: {module.title}</h3>
            </div>
            <div className="quiz-progress-indicator">
              <span>Soal {currentIdx + 1} dari {questions.length}</span>
              <div className="quiz-mini-track">
                <div
                  className="quiz-mini-fill"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="quiz-question-box">
            <div className="question-number-pill">Soal #{currentIdx + 1}</div>
            <p className="question-text">{currentQ?.question}</p>
          </div>

          {/* Options List */}
          <div className="quiz-options-grid">
            {currentQ?.options.map((option, optIdx) => {
              const isSelected = currentAnswer === optIdx
              const isCorrect = currentQ.correctIndex === optIdx
              let optionClass = 'quiz-option-btn'

              if (currentAnswer !== undefined) {
                if (isCorrect) {
                  optionClass += ' correct'
                } else if (isSelected) {
                  optionClass += ' incorrect'
                } else {
                  optionClass += ' dimmed'
                }
              }

              const letters = ['A', 'B', 'C', 'D']

              return (
                <button
                  key={optIdx}
                  type="button"
                  className={optionClass}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={currentAnswer !== undefined}
                >
                  <span className="option-letter">{letters[optIdx]}</span>
                  <span className="option-text">{option}</span>
                  {currentAnswer !== undefined && isCorrect && (
                    <CheckCircle2 size={18} className="option-icon text-emerald" />
                  )}
                  {currentAnswer !== undefined && isSelected && !isCorrect && (
                    <XCircle size={18} className="option-icon text-red" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Immediate Scientific Feedback */}
          {currentAnswer !== undefined && (
            <div
              className={`quiz-feedback-box ${
                currentAnswer === currentQ.correctIndex ? 'feedback-success' : 'feedback-error'
              }`}
            >
              <div className="feedback-status-row">
                {currentAnswer === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 size={20} className="text-emerald" />
                    <strong>Jawaban Tepat!</strong>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="text-red" />
                    <strong>Jawaban Belum Tepat.</strong>
                  </>
                )}
              </div>
              <div className="feedback-explanation">
                <div className="exp-heading">Penjelasan Mekanisme Ilmiah:</div>
                <p>{currentQ.explanation}</p>
              </div>

              <div className="feedback-action-row">
                <button
                  type="button"
                  className="btn-next-question"
                  onClick={handleNextQuestion}
                >
                  <span>
                    {currentIdx + 1 < questions.length ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil Kuis'}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Summary */
        <div className="quiz-result-card">
          <div className="result-award-icon">
            <Award size={48} className="award-svg" />
          </div>

          <h3 className="result-title">Hasil Kuis: {module.title}</h3>
          <p className="result-subtitle">
            Kuis diselesaikan dengan jujur dan mandiri. Skor Anda tersimpan secara anonim.
          </p>

          <div className="score-display-ring">
            <span className="score-number">{calculatedPercent}%</span>
            <span className="score-count">
              {correctTotal} dari {questions.length} Soal Benar
            </span>
          </div>

          <div className="result-evaluation-box">
            {calculatedPercent >= 80 ? (
              <p className="eval-text high">
                <Sparkles size={16} />
                Luar biasa! Anda telah menguasai konsep dan mekanisme mikroskopis serta makroskopis laju reaksi dengan sangat mendalam.
              </p>
            ) : calculatedPercent >= 60 ? (
              <p className="eval-text medium">
                Kerja bagus! Pemahaman dasar Anda sudah terbentuk dengan baik. Pelajari kembali poin-poin penjelasan pada soal yang keliru untuk memperkuat konsep.
              </p>
            ) : (
              <p className="eval-text low">
                Tetap semangat! Anda dapat membaca ulang materi pembelajaran dan mencoba simulasi POE sekali lagi untuk memperjelas konsep abstrak.
              </p>
            )}
          </div>

          <div className="result-actions-row">
            <button
              type="button"
              className="btn-restart-quiz"
              onClick={handleRestartQuiz}
            >
              <RotateCcw size={16} />
              <span>Ulangi Kuis Modul Ini</span>
            </button>
            {onClose && (
              <button
                type="button"
                className="btn-finish-quiz"
                onClick={onClose}
              >
                <Check size={16} />
                <span>Selesai & Tutup Kuis</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
