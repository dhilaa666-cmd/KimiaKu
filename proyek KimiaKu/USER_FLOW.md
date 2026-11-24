# Alur Pengguna (User Flow) – KimiaKu

Alur navigasi utama aplikasi web pembelajaran kimia berbasis POE:

1. **Halaman Beranda (`/`)**
   - Pengguna membuka aplikasi dan melihat sambutan serta daftar modul pembelajaran yang tersedia.
   - Pengguna memilih **Modul 1: Faktor Laju Reaksi**.

2. **Modul 1: Faktor Laju Reaksi (`/modul-1`)**
   - **Tahap Predict (Dugaan Awal):** Siswa membaca fenomena dan menjawab pertanyaan pilihan ganda sebelum eksperimen dimulai.
   - **Tahap Observe (Pengamatan):** Setelah memilih, sistem membuka visualisasi makroskopis dan deskripsi mikroskopis tumbukan partikel.
   - **Tahap Explain (Penjelasan):** Siswa membaca rangkuman ilmiah mengenai alasan mekanistik faktor tersebut memengaruhi laju reaksi.

3. **Kuis Evaluasi (`/kuis`)**
   - Siswa mengerjakan **10 Soal Evaluasi Laju Reaksi** yang mencakup seluruh konsep dari Modul 1 sampai Modul 3.
   - Sistem melakukan kalkulasi skor dinamis (0–100) dan menyajikan pembahasan ilmiah komprehensif untuk setiap butir soal.

4. **Navigasi Kembali**
   - Pengguna dapat menekan tombol kembali untuk pulang ke Halaman Beranda.
   