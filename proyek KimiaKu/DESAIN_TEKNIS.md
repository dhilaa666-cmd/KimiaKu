# Desain Teknis Proyek – KimiaKu

## 1. Tumpukan Teknologi (Tech Stack)
- **Framework & Build Tool:** React + Vite
- **Styling:** CSS / komponen modular React
- **Penyimpanan Lokal:** `localStorage` (untuk progres kuis dan data anonim tanpa backend)

## 2. Struktur Direktori Proyek
- `src/components/`: Tempat penyimpanan komponen fungsional React (contoh: `ModulFaktorLaju.jsx`, `KuisKimia.jsx`).
- `src/data/`: Tempat pemisahan data statis, materi kimia, dan soal kuis (contoh: `lajuReaksiData.js`).
- `src/lib/`: Fungsi pembantu/helper untuk manajemen penyimpanan `localStorage`.