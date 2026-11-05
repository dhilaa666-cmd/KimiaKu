# Database & Penyimpanan Lokal KimiaKu

## Kontrak Penyimpanan Local First (Bab 3)
- Namespace Key: `kimiaku:laju-reaksi:v1`
- Penyimpanan: `localStorage` browser (Tanpa login / anonim).
- Modul: `modul-1` (Faktor Laju Reaksi)
- Versi Soal: `v1`

## Struktur Data Record Kuis
- `id`: UUID Percobaan
- `ownerId`: `guest`
- `moduleId`: `modul-1`
- `questionVersion`: `v1`
- `answers`: Peta ID Soal ke pilihan siswa
- `score`: Nilai 0 - 100
- `completedAt`: ISO Timestamp 