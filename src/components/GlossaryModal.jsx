import React, { useState } from 'react'
import {
  BookOpen,
  Search,
  X,
  Sparkles
} from 'lucide-react'

const GLOSSARY_TERMS = [
  {
    id: 'tumbukan-efektif',
    term: 'Tumbukan Efektif',
    symbol: 'Z × f × p',
    category: 'Teori Tumbukan',
    definition:
      'Tumbukan antarmolekul atau partikel reaktan yang berhasil menghasilkan reaksi kimia karena memenuhi dua syarat mutlak: energi kinetik partikel melampaui Energi Aktivasi (E ≥ Ea) dan arah orientasi benturan spasial tepat.',
    example:
      'Molekul NO yang bertumbukan langsung pada atom O dari O₃ dengan energi cukup akan membentuk ikatan N−O baru (NO₂ + O₂).',
    color: 'amber'
  },
  {
    id: 'energi-aktivasi',
    term: 'Energi Aktivasi',
    symbol: 'Ea (kJ/mol)',
    category: 'Kinetika Kimia',
    definition:
      'Energi kinetik minimum yang wajib dimiliki oleh molekul pereaksi agar saat bertumbukan mampu mengatasi gaya tolak antarawan elektron dan mendaki keadaan transisi (kompleks teraktivasi).',
    example:
      'Korek api kayu yang digesekkan pada wadahnya menerima energi panas akibat gesekan untuk melampaui Ea reaksi fosfor.',
    color: 'coral'
  },
  {
    id: 'katalis',
    term: 'Katalis (Catalyst)',
    symbol: 'Katalisator',
    category: 'Faktor Laju',
    definition:
      'Zat yang mempercepat laju reaksi kimia dengan menyediakan jalur/mekanisme reaksi alternatif yang memiliki energi aktivasi (Ea) lebih rendah, tanpa dirinya ikut terkonsumsi secara permanen di akhir reaksi.',
    example:
      'Enzim amilase dalam saliva memecah karbohidrat seketika; MnO₂ mempercepat penguraian hidrogen peroksida (2H₂O₂ → 2H₂O + O₂).',
    color: 'emerald'
  },
  {
    id: 'orde-reaksi',
    term: 'Orde Reaksi',
    symbol: 'm, n (v = k[A]ᵐ[B]ⁿ)',
    category: 'Kinetika Kimia',
    definition:
      'Pangkat dari konsentrasi reaktan dalam persamaan laju reaksi yang diperoleh hanya melalui eksperimen. Menunjukkan seberapa sensitif laju reaksi terhadap kelipatan perubahan konsentrasi zat tersebut.',
    example:
      'Orde 1: jika konsentrasi dikali 2, laju menjadi 2 kali. Orde 2: jika konsentrasi dikali 2, laju melonjak 4 kali lipat (2²).',
    color: 'indigo'
  },
  {
    id: 'tetapan-laju',
    term: 'Tetapan Laju Reaksi',
    symbol: 'k',
    category: 'Kinetika Kimia',
    definition:
      'Konstanta kesebandingan antara laju reaksi dengan konsentrasi reaktan pada persamaan laju. Nilai k spesifik untuk setiap reaksi, bergantung pada temperatur sistem (Persamaan Arrhenius: k = A·e^(−Ea/RT)) dan katalis.',
    example:
      'Kenaikan suhu 10°C umumnya meningkatkan nilai tetapan k sekitar 2 hingga 3 kali lipat.',
    color: 'teal'
  },
  {
    id: 'kompleks-teraktivasi',
    term: 'Kompleks Teraktivasi (Transition State)',
    symbol: '‡ (Keadaan Transisi)',
    category: 'Teori Tumbukan',
    definition:
      'Spesi intermediet yang berada di puncak kurva profil energi potensial. Memiliki energi potensial maksimum, ikatan lama sedang meregang/melemah, dan ikatan baru mulai terbentuk secara parsial. Sangat tidak stabil dan berumur amat singkat (~10⁻¹³ detik).',
    example:
      'Struktur sementara [Cl···H···CH₃] saat ion klorida menyerang metil bromida.',
    color: 'coral'
  },
  {
    id: 'faktor-sterik',
    term: 'Faktor Orientasi (Steric Factor)',
    symbol: 'p',
    category: 'Teori Tumbukan',
    definition:
      'Peluang bahwa tumbukan antarmolekul terjadi pada sudut dan geometri ruang yang memungkinkan orbital molekul reaktan saling tumpang tindih untuk membentuk ikatan baru.',
    example:
      'Untuk molekul asimetris besar, faktor sterik p bernilai kecil karena hanya sebagian kecil permukaan molekul yang memiliki gugus reaktif.',
    color: 'amber'
  },
  {
    id: 'luas-permukaan',
    term: 'Luas Permukaan Sentuh',
    symbol: 'Area (cm²)',
    category: 'Faktor Laju',
    definition:
      'Total bidang kontak zat padat yang bersentuhan langsung dengan fluida reaktan (cairan atau gas). Menghaluskan bongkahan menjadi serbuk renik melipatgandakan luas permukaan dan frekuensi tumbukan.',
    example:
      'Serbuk tablet effervescent larut dalam 5 detik, sedangkan tablet padat utuh butuh 45 detik.',
    color: 'emerald'
  }
]

export default function GlossaryModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  if (!isOpen) return null

  const categories = ['Semua', 'Faktor Laju', 'Teori Tumbukan', 'Kinetika Kimia']

  const filteredTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content glossary-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Glosarium */}
        <div className="glossary-header">
          <div className="glossary-title-wrap">
            <div className="glossary-icon-badge">
              <BookOpen size={22} className="text-coral" />
            </div>
            <div>
              <h2 className="glossary-main-title">Glosarium Kinetika Kimia</h2>
              <p className="glossary-sub-title">
                Kamus Mini Istilah Inti Fase F SMA Kelas XI (Laju Reaksi & Teori Tumbukan)
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Tutup Kamus Glosarium"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar & Kategori */}
        <div className="glossary-controls-bar">
          <div className="glossary-search-input-wrap">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Cari istilah: tumbukan, Ea, katalis, orde..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glossary-search-input"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="glossary-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar Istilah Glosarium */}
        <div className="glossary-list-scroll">
          {filteredTerms.length === 0 ? (
            <div className="glossary-empty-state">
              <Sparkles size={28} className="text-muted" />
              <p>Tidak ditemukan istilah yang cocok dengan "<strong>{searchTerm}</strong>".</p>
            </div>
          ) : (
            filteredTerms.map((term) => (
              <div key={term.id} className={`glossary-item-card ${term.color}`}>
                <div className="term-card-header">
                  <div className="term-title-row">
                    <h3 className="term-name">{term.term}</h3>
                    <span className="term-symbol-badge">{term.symbol}</span>
                  </div>
                  <span className={`term-cat-tag ${term.color}`}>
                    {term.category}
                  </span>
                </div>

                <p className="term-definition">{term.definition}</p>

                <div className="term-example-box">
                  <span className="example-label">Contoh Konkret:</span>
                  <p className="example-text">{term.example}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Glosarium */}
        <div className="glossary-footer">
          <span className="glossary-count-info">
            Menampilkan <strong>{filteredTerms.length}</strong> dari {GLOSSARY_TERMS.length} istilah terverifikasi IUPAC & Kurikulum Merdeka
          </span>
          <button
            type="button"
            className="btn-close-glossary"
            onClick={onClose}
          >
            Tutup Glosarium
          </button>
        </div>
      </div>
    </div>
  )
}
