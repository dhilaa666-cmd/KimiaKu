/**
 * Data materi pembelajaran kimia kelas X
 * Sesuai aturan AGENTS.md: Data dipisahkan dari tampilan di src/data/
 */

export const TOPICS_DATA = [
  {
    id: 'stoikiometri',
    title: 'Stoikiometri',
    subtitle: 'Konsep Mol & Perhitungan Kimia',
    badge: 'Modul 01',
    category: 'Perhitungan Dasar',
    accentColor: 'emerald',
    description:
      'Pelajari dasar perhitungan kimia, hubungan mol dengan jumlah partikel, massa molar, dan penerapan hukum kekekalan massa dalam reaksi kimia.',
    estimatedTime: '15 Menit',
    totalActivities: 3,
    sampleReaction: {
      reactants: [
        { formula: 'N', sub: '2', state: 'g', coeff: '1' },
        { formula: 'H', sub: '2', state: 'g', coeff: '3' }
      ],
      products: [
        { formula: 'NH', sub: '3', state: 'g', coeff: '2' }
      ],
      equationText: 'N₂ + 3H₂ → 2NH₃'
    },
    formulaBadges: [
      { label: 'Rumus Mol', formulaParts: [{ text: 'n = m / M' }, { sub: 'r' }] },
      { label: 'Partikel', formulaParts: [{ text: 'Jumlah Partikel = n × 6,02 × 10' }, { sup: '23' }] },
      { label: 'Volume STP', formulaParts: [{ text: 'V = n × 22,4 L' }] }
    ],
    keyPoints: [
      'Konsep mol sebagai jembatan massa dan partikel mikroskopis',
      'Massa molar zat (Mr) dari jumlah massa atom relatif (Ar)',
      'Perbandingan koefisien reaksi menentukan perbandingan mol'
    ]
  },
  {
    id: 'termokimia',
    title: 'Termokimia',
    subtitle: 'Energi, Kalor & Perubahan Entalpi',
    badge: 'Modul 02',
    category: 'Energetika Kimia',
    accentColor: 'amber',
    description:
      'Pahami perpindahan kalor antara sistem dan lingkungan, perbedaan reaksi eksoterm dan endoterm, serta perhitungan perubahan entalpi reaksi.',
    estimatedTime: '20 Menit',
    totalActivities: 3,
    sampleReaction: {
      reactants: [
        { formula: 'CH', sub: '4', state: 'g', coeff: '1' },
        { formula: 'O', sub: '2', state: 'g', coeff: '2' }
      ],
      products: [
        { formula: 'CO', sub: '2', state: 'g', coeff: '1' },
        { formula: 'H', sub: '2', formulaAfter: 'O', state: 'g', coeff: '2' }
      ],
      equationText: 'CH₄ + 2O₂ → CO₂ + 2H₂O'
    },
    formulaBadges: [
      { label: 'Entalpi', formulaParts: [{ text: 'ΔH = H' }, { sub: 'produk' }, { text: ' − H' }, { sub: 'reaktan' }] },
      { label: 'Eksoterm', formulaParts: [{ text: 'ΔH < 0 (Melepas kalor ke lingkungan)' }] },
      { label: 'Kalorimeter', formulaParts: [{ text: 'q = m × c × ΔT' }] }
    ],
    keyPoints: [
      'Sistem adalah pusat pengamatan, lingkungan adalah sekitarnya',
      'Reaksi eksoterm menaikkan suhu lingkungan (ΔH negatif)',
      'Reaksi endoterm menyerap kalor dari lingkungan (ΔH positif)'
    ]
  },
  {
    id: 'asam-basa',
    title: 'Larutan Asam-Basa',
    subtitle: 'Teori, Skala pH & Indikator',
    badge: 'Modul 03',
    category: 'Sifat Larutan',
    accentColor: 'indigo',
    description:
      'Eksplorasi sifat asam dan basa menurut teori Arrhenius, penentuan derajat keasaman (skala pH), ionisasi air, dan identifikasi dengan indikator warna.',
    estimatedTime: '15 Menit',
    totalActivities: 3,
    sampleReaction: {
      reactants: [
        { formula: 'HCl', state: 'aq', coeff: '1' },
        { formula: 'NaOH', state: 'aq', coeff: '1' }
      ],
      products: [
        { formula: 'NaCl', state: 'aq', coeff: '1' },
        { formula: 'H', sub: '2', formulaAfter: 'O', state: 'l', coeff: '1' }
      ],
      equationText: 'HCl + NaOH → NaCl + H₂O'
    },
    formulaBadges: [
      { label: 'Skala pH', formulaParts: [{ text: 'pH = −log[H' }, { sup: '+' }, { text: ']' }] },
      { label: 'Skala pOH', formulaParts: [{ text: 'pOH = −log[OH' }, { sup: '−' }, { text: ']' }] },
      { label: 'Tetapan Air', formulaParts: [{ text: 'K' }, { sub: 'w' }, { text: ' = [H' }, { sup: '+' }, { text: '][OH' }, { sup: '−' }, { text: '] = 10' }, { sup: '−14' }] }
    ],
    keyPoints: [
      'Asam menghasilkan ion H⁺, basa menghasilkan ion OH⁻ dalam air',
      'Skala pH: pH < 7 (asam), pH = 7 (netral), pH > 7 (basa)',
      'Reaksi netralisasi antara asam dan basa menghasilkan garam dan air'
    ]
  }
]
