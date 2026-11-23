import React, { useState, useEffect } from 'react'
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
  ShieldAlert,
  RotateCw,
  Cloud,
  Database
} from 'lucide-react'
import {
  fetchClassQuizSubmissions,
  fetchClassPoeSubmissions,
  getStudentIdentity,
  SYNC_STATUS
} from '../utils/storage.js'
import { kuisDiagnostik } from '../data/lajuReaksiData'
import { MODULES_DATA } from '../data/modulesData'
import { checkIsTeacher } from '../lib/authConfig'

export { getStudentIdentity }

export default function PanelGuru({ onBackToDashboard, currentUser, isGuest }) {
  const [activeTab, setActiveTab] = useState('quiz') // 'quiz' | 'poe'
  const [quizList, setQuizList] = useState([])
  const [poeList, setPoeList] = useState([])
  const [dataSource, setDataSource] = useState('local') // 'cloud' | 'local'
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuizAttemptId, setSelectedQuizAttemptId] = useState(null)
  const [selectedPoeIndex, setSelectedPoeIndex] = useState(0)

  const isTeacher = checkIsTeacher(currentUser)

  // Memuat data rekaman kelas dari Firestore (dengan fallback ke penyimpanan lokal) (Temuan 03-06)
  const loadClassSubmissions = async () => {
    setIsLoading(true)
    try {
      const [quizRes, poeRes] = await Promise.all([
        fetchClassQuizSubmissions(),
        fetchClassPoeSubmissions()
      ])

      const qSubmissions = quizRes?.submissions || []
      const pSubmissions = poeRes?.submissions || []

      setQuizList(qSubmissions)
      setPoeList(pSubmissions)
      setDataSource(quizRes?.source === 'cloud' || poeRes?.source === 'cloud' ? 'cloud' : 'local')

      if (qSubmissions.length > 0 && !selectedQuizAttemptId) {
        setSelectedQuizAttemptId(qSubmissions[0].id)
      }
    } catch (err) {
      console.warn('Gagal memuat rekaman kelas pada Panel Guru:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isTeacher) {
      loadClassSubmissions()
    }
  }, [isTeacher])

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

  // Hitung statistik kelas
  const submittedQuizzes = quizList.filter((q) => q && (q.isSubmitted || typeof q.score === 'number'))
  const submittedPoeList = poeList.filter(
    (p) => p && (p.isSubmitted || Boolean(p.predictText) || Boolean(p.explainText))
  )

  const avgScore =
    submittedQuizzes.length > 0
      ? Math.round(
          submittedQuizzes.reduce((acc, curr) => acc + (typeof curr.score === 'number' ? curr.score : 0), 0) /
            submittedQuizzes.length
        )
      : null

  const selectedAttempt =
    quizList.find((q) => q.id === selectedQuizAttemptId) || quizList[0] || null

  const currentPoeRecord = poeList[selectedPoeIndex] || poeList[0] || null
  const currentModuleInfo = MODULES_DATA.find(
    (m) => m.id === (currentPoeRecord?.moduleId || 'faktor-laju')
  )

  return (
    <div className="panel-guru-container">
      {/* Top Header Bar */}
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

        <div className="topbar-right-cluster">
          <div className={`guru-source-pill ${dataSource === 'cloud' ? 'cloud' : 'local'}`}>
            {dataSource === 'cloud' ? (
              <>
                <Cloud size={14} className="text-emerald" />
                <span>Data Cloud Firestore (Kelas)</span>
              </>
            ) : (
              <>
                <Database size={14} className="text-amber" />
                <span>Penyimpanan Lokal (Fallback)</span>
              </>
            )}
          </div>

          <button
            type="button"
            className="btn-guru-refresh"
            onClick={loadClassSubmissions}
            disabled={isLoading}
            title="Muat ulang hasil kiriman siswa"
          >
            <RotateCw size={14} className={isLoading ? 'spin' : ''} />
            <span>{isLoading ? 'Memuat...' : 'Segarkan Data'}</span>
          </button>

          <div className="panel-guru-badge">
            <GraduationCap size={16} />
            <span>Panel Evaluasi Guru • Kimia Fase F</span>
          </div>
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
            Pantau dan periksa pemahaman siswa: mulai dari skor kuis diagnostik hingga penalaran ilmiah tertulis pada tahapan <strong>Predict</strong>, <strong>Observe</strong>, dan <strong>Explain</strong>.
          </p>
        </div>

        <div className="guru-hero-stats">
          <div className="guru-stat-box">
            <span className="stat-num">{submittedQuizzes.length}</span>
            <span className="stat-label">Kuis Masuk</span>
          </div>
          <div className="guru-stat-box">
            <span className="stat-num">{submittedPoeList.length}</span>
            <span className="stat-label">Tugas POE Masuk</span>
          </div>
          <div className="guru-stat-box">
            <span className="stat-num">{avgScore !== null ? `${avgScore}%` : '-'}</span>
            <span className="stat-label">Rata-rata Skor Kuis</span>
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
          <span>1. Hasil Kuis Diagnostik ({submittedQuizzes.length})</span>
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
            <span className="header-tag">
              {submittedQuizzes.length} Rekaman Ditemukan
            </span>
          </div>

          {submittedQuizzes.length > 0 ? (
            <div className="table-responsive-wrap">
              <table className="guru-submissions-table">
                <thead>
                  <tr>
                    <th>Nama / Identitas Siswa</th>
                    <th>ID Percobaan</th>
                    <th>Aktivitas</th>
                    <th>Versi</th>
                    <th>Skor</th>
                    <th>Waktu Pengerjaan</th>
                    <th>Status Server</th>
                    <th>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedQuizzes.map((quiz) => {
                    const student = getStudentIdentity(quiz)
                    const isSelected = selectedAttempt?.id === quiz.id

                    return (
                      <tr
                        key={quiz.id}
                        className={`submission-row ${isSelected ? 'selected-row' : ''}`}
                      >
                        <td>
                          <div className="student-profile-cell">
                            <div className="student-avatar-initial">
                              {student.name[0] ? student.name[0].toUpperCase() : 'S'}
                            </div>
                            <div className="student-info-col">
                              <strong>{student.name}</strong>
                              <small>{student.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code className="attempt-code">{quiz.id}</code>
                        </td>
                        <td>
                          <span className="activity-pill">Faktor Laju Reaksi</span>
                        </td>
                        <td>
                          <span className="version-pill">{quiz.questionVersion || 'v1'}</span>
                        </td>
                        <td>
                          <span
                            className={`score-pill ${
                              typeof quiz.score === 'number' && quiz.score >= 60 ? 'pass' : 'fail'
                            }`}
                          >
                            {typeof quiz.score === 'number' ? `${quiz.score}%` : '-'}
                          </span>
                        </td>
                        <td>
                          <div className="time-cell">
                            <Clock size={13} />
                            <span>
                              {quiz.completedAt
                                ? new Date(quiz.completedAt).toLocaleString('id-ID', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })
                                : '-'}{' '}
                              WIB
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`sync-indicator-pill ${
                              quiz.isFromCloud
                                ? 'terkirim'
                                : (quiz.syncStatus || 'lokal').toLowerCase().replace(/\s+/g, '-')
                            }`}
                          >
                            {quiz.isFromCloud ? 'Terkirim (Cloud)' : (quiz.syncStatus || 'Lokal')}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn-open-detail ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedQuizAttemptId(quiz.id)}
                          >
                            {isSelected ? 'Sedang Ditinjau' : 'Buka Rincian'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="guru-empty-state">
              <HelpCircle size={40} className="empty-icon text-muted" />
              <h3>Belum Ada Hasil Kuis yang Diserahkan</h3>
              <p>
                Siswa belum menyelesaikan atau mengirimkan kuis diagnostik. Hasil kuis yang dikerjakan siswa akan otomatis tercatat di panel ini beserta rincian analisis per butir soal.
              </p>
            </div>
          )}

          {/* Rincian Jawaban Per Butir Soal untuk Siswa Terpilih */}
          {selectedAttempt && (
            <div className="guru-quiz-detail-section">
              <div className="card-section-header">
                <div className="header-title-row">
                  <Award size={18} className="text-coral" />
                  <h3 className="section-title">
                    Rincian Analisis Jawaban Siswa: {getStudentIdentity(selectedAttempt).name} (
                    {typeof selectedAttempt.score === 'number' ? `${selectedAttempt.score}%` : 'Belum selesai'}
                    )
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
                            {studentChoice !== undefined && studentChoice !== null
                              ? `Opsi ${studentChoice}`
                              : 'Tidak Dijawab'}
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
                Siswa belum mengirimkan jawaban di formulir Predict – Observe – Explain. Saat siswa menyelesaikan tugas POE dan mengirimkannya, hasil analisis tertulisnya akan langsung tampil di sini.
              </p>
            </div>
          ) : (
            <div className="guru-poe-view-layout">
              {/* Kolom Kiri: Pemilih Tugas Siswa */}
              <div className="poe-submissions-sidebar">
                <span className="sidebar-list-label">Daftar Kiriman Tugas POE Siswa:</span>
                {submittedPoeList.map((sub, idx) => {
                  const student = getStudentIdentity(sub)
                  const isCurrent = idx === selectedPoeIndex
                  const modInfo = MODULES_DATA.find((m) => m.id === sub.moduleId)

                  return (
                    <button
                      key={`${sub.ownerId || 'guest'}_${sub.moduleId || idx}_${idx}`}
                      type="button"
                      className={`poe-mod-selector-btn ${isCurrent ? 'active' : ''} submitted`}
                      onClick={() => setSelectedPoeIndex(idx)}
                    >
                      <div className="selector-icon-col">
                        <CheckCheck size={16} className="text-emerald" />
                      </div>
                      <div className="selector-info-col">
                        <strong className="selector-mod-title">{student.name}</strong>
                        <small className="selector-mod-sub">{modInfo?.title || sub.moduleId}</small>
                        <small className="selector-status">
                          {sub.isFromCloud ? 'Cloud' : (sub.syncStatus || 'Lokal')}
                        </small>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Kolom Kanan: Rincian 3 Langkah POE Siswa Terpilih */}
              <div className="poe-submission-detail-pane">
                {currentPoeRecord ? (
                  <div className="poe-review-card">
                    <div className="review-card-header">
                      <div>
                        <span className="review-badge-modul">
                          {currentModuleInfo?.badge || 'Modul'}: {currentModuleInfo?.title}
                        </span>
                        <h3 className="review-student-name">
                          Penyerahan Tugas oleh: <strong>{getStudentIdentity(currentPoeRecord).name}</strong>
                        </h3>
                        <small className="review-meta-time">
                          Akun: <strong>{getStudentIdentity(currentPoeRecord).email}</strong> • Waktu Kirim:{' '}
                          {currentPoeRecord.submittedAt
                            ? new Date(currentPoeRecord.submittedAt).toLocaleString('id-ID')
                            : 'Draf Lokal'} • Status:{' '}
                          <strong>
                            {currentPoeRecord.isFromCloud
                              ? 'Terkirim (Cloud)'
                              : (currentPoeRecord.syncStatus || 'Lokal')}
                          </strong>
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
                        <strong>Catatan Umpan Balik Evaluasi Guru:</strong>
                      </div>
                      <p className="feedback-hint">
                        Periksa penalaran ilmiah siswa terhadap Teori Tumbukan, Luas Permukaan Bidang Sentuh, Konsentrasi, Suhu, dan Katalis berdasarkan kriteria rubrik penilaian kurikulum.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="poe-no-data-box">
                    <p>Pilih siswa pada daftar di sebelah kiri untuk melihat rincian jawaban tugas POE.</p>
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
