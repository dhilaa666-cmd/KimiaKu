/**
 * Naskah Data 4 Faktor Laju Reaksi Berbasis Alur POE (Predict - Observe - Explain)
 * Modul Pembelajaran Kimia SMA Kelas XI Fase F
 * 
 * Sesuai panduan kurikulum & konvensi notasi kimia (PRD.md & AGENTS.md):
 * - Memuat 4 faktor utama: Konsentrasi, Suhu, Luas Permukaan, Katalis.
 * - Format POE lengkap:
 *   1. Predict: Pertanyaan dugaan awal pilihan ganda beserta kuncinya.
 *   2. Observe: Deskripsi fenomena makroskopis dan representasi mikroskopis tumbukan partikel.
 *   3. Explain: Penjelasan ilmiah mendalam mengenai mekanisme tumbukan efektif.
 * - Notasi kimia menggunakan subskrip dan superskrip baku (Na₂S₂O₃, H₂O, Eₐ, ΔT, dll).
 */

export const modulFaktorLaju = {
  id: 'modul-1',
  modulId: 'faktor-laju',
  judul: 'Modul 1: Faktor-Faktor Laju Reaksi',
  topik: 'Kinetika Kimia - Laju Reaksi',
  fase: 'Fase F (Kelas XI SMA)',
  deskripsi:
    'Pelajari pengaruh konsentrasi, suhu, luas permukaan, dan katalis terhadap laju reaksi melalui pendekatan saintifik POE (Predict, Observe, Explain).',
  faktor: [
    {
      id: 'konsentrasi',
      nomor: 1,
      nama: 'Konsentrasi Pereaksi',
      parameter: 'Kemolaran [M]',
      reaksi: 'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)',
      predict: {
        pertanyaan:
          'Jika konsentrasi larutan asam klorida (HCl) dinaikkan dari 0,1 M menjadi 1,0 M saat mereaksikan pita magnesium (Mg), bagaimana perubahan laju pembentukan gas H₂?',
        pilihan: [
          'Laju reaksi semakin cepat karena jumlah partikel per satuan volume semakin banyak sehingga frekuensi tumbukan meningkat.',
          'Laju reaksi semakin lambat karena partikel-partikel asam berdesakan dan saling menghambat pergerakan.',
          'Laju reaksi tidak berubah karena konsentrasi tidak memengaruhi energi kinetik partikel pereaksi.',
          'Reaksi berhenti seketika karena kepekatan larutan menghalangi pelepasan gelembung gas H₂.'
        ],
        kunci: 0,
        alasanKunci:
          'Peningkatan konsentrasi memperbanyak jumlah partikel pereaksi dalam volume yang sama (kerapatan meningkat), sehingga frekuensi tumbukan antarpartikel per satuan waktu bertambah besar.'
      },
      observe: {
        deskripsiMakro:
          'Pada tabung reaksi dengan HCl 1,0 M, pita magnesium (Mg) larut lebih cepat disertai desisan kuat dan pembentukan gelembung gas H₂ yang melimpah dan deras dibandingkan pada tabung berisi HCl 0,1 M.',
        deskripsiMikro:
          'Konsentrasi yang lebih tinggi menghasilkan kerapatan partikel ion H⁺ per satuan volume larutan yang jauh lebih rapat. Hal ini menyebabkan frekuensi tumbukan antara ion H⁺ dan atom-atom magnesium pada permukaan pita Mg terjadi jauh lebih sering setiap detiknya.',
        persamaanReaksi: 'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)'
      },
      explain: {
        ringkasan:
          'Semakin besar konsentrasi zat pereaksi, semakin banyak jumlah partikel pereaksi yang terkandung dalam volume larutan yang sama. Peningkatan kerapatan partikel ini meningkatkan frekuensi tumbukan antarpartikel per satuan waktu. Dengan frekuensi tumbukan yang semakin tinggi, peluang terjadinya tumbukan efektif (tumbukan dengan orientasi tepat dan energi mencukupi) semakin besar, sehingga laju reaksi pembentukan produk (gas H₂) berlangsung lebih cepat.',
        konsepKunci: [
          'Konsentrasi tinggi = Kerapatan partikel pereaksi per satuan volume bertambah',
          'Frekuensi tumbukan antarpartikel meningkat',
          'Jumlah tumbukan efektif per detik bertambah',
          'Laju reaksi pembentukan produk meningkat secara proporsional'
        ]
      }
    },
    {
      id: 'suhu',
      nomor: 2,
      nama: 'Suhu Sistem',
      parameter: 'Temperatur (ΔT dalam °C atau K)',
      reaksi: 'Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + SO₂(g) + S(s)',
      predict: {
        pertanyaan:
          'Bagaimana pengaruh peningkatan suhu sistem (ΔT) dari 25 °C menjadi 50 °C terhadap laju reaksi antara larutan natrium tiosulfat (Na₂S₂O₃) dan larutan asam klorida (HCl)?',
        pilihan: [
          'Laju reaksi semakin cepat karena peningkatan suhu menaikkan energi kinetik partikel sehingga lebih banyak partikel yang melampaui energi aktivasi (Eₐ).',
          'Laju reaksi semakin lambat karena kenaikan suhu merusak kestabilan molekul pereaksi sebelum sempat bereaksi.',
          'Laju reaksi tidak dipengaruhi oleh suhu karena energi aktivasi (Eₐ) bernilai tetap untuk reaksi yang sama.',
          'Laju reaksi berosilasi karena kenaikan suhu menyebabkan partikel bergerak acak tanpa arah tumbukan yang teratur.'
        ],
        kunci: 0,
        alasanKunci:
          'Peningkatan suhu (ΔT) menaikkan energi kinetik rata-rata partikel, sehingga fraksi partikel pereaksi yang memiliki energi kinetik sama dengan atau melebihi energi aktivasi (Eₐ) meningkat tajam.'
      },
      observe: {
        deskripsiMakro:
          'Pada suhu 50 °C, campuran larutan Na₂S₂O₃ dan HCl cepat sekali berubah menjadi keruh putih-kekuningan akibat terbentuknya endapan koloid belerang (S). Tanda silang hitam (X) yang diletakkan di bawah gelas beker tertutup dan tidak terlihat jauh lebih cepat dibandingkan pada suhu 25 °C.',
        deskripsiMikro:
          'Peningkatan suhu (ΔT) menyebabkan partikel pereaksi (Na₂S₂O₃ dan ion H⁺) bergerak jauh lebih cepat karena menyerap energi termal. Hal ini memperbesar frekuensi tumbukan serta meningkatkan persentase partikel yang bertumbukan dengan energi melampaui ambang energi aktivasi (Eₐ).',
        persamaanReaksi: 'Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + SO₂(g) + S(s)'
      },
      explain: {
        ringkasan:
          'Kenaikan suhu (ΔT) mengakibatkan energi kinetik rata-rata partikel pereaksi bertambah (sesuai hubungan Eₖ = ³/₂ kT). Partikel-partikel bergerak lebih lincah dan cepat, yang tidak hanya meningkatkan frekuensi tumbukan, tetapi yang paling krusial adalah meningkatkan jumlah partikel yang energinya mampu melampaui batas energi aktivasi (Eₐ). Akibatnya, fraksi tumbukan efektif melonjak secara eksponensial (sebagaimana digambarkan dalam persamaan Arrhenius: k = A·e^(−Eₐ/RT)), membuat laju reaksi berlangsung berlipat ganda setiap kenaikan suhu tertentu (umumnya laju naik 2 kali lipat setiap kenaikan 10 °C).',
        konsepKunci: [
          'Kenaikan suhu (ΔT) meningkatkan energi kinetik rata-rata partikel',
          'Jumlah partikel yang memiliki energi ≥ Eₐ bertambah secara eksponensial',
          'Frekuensi tumbukan efektif per satuan waktu melonjak tajam',
          'Waktu reaksi berkurang drastis sehingga reaksi selesai lebih cepat'
        ]
      }
    },
    {
      id: 'luas-permukaan',
      nomor: 3,
      nama: 'Luas Permukaan Sentuh',
      parameter: 'Ukuran Butiran Zat Padat (Serbuk vs Bongkahan)',
      reaksi: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)',
      predict: {
        pertanyaan:
          'Manakah yang bereaksi lebih cepat dengan larutan asam klorida (HCl): serbuk kalsium karbonat (CaCO₃) halus atau bongkahan CaCO₃ utuh dengan massa yang sama?',
        pilihan: [
          'Serbuk CaCO₃ bereaksi lebih cepat karena memiliki total luas permukaan bidang sentuh yang jauh lebih besar.',
          'Bongkahan CaCO₃ bereaksi lebih cepat karena struktur kristalnya lebih padat dan mengendap di dasar wadah.',
          'Keduanya bereaksi dengan kecepatan yang sama karena massa CaCO₃ dan konsentrasi asam yang digunakan sama persis.',
          'Bongkahan CaCO₃ bereaksi lebih cepat karena ion-ion asam dapat menembus pori-pori bongkahan secara terpusat.'
        ],
        kunci: 0,
        alasanKunci:
          'Membagi zat padat menjadi butiran serbuk halus memperbesar luas permukaan kontak total per satuan massa, membuka lebih banyak bidang bagi partikel asam untuk bertumbukan.'
      },
      observe: {
        deskripsiMakro:
          'Ketika serbuk CaCO₃ dimasukkan ke dalam larutan HCl, langsung timbul buih berdesis kuat dan gelembung gas CO₂ memancar cepat hingga reaksi tuntas dalam hitungan detik. Sebaliknya, pada bongkahan CaCO₃, gelembung gas CO₂ terbentuk lambat di tepi permukaan luar batu dan membutuhkan waktu jauh lebih lama untuk habis bereaksi.',
        deskripsiMikro:
          'Pada bentuk serbuk, partikel padatan terpecah menjadi butiran renik sehingga seluruh permukaan partikel terpapar langsung ke larutan asam. Bidang sentuh yang terbuka sangat banyak, memungkinkan ion-ion H⁺ menumbuk permukaan partikel padatan CaCO₃ dari berbagai arah secara simultan.',
        persamaanReaksi: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)'
      },
      explain: {
        ringkasan:
          'Pada reaksi heterogen antara padatan dan larutan/gas, reaksi kimia hanya dapat terjadi pada bidang batas fase tempat terjadinya kontak fisik (antarmuka). Semakin halus ukuran butiran zat padat, semakin besar total luas permukaan bidang sentuhnya untuk massa yang sama. Luas permukaan sentuh yang lebih luas menyediakan lebih banyak titik kontak tumbukan antarpartikel per satuan waktu. Hal ini meningkatkan frekuensi tumbukan efektif antara reaktan, sehingga laju penguraian CaCO₃ dan laju pembentukan gas CO₂ berlangsung jauh lebih cepat.',
        konsepKunci: [
          'Massa sama, namun serbuk memiliki total luas bidang sentuh jauh lebih besar',
          'Area kontak langsung antara partikel padat dan pereaksi cair meluas',
          'Peluang tumbukan simultan pada antarmuka fase meningkat pesat',
          'Laju reaksi meningkat dan waktu penyelesaian reaksi menjadi jauh lebih singkat'
        ]
      }
    },
    {
      id: 'katalis',
      nomor: 4,
      nama: 'Pengaruh Katalis',
      parameter: 'Zat Perantara (Penurun Energi Aktivasi Eₐ)',
      reaksi: '2H₂O₂(aq) ──[FeCl₃/MnO₂]──> 2H₂O(l) + O₂(g)',
      predict: {
        pertanyaan:
          'Apa peran utama penambahan sedikit katalis (misalnya larutan besi(III) klorida (FeCl₃) atau mangan dioksida (MnO₂)) pada reaksi penguraian hidrogen peroksida (H₂O₂)?',
        pilihan: [
          'Menurunkan energi aktivasi (Eₐ) reaksi dengan menyediakan jalur reaksi alternatif sehingga reaksi berlangsung lebih cepat.',
          'Meningkatkan jumlah total gas O₂ dan air (H₂O) yang diperoleh di akhir reaksi melebihi batas stoikiometri.',
          'Menaikkan suhu sistem secara drastis melalui pelepasan panas internal yang tinggi.',
          'Mengubah reaksi bolak-balik menjadi reaksi satu arah dengan mengikat produk secara permanen.'
        ],
        kunci: 0,
        alasanKunci:
          'Katalis bekerja spesifik dengan cara menurunkan energi aktivasi (Eₐ) tanpa mengalami perubahan kimiawi permanen di akhir reaksi.'
      },
      observe: {
        deskripsiMakro:
          'Larutan H₂O₂ murni terurai sangat lambat dan gelembung gas O₂ hampir tidak teramati. Begitu beberapa tetes larutan FeCl₃ (atau sedikit serbuk MnO₂) ditambahkan, seketika terjadi luapan busa dan semburan gelembung gas O₂ yang sangat lebat dan cepat tanpa perlu dipanaskan.',
        deskripsiMikro:
          'Katalis (seperti ion Fe³⁺ atau permukaan MnO₂) berinteraksi langsung dengan molekul H₂O₂ untuk membentuk senyawa kompleks teraktivasi perantara yang memiliki energi potensial lebih rendah. Tahapan reaksi baru ini memiliki rintangan energi (Eₐ) yang jauh lebih rendah daripada mekanisme tanpa katalis.',
        persamaanReaksi: '2H₂O₂(aq) ──[FeCl₃]──> 2H₂O(l) + O₂(g)'
      },
      explain: {
        ringkasan:
          'Katalis adalah zat yang mampu mempercepat laju reaksi kimia tanpa dikonsumsi secara permanen oleh reaksi tersebut (di akhir reaksi, katalis diperoleh kembali dalam jumlah dan susunan kimia yang sama). Katalis bekerja dengan cara menyediakan rute atau mekanisme alternatif yang memiliki energi aktivasi (Eₐ) lebih rendah dibandingkan jalur reaksi biasa. Karena ambang batas energi aktivasi (Eₐ) menjadi lebih rendah, proporsi partikel pereaksi yang memenuhi syarat energi minimum untuk bertumbukan efektif menjadi jauh lebih besar pada suhu yang sama, sehingga laju reaksi meningkat dengan signifikan.',
        konsepKunci: [
          'Menyediakan rute/mekanisme reaksi alternatif',
          'Menurunkan energi aktivasi (Eₐ) reaksi',
          'Memperbanyak jumlah tumbukan yang berhasil melampaui batas energi aktivasi',
          'Tidak mengubah kesetimbangan kimia maupun jumlah produk akhir (katalis tidak terkonsumsi)'
        ]
      }
    }
  ],

  // 5 Soal Pilihan Ganda Kuis Diagnostik Laju Reaksi (Bab 3)
  kuisDiagnostik: [
    {
      id: 'kuis-1',
      faktor: 'Konsentrasi Pereaksi',
      pertanyaan:
        'Pada reaksi antara pita magnesium (Mg) dan larutan asam klorida (HCl), peningkatan konsentrasi HCl dari 0,1 M menjadi 1,0 M menyebabkan laju pembentukan gas H₂ meningkat signifikan. Penjelasan ilmiah yang tepat menurut teori tumbukan adalah...',
      opsi: [
        'Peningkatan konsentrasi memperbanyak jumlah partikel per satuan volume sehingga frekuensi tumbukan antarpartikel pereaksi bertambah besar.',
        'Peningkatan konsentrasi menurunkan ambang energi aktivasi (Eₐ) reaksi sehingga tumbukan lebih mudah menghasilkan zat baru.',
        'Peningkatan konsentrasi menaikkan energi kinetik rata-rata partikel pereaksi sehingga partikel bergerak jauh lebih cepat.',
        'Peningkatan konsentrasi mengubah susunan kristal pita magnesium menjadi lebih lunak dan mudah larut.'
      ],
      jawabanBenar: 'A',
      jawabanBenarIndex: 0,
      pembahasan:
        'Peningkatan konsentrasi larutan asam menambah kerapatan atau jumlah partikel ion H⁺ per satuan volume. Akibatnya, jarak antarpartikel semakin rapat sehingga frekuensi tumbukan antarpartikel per satuan waktu meningkat. Peluang terjadinya tumbukan efektif pun meningkat, membuat pembentukan gas H₂ berlangsung lebih cepat. Perhatikan bahwa konsentrasi tidak mengubah energi aktivasi (Eₐ) maupun energi kinetik rata-rata partikel.'
    },
    {
      id: 'kuis-2',
      faktor: 'Suhu Sistem',
      pertanyaan:
        'Pemanasan larutan pada reaksi kimia dari suhu 25 °C menjadi 35 °C (kenaikan suhu ΔT = 10 °C) umumnya melipatgandakan laju reaksi. Alasan utama peningkatan laju reaksi akibat kenaikan temperatur (ΔT) adalah...',
      opsi: [
        'Kenaikan suhu menurunkan nilai energi aktivasi (Eₐ) sehingga bukit energi reaksi lebih mudah dilompati.',
        'Kenaikan suhu meningkatkan energi kinetik rata-rata partikel sehingga fraksi molekul dengan energi ≥ Eₐ bertambah drastis.',
        'Kenaikan suhu memperbesar ukuran diameter partikel pereaksi sehingga luas bidang benturan molekul meluas.',
        'Kenaikan suhu menghilangkan gaya tolak elektrostatik antarinti atom pada saat terjadi benturan partikel.'
      ],
      jawabanBenar: 'B',
      jawabanBenarIndex: 1,
      pembahasan:
        'Suhu merupakan representasi energi kinetik rata-rata partikel. Berdasarkan kurva distribusi Maxwell-Boltzmann, peningkatan temperatur (ΔT) menaikkan energi kinetik partikel sehingga persentase (fraksi) molekul yang memiliki energi kinetik sama dengan atau melebihi energi aktivasi (E ≥ Eₐ) melonjak drastis. Faktor ini menjadi pemicu utama melipatgandanya laju reaksi, bukan karena penurunan nilai Eₐ (nilai Eₐ bernilai konstan untuk reaksi yang sama).'
    },
    {
      id: 'kuis-3',
      faktor: 'Luas Permukaan Sentuh',
      pertanyaan:
        'Dua tabung reaksi masing-masing diisi 10 mL larutan HCl 1 M. Tabung I dimasukkan 2 gram bongkahan kalsium karbonat (CaCO₃), sedangkan Tabung II dimasukkan 2 gram serbuk CaCO₃. Tabung II menghasilkan gas CO₂ jauh lebih cepat dibanding Tabung I karena...',
      opsi: [
        'Bentuk serbuk memiliki massa jenis yang lebih tinggi dibanding bentuk bongkahan pada massa yang sama.',
        'Bentuk serbuk memiliki total luas permukaan bidang sentuh yang jauh lebih besar sehingga kontak tumbukan efektif meningkat.',
        'Bentuk serbuk menurunkan energi aktivasi (Eₐ) penguraian kalsium karbonat oleh larutan asam.',
        'Bentuk serbuk melepaskan panas spontan yang memanaskan larutan asam klorida di dalam tabung.'
      ],
      jawabanBenar: 'B',
      jawabanBenarIndex: 1,
      pembahasan:
        'Pada reaksi heterogen antara zat padat dan larutan, reaksi hanya dapat berlangsung pada permukaan batas kontak antarfase. Dengan menghaluskan 2 gram CaCO₃ menjadi serbuk, luas permukaan total bidang kontak yang terpapar langsung ke larutan asam meluas berkali-kali lipat. Hal ini membuka jauh lebih banyak area tumbukan simultan dengan ion H⁺ per detik, sehingga laju reaksi dan laju pembentukan gas CO₂ meningkat drastis.'
    },
    {
      id: 'kuis-4',
      faktor: 'Pengaruh Katalis',
      pertanyaan:
        'Larutan hidrogen peroksida (H₂O₂) terurai sangat lambat pada suhu ruang, namun penambahan sedikit larutan FeCl₃ atau serbuk MnO₂ menyebabkan pelepasan gelembung gas O₂ yang sangat lebat seketika. Prinsip kerja katalis dalam mempercepat reaksi tersebut adalah...',
      opsi: [
        'Menyediakan rute atau mekanisme reaksi alternatif dengan energi aktivasi (Eₐ) yang lebih rendah tanpa mengubah entalpi reaksi (ΔH).',
        'Menaikkan energi kinetik molekul H₂O₂ sehingga kecepatan partikel bertambah setara dengan pemanasan larutan.',
        'Bereaksi sebagai zat pereaksi utama yang habis terkonsumsi untuk menghasilkan volume gas O₂ melebihi batas stoikiometri.',
        'Mengubah nilai perubahan entalpi reaksi (ΔH) menjadi jauh lebih eksotermik sehingga panas reaksi mendorong laju reaksi.'
      ],
      jawabanBenar: 'A',
      jawabanBenarIndex: 0,
      pembahasan:
        'Katalis mempercepat laju reaksi kimia dengan cara berinteraksi sementara membentuk senyawa perantara (kompleks teraktivasi), sehingga membuka mekanisme reaksi alternatif yang membutuhkan energi aktivasi (Eₐ) lebih rendah. Pada suhu yang sama, jumlah partikel yang sanggup melewati rintangan Eₐ yang rendah menjadi jauh lebih melimpah. Di akhir reaksi, katalis diperoleh kembali tanpa mengalami perubahan kimia permanen, serta tidak memengaruhi entalpi reaksi (ΔH).'
    },
    {
      id: 'kuis-5',
      faktor: 'Teori Tumbukan',
      pertanyaan:
        'Menurut Teori Tumbukan (Collision Theory), tidak setiap benturan yang terjadi antarpartikel reaktan dapat menghasilkan zat baru. Tumbukan antarmolekul berhasil menjadi tumbukan efektif jika memenuhi kriteria mutlak...',
      opsi: [
        'Partikel saling bertumbukan dalam fase gas murni dengan volume wadah yang diperbesar.',
        'Partikel bertumbukan dengan orientasi ruang yang tepat dan memiliki energi kinetik sama dengan atau melebihi energi aktivasi (E ≥ Eₐ).',
        'Partikel bertumbukan tepat di pusat massa larutan tanpa bersentuhan dengan dinding wadah reaksi.',
        'Partikel melepaskan seluruh energi potensialnya menjadi energi cahaya pada saat terjadi benturan.'
      ],
      jawabanBenar: 'B',
      jawabanBenarIndex: 1,
      pembahasan:
        'Dua syarat mutlak terjadinya tumbukan efektif menurut Teori Tumbukan adalah: (1) Syarat Energi: energi kinetik total partikel saat bertumbukan harus melampaui rintangan energi aktivasi (E ≥ Eₐ) agar ikatan lama dapat terputus dan terbentuk kompleks teraktivasi. (2) Syarat Geometri/Orientasi: partikel harus bertumbukan dengan orientasi sudut ruang yang tepat agar atom-atom yang akan berikatan saling berhadapan. Jika salah satu syarat tidak terpenuhi, partikel hanya akan memantul kembali tanpa terjadi reaksi.'
    }
  ]
}

// Ekspor bernama untuk kuis diagnostik
export const kuisDiagnostik = modulFaktorLaju.kuisDiagnostik

// Alias ekspor agar fleksibel untuk berbagai format pemanggilan komponen
export const lajuReaksiData = modulFaktorLaju
export default modulFaktorLaju

