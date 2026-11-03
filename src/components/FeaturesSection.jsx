import React from 'react'
import { Atom, ShieldCheck, Sparkles, Layers, Flame, BookCheck } from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section id="keunggulan" className="features-section">
      <div className="features-header">
        <div className="section-badge">
          <Sparkles size={14} />
          <span>Keunggulan Pedagogis KimiaKu</span>
        </div>
        <h2 className="features-title">Mengapa Belajar Laju Reaksi di KimiaKu?</h2>
        <p className="features-desc">
          Dirancang khusus untuk siswa SMA kelas XI Fase F agar materi laju reaksi yang abstrak dapat dipahami secara
          menyeluruh dari level sub-mikroskopis hingga makroskopis.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-wrapper emerald">
            <Atom size={22} />
          </div>
          <h3 className="feature-card-title">Sintaks POE (Predict-Observe-Explain)</h3>
          <p className="feature-card-text">
            Siswa tidak sekadar membaca teori. Anda diajak membuat dugaan awal (Predict), mengamati simulasi dinamis
            (Observe), dan mencocokkan hasil eksperimen dengan mekanisme ilmiah (Explain).
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper amber">
            <Flame size={22} />
          </div>
          <h3 className="feature-card-title">Visualisasi Partikulat & Tumbukan</h3>
          <p className="feature-card-text">
            Lihat langsung bagaimana partikel bereaksi: orientasi sudut yang pas, pengaruh energi kinetik terhadap
            puncak Energi Aktivasi (E<sub>a</sub>), dan peran katalis menurunkan rintangan energi.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper indigo">
            <Layers size={22} />
          </div>
          <h3 className="feature-card-title">Jembatan Makroskopis ke Mikroskopis</h3>
          <p className="feature-card-text">
            Hubungkan fenomena nyata sehari-hari (gelembung gas CO<sub>2</sub>, tablet effervescent, pembusukan makanan di kulkas)
            dengan perilaku partikel mikroskopis.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper cyan">
            <BookCheck size={22} />
          </div>
          <h3 className="feature-card-title">Kuis dengan Umpan Balik Ilmiah</h3>
          <p className="feature-card-text">
            Setiap jawaban yang Anda pilih langsung disertai penjelasan komprehensif mengenai konsep kinetika kimia,
            membantu meluruskan miskonsepsi secara instan.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper purple">
            <ShieldCheck size={22} />
          </div>
          <h3 className="feature-card-title">100% Anonim & Tanpa Beban Akun</h3>
          <p className="feature-card-text">
            Bebas dari pendaftaran email atau kata sandi. Progres modul dan perolehan skor kuis otomatis tersimpan aman di
            perangkat peramban Anda.
          </p>
        </div>
      </div>
    </section>
  )
}

