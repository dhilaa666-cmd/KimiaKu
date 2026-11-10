import React from 'react'
import { BookOpen, ExternalLink, Bookmark, Sparkles, GraduationCap, Atom, Layers } from 'lucide-react'

const REFERENSI_ITEMS = [
  {
    id: 'buku-kemdikbud',
    kategori: 'Buku Teks Resmi',
    judul: 'Kimia untuk SMA/MA Kelas XI (Fase F)',
    penulis: 'Ayuk Ratna Puspaningsih, Elizabeth Tjahjadarmawan, & Niken Resminingpuri',
    penerbit: 'Pusat Perbukuan, Kemendikbudristek RI (2022)',
    deskripsi:
      'Materi Bab 3 Kinetika Kimia: Konsep laju reaksi, pengaruh konsentrasi, luas permukaan, suhu sistem, dan katalis terhadap kecepatan reaksi kimia.',
    icon: BookOpen,
    badgeColor: 'teal',
    tautan: 'https://buku.kemdikbud.go.id'
  },
  {
    id: 'teori-tumbukan',
    kategori: 'Landasan Teori Ilmiah',
    judul: 'Collision Theory & Transition State Model',
    penulis: 'Max Trautz (1916) & William Lewis (1918) / Henry Eyring (1935)',
    penerbit: 'Journal of the Chemical Society / Chemical Reviews',
    deskripsi:
      'Persamaan Arrhenius k = A · e^(-Ea/RT), hubungan energi kinetik partikel Maxwell-Boltzmann dengan ambang energi aktivasi (Ea), dan syarat orientasi tumbukan efektif.',
    icon: Atom,
    badgeColor: 'amber',
    tautan: 'https://goldbook.iupac.org'
  },
  {
    id: 'phet-simulation',
    kategori: 'Simulasi Partikulat',
    judul: 'PhET Interactive Simulations: Reactions & Rates',
    penulis: 'University of Colorado Boulder',
    penerbit: 'PhET Project',
    deskripsi:
      'Visualisasi komputasi tumbukan atom dan molekul dalam ruang reaksi mikro, kurva energi potensial reaksi eksotermik/endotermik, serta peran kompleks teraktivasi.',
    icon: Layers,
    badgeColor: 'indigo',
    tautan: 'https://phet.colorado.edu'
  },
  {
    id: 'iupac-standard',
    kategori: 'Standar Notasi Baku',
    judul: 'IUPAC Compendium of Chemical Terminology (Gold Book)',
    penulis: 'International Union of Pure and Applied Chemistry',
    penerbit: 'IUPAC Standards (Edisi Resmi)',
    deskripsi:
      'Kaidah baku penulisan notasi rumus kimia, hukum laju reaksi r = k[A]^m[B]^n, subskrip spesi larutan (aq, s, l, g), dan penetapan satuan kinetika laju reaksi.',
    icon: GraduationCap,
    badgeColor: 'coral',
    tautan: 'https://iupac.org'
  }
]

export default function ReferensiSection() {
  return (
    <section className="referensi-section" id="referensi-pustaka">
      <div className="referensi-header">
        <div className="referensi-badge">
          <Bookmark size={15} />
          <span>Pustaka & Referensi Ilmiah</span>
        </div>
        <h2 className="referensi-title">Referensi & Sumber Belajar</h2>
        <p className="referensi-subtitle">
          Semua materi, notasi rumus kimia, dan sintaks POE di KimiaKu disusun mengacu pada kurikulum resmi dan literatur sains terverifikasi.
        </p>
      </div>

      <div className="referensi-grid">
        {REFERENSI_ITEMS.map((item) => {
          const IconComponent = item.icon
          return (
            <div key={item.id} className="referensi-card">
              <div className="referensi-card-top">
                <div className={`referensi-icon-wrap ${item.badgeColor}`}>
                  <IconComponent size={20} />
                </div>
                <span className={`referensi-category-pill ${item.badgeColor}`}>
                  {item.kategori}
                </span>
              </div>

              <div className="referensi-card-body">
                <h3 className="referensi-item-title">{item.judul}</h3>
                <div className="referensi-item-meta">
                  <span className="referensi-penulis">{item.penulis}</span>
                  <span className="referensi-penerbit">{item.penerbit}</span>
                </div>
                <p className="referensi-item-desc">{item.deskripsi}</p>
              </div>

              <div className="referensi-card-footer">
                <a
                  href={item.tautan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="referensi-link-btn"
                  title={`Buka rujukan ${item.judul}`}
                >
                  <span>Kunjungi Sumber Rujukan</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Box Catatan Pedagogis POE */}
      <div className="referensi-poe-note">
        <Sparkles size={20} className="poe-note-icon text-coral" />
        <div className="poe-note-text">
          <strong>Penerapan Pedagogis Sintaks POE (White & Gunstone, 1992):</strong>
          <p>
            Pendekatan Predict-Observe-Explain dirancang khusus untuk mengatasi miskonsepsi siswa SMA pada konsep abstrak laju reaksi, menghubungkan level makroskopis (fenomena teramati) dengan level sub-mikroskopis (tumbukan partikel).
          </p>
        </div>
      </div>
    </section>
  )
}

