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

## Kontrak Integrasi Cloud & Idempotensi (Pertemuan 04)
- **Autentikasi:** Firebase Authentication (Google Auth Provider).
- **Penyimpanan Cloud:** Cloud Firestore.
- **Koleksi Dokumen:** `submissions/{attemptId}`.
- **Aturan Idempotensi (Slide 13):**
  - ID percobaan (`id`) digenerate satu kali saat draf kuis pertama kali dibuat dan dipertahankan.
  - Saat pengiriman awal maupun *retry*, ID dokumen yang digunakan pada Firestore selalu sama (`record.id`).
  - Pemanggilan berulang (`setDoc` dengan `{ merge: true }`) tidak membuat duplikasi catatan di Firestore.
- **Status Data yang Jujur (Slide 12):**
  - `Lokal`: Tersimpan di perangkat (`localStorage`), belum dikaitkan ke akun siswa.
  - `Menunggu Kirim`: Antrean tersimpan; server sedang memproses atau belum terkonfirmasi.
  - `Terkirim`: Server mengonfirmasi ID dan isi hasil yang sama (`receivedAt` tercatat).
  - `Gagal`: Terjadi kegagalan jaringan/izin; antrean tetap aman di lokal dan tersedia tombol retry ("Coba Kirim Lagi").