import React, { useState } from 'react'
import {
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Award,
  FileText,
  Atom,
  Sparkles,
  CheckCheck,
  MessageSquare,
  ShieldAlert
} from 'lucide-react'
import { getStoredQuizData, getAllStoredPoeSubmissions } from '../utils/storage'
import { kuisDiagnostik } from '../data/lajuReaksiData'
import { MODULES_DATA } from '../data/modulesData'
import { checkIsTeacher } from '../lib/authConfig'

export default function PanelGuru({ onBackToDashboard, currentUser, isGuest }) {
  const [activeTab, setActiveTab] = useState('quiz') // 'quiz' | 'poe'
  const [quizData] = useState(() => getStoredQuizData())
  const [poeSubmissions] = useState(() => getAllStoredPoeSubmissions())
  const [selectedAttempt, setSelectedAttempt] = useState(() => {
    const data = getStoredQuizData()
    return data && data.isSubmitted ? data : null
  })
  const [selectedPoeModuleId, setSelectedPoeModuleId] = useState('faktor-laju')

  const studentName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    (isGuest ? 'Siswa Tamu (Lokal)' : 'Siswa Uji')
  const studentEmail = currentUser?.email || 'sesi-lokal@kimiaku.edu'

  const poeKeys = Object.keys(poeSubmissions)
  const submittedPoeList = poeKeys
    .map((k) => poeSubmissions[k])
    .filter((rec) => rec && (rec.isSubmitted || rec.predictText || rec.explainText))

  const currentPoeRecord =
    poeSubmissions[selectedPoeModuleId] ||
    submittedPoeList[0] ||
    null

  const currentModuleInfo = MODULES_DATA.find((m) => m.id === (currentPoeRecord?.moduleId || selectedPoeModuleId))

  const isTeacher = checkIsTeacher(currentUser)

  if (!isTeacher) {
    return (
      <div className="isolated-page-view access-denied-view">
        <div className="access-denied-card">
          <div className="access-denied-icon-wrap">
            <ShieldAlert size={36} color="#E11D48" />
          </div>
          <h2 className="access-denied-title">Akses Ditolak: Khusus Guru</h2>
          <p className="access-denied-desc">
            Halaman Panel Guru ini hanya dapat diakses oleh akun Guru resmi KimiaKu yang terdaftar.
          </p>
          <button
            type="button"
            className="btn-access-denied-back"
            onClick={onBackToDashboard}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-guru-container">
      {/* Top Header */}
      <div className="panel-guru-topbar">
        <button
          type="button"
          className="btn-back-dashboard"
          onClick={onBackToDashboard}
          title="Kembali ke Dashboard Beranda"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="panel-guru-badge">
          <GraduationCap size={16} />
          <span>Panel Evaluasi Guru (Aulia) • Pembelajaran Kimia Fase F</span>
        </div>
      </div>

      {/* Banner Ringkasan Guru */}
      <div className="panel-guru-hero-card">
        <div className="guru-hero-info">
          <div className="guru-role-pill">
            <Users size={14} />
            <span>Pemeriksaan Bukti Belajar Siswa Fase F</span>
          </div>
          <h1 className="guru-hero-title">Evaluasi Hasil Kuis & Tugas Sintaks POE</h1>
          <p className="guru-hero-desc">
            Pantau dan nilai pemahaman siswa secara komprehensif: mulai dari skor kuis diagnostik hingga penalaran ilmiah tertulis pada tahapan <strong>Predict</strong>, <strong>Observe</strong>, dan <strong>Explain</strong>.
          </p>
        </div>

        <div className="guru-hero-stats">
          <div className="guru-stat-box">
            <span className="stat-num">{quizData?.isSubmitted ? '1' : '0'}</span>
            <span className="stat-label">Kuis Selesai</span>
          </div>
          <div className="guru-stat-box">
            <span className="stat-num">{submittedPoeList.length}</span>
            <span className="stat-label">Tugas POE Masuk</span>
          </div>
          <div className="guru-stat-box">
            <span className="stat-num">{quizData?.score !== null ? `${quizData.score}%` : '-'}</span>
            <span className="stat-label">Skor Kuis Siswa</span>
          </div>
        </div>
      </div>

      {/* Tab Navigasi Panel Guru */}
      <div className="guru-section-tabs">
        <button
          type="button"
          className={`guru-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          <FileText size={16} />
          <span>1. Hasil Kuis Diagnostik (5 Soal)</span>
        </button>

        <button
          type="button"
          className={`guru-tab-btn ${activeTab === 'poe' ? 'active' : ''}`}
          onClick={() => setActiveTab('poe')}
        >
          <Atom size={16} />
          <span>2. Jawaban Sintaks POE Siswa ({submittedPoeList.length})</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: REKAPITULASI KUIS DIAGNOSTIK
          ======================================================== */}
      {activeTab === 'quiz' && (
        <div className="panel-guru-card-wrap">
          <div className="card-section-header">
            <div className="header-title-row">
              <FileText size={18} className="text-coral" />
              <h2 className="section-title">Daftar Hasil Kuis Diagnostik Siswa</h2>
            </div>
            <span className="header-tag">Versi Soal: {quizData?.questionVersion || 'v1'}</span>
          </div>

          {quizData?.isSubmitted ? (
            <div className="table-responsive-wrap">
              <table className="guru-submissions-table">
                <thead>
                  <tr>
                    <th>Nama / Alias Siswa</th>
                    <th>ID Percobaan</th>
                    <th>Aktivitas</th>
                    <th>Versi</th>
                    <th>Skor</th>
                    <th>Waktu Selesai</th>
                    <th>Status Server</th>
                    <th>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="submission-row">
                    <td>
                      <div className="student-profile-cell">
                        <div className="student-avatar-initial">
                          {studentName[0].toUpperCase()}
                        </div>
                        <div className="student-info-col">
                          <strong>{studentName}</strong>
                          <small>{studentEmail}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="attempt-code">{quizData.id}</code>
                    </td>
                    <td>
                      <span className="activity-pill">Faktor Laju Reaksi</span>
                    </td>
                    <td>
                      <span className="version-pill">v1</span>
                    </td>
                    <td>
                      <span className={`score-pill ${quizData.score >= 60 ? 'pass' : 'fail'}`}>
                        {quizData.score}%
                      </span>
                    </td>
                    <td>
                      <div className="time-cell">
                        <Clock size={13} />
                        <span>
                          {quizData.completedAt
                            ? new Date(quizData.completedAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}{' '}
                          WIB
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`sync-indicator-pill ${quizData.syncStatus?.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {quizData.syncStatus || 'Lokal'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-open-detail"
                        onClick={() => setSelectedAttempt(quizData)}
                      >
                        Buka Rincian
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="guru-empty-state">
              <HelpCircle size={40} className="empty-icon text-muted" />
              <h3>Belum Ada Hasil Kuis yang Diserahkan</h3>
              <p>
                Siswa belum menyelesaikan atau mengirimkan kuis diagnostik. Hasil kuis yang dikerjakan akan otomatis tercatat di panel ini beserta rincian analisis per butir.
              </p>
            </div>
          )}

          {/* Rincian Jawaban Per Butir Soal */}
          {selectedAttempt && selectedAttempt.isSubmitted && (
            <div className="guru-quiz-detail-section">
              <div className="card-section-header">
                <div className="header-title-row">
                  <Award size={18} className="text-coral" />
                  <h3 className="section-title">
                    Rincian Analisis Jawaban: {studentName} ({selectedAttempt.score}%)
                  </h3>
                </div>
                <span className="header-tag">ID: {selectedAttempt.id}</span>
              </div>

              <div className="guru-answers-grid">
                {kuisDiagnostik.map((soal, idx) => {
                  const studentChoice = selectedAttempt.answers?.[soal.id]
                  const isCorrect = studentChoice === soal.jawabanBenar

                  return (
                    <div
                      key={soal.id}
                      className={`guru-answer-item ${isCorrect ? 'correct' : 'incorrect'}`}
                    >
                      <div className="answer-item-header">
                        <span className="question-num-tag">
                          Nomor {idx + 1} • {soal.faktor}
                        </span>
                        <span className={`eval-badge ${isCorrect ? 'eval-pass' : 'eval-fail'}`}>
                          {isCorrect ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Benar (+20 Poin)</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              <span>Salah (0 Poin)</span>
                            </>
                          )}
                        </span>
                      </div>

                      <p className="question-excerpt">{soal.pertanyaan}</p>

                      <div className="answer-comparison-box">
                        <div className="comp-row">
                          <span>Pilihan Siswa:</span>
                          <strong className={isCorrect ? 'text-emerald' : 'text-red'}>
                            Opsi {studentChoice || 'Tidak Dijawab'}
                          </strong>
                        </div>
                        <div className="comp-row">
                          <span>Kunci Jawaban Baku:</span>
                          <strong>Opsi {soal.jawabanBenar}</strong>
                        </div>
                      </div>

                      <div className="guru-tindak-lanjut-box">
                        <strong>Catatan Guru & Konsep Kunci:</strong>
                        <p>{soal.pembahasan}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: JAWABAN SINTAKS POE SISWA (Predict - Observe - Explain)
          ======================================================== */}
      {activeTab === 'poe' && (
        <div className="panel-guru-card-wrap">
          <div className="card-section-header">
            <div className="header-title-row">
              <Atom size={18} className="text-coral" />
              <h2 className="section-title">Hasil Jawaban Sintaks POE Siswa</h2>
            </div>
            <span className="header-tag">Sintaks: Predict – Observe – Explain</span>
          </div>

          {submittedPoeList.length === 0 ? (
            <div className="guru-empty-state">
              <Sparkles size={40} className="empty-icon text-muted" />
              <h3>Belum Ada Tugas POE yang Dikirimkan</h3>
              <p>
                Siswa belum mengirimkan jawaban di formulir Predict – Observe – Explain pada halaman detail modul. Saat siswa menekan "Kirim Tugas POE ke Panel Guru", jawaban analisisnya akan langsung tampil di sini.
              </p>
            </div>
          ) : (
            <div className="guru-poe-view-layout">
              {/* Kolom Kiri: Pemilih Modul POE */}
              <div className="poe-submissions-sidebar">
                <span className="sidebar-list-label">Daftar Modul POE Siswa:</span>
                {MODULES_DATA.map((mod) => {
                  const sub = poeSubmissions[mod.id]
                  const hasSub = Boolean(sub && (sub.isSubmitted || sub.predictText))
                  const isCurrent = (currentPoeRecord?.moduleId || selectedPoeModuleId) === mod.id

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      className={`poe-mod-selector-btn ${isCurrent ? 'active' : ''} ${hasSub ? 'submitted' : ''}`}
                      onClick={() => setSelectedPoeModuleId(mod.id)}
                    >
                      <div className="selector-icon-col">
                        {hasSub ? (
                          <CheckCheck size={16} className="text-emerald" />
                        ) : (
                          <Clock size={16} className="text-muted" />
                        )}
                      </div>
                      <div className="selector-info-col">
                        <strong className="selector-mod-title">{mod.title}</strong>
                        <small className="selector-status">
                          {hasSub
                            ? `Terkirim (${sub.syncStatus || 'Lokal'})`
                            : 'Belum dikerjakan'}
                        </small>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Kolom Kanan: Rincian 3 Langkah POE Siswa */}
              <div className="poe-submission-detail-pane">
                {currentPoeRecord ? (
                  <div className="poe-review-card">
                    <div className="review-card-header">
                      <div>
                        <span className="review-badge-modul">
                          {currentModuleInfo?.badge || 'Modul'}: {currentModuleInfo?.title}
                        </span>
                        <h3 className="review-student-name">
                          Penyerahan Tugas oleh: <strong>{currentPoeRecord.alias || studentName}</strong>
                        </h3>
                        <small className="review-meta-time">
                          Waktu Kirim:{' '}
                          {currentPoeRecord.submittedAt
                            ? new Date(currentPoeRecord.submittedAt).toLocaleString('id-ID')
                            : 'Draf Lokal'} • Status Cloud: <strong>{currentPoeRecord.syncStatus}</strong>
                        </small>
                      </div>
                      <div className="review-score-stamp">
                        <CheckCircle2 size={16} className="text-emerald" />
                        <span>Terverifikasi</span>
                      </div>
                    </div>

                    {/* Step 1: Predict Review */}
                    <div className="poe-review-step-box predict">
                      <div className="review-step-header">
                        <span className="step-badge predict">1. PREDICT (Dugaan Awal)</span>
                      </div>
                      <div className="review-step-content">
                        <span className="content-label">Hipotesis Tertulis Siswa:</span>
                        <p className="student-written-text">
                          {currentPoeRecord.predictText || '<em>(Siswa tidak mengisi teks prediksi)</em>'}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Observe Review */}
                    <div className="poe-review-step-box observe">
                      <div className="review-step-header">
                        <span className="step-badge observe">2. OBSERVE (Catatan Pengamatan)</span>
                      </div>
                      <div className="review-step-content">
                        <span className="content-label">Hasil Observasi Simulasi/Video oleh Siswa:</span>
                        <p className="student-written-text">
                          {currentPoeRecord.observeNotes || '<em>(Siswa tidak mengisi catatan observasi)</em>'}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Explain Review */}
                    <div className="poe-review-step-box explain">
                      <div className="review-step-header">
                        <span className="step-badge explain">3. EXPLAIN (Penjelasan Ilmiah Siswa)</span>
                      </div>
                      <div className="review-step-content">
                        <span className="content-label">Penjelasan Mekanisme Ilmiah Siswa:</span>
                        <p className="student-written-text highlight">
                          {currentPoeRecord.explainText || '<em>(Siswa belum melengkapi penjelasan ilmiah)</em>'}
                        </p>
                      </div>
                    </div>

                    {/* Catatan Feedback Evaluasi Guru (Aulia) */}
                    <div className="guru-feedback-editor-box">
                      <div className="feedback-header">
                        <MessageSquare size={16} className="text-coral" />
                        <strong>Catatan Umpan Balik Guru (Aulia):</strong>
                      </div>
                      <p className="feedback-hint">
                        Penalaran ilmiah siswa menunjukkan kemampuan menghubungkan variabel manipulasi dengan Teori Tumbukan dan Energi Aktivasi secara runtut.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="poe-no-data-box">
                    <p>Pilih modul di sebelah kiri untuk melihat rincian jawaban POE siswa.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
