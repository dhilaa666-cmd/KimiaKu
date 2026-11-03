/**
 * Data Soal Kuis Interaktif Laju Reaksi (Siswa SMA Kelas XI Fase F)
 * Sesuai aturan PRD.md & AGENTS.md:
 * - Minimal 5 soal per modul (total 15 soal)
 * - Format kimia menggunakan notasi subskrip/superskrip
 * - Umpan balik menjelaskan mekanisme ilmiah mendalam
 */

export const QUIZ_DATA = {
  'faktor-laju': [
    {
      id: 'q1-1',
      question:
        'Mengapa peningkatan konsentrasi larutan pereaksi dapat meningkatkan laju reaksi kimia secara signifikan?',
      options: [
        'Karena konsentrasi tinggi menurunkan Energi Aktivasi (Ea) reaksi secara spontan.',
        'Karena jumlah partikel per satuan volume bertambah, sehingga frekuensi tumbukan antarpartikel meningkat.',
        'Karena partikel reaktan berubah sifat kimianya menjadi lebih reaktif.',
        'Karena peningkatan konsentrasi selalu menaikkan suhu larutan secara otomatis.'
      ],
      correctIndex: 1,
      explanation:
        'Peningkatan konsentrasi menambah kerapatan partikel per satuan volume. Akibatnya, jarak antarpartikel semakin rapat sehingga peluang (frekuensi) terjadinya tumbukan antarpartikel per detik meningkat tajam, yang berbanding lurus dengan peningkatan jumlah tumbukan efektif.'
    },
    {
      id: 'q1-2',
      question:
        'Jika sebutir vitamin C tablet effervescent dihaluskan menjadi serbuk sebelum dilarutkan ke dalam air, reaksinya berlangsung jauh lebih cepat. Penjelasan ilmiah yang tepat adalah...',
      options: [
        'Serbuk vitamin C memiliki luas bidang sentuh yang jauh lebih besar daripada bentuk tablet utuh.',
        'Menghaluskan tablet mengubah entalpi reaksi (ΔH) menjadi lebih eksoterm.',
        'Serbuk vitamin C memiliki energi kinetik partikel yang lebih tinggi sebelum menyentuh air.',
        'Bentuk tablet memiliki zat penghambat (inhibitor) yang hancur saat digerus.'
      ],
      correctIndex: 0,
      explanation:
        'Reaksi antara padatan dan cairan berlangsung pada permukaan kontak zat padat. Dengan menghaluskan tablet menjadi butiran serbuk renik, luas permukaan total bidang sentuh yang kontak dengan molekul air berlipat ganda, memungkinkan lebih banyak partikel bereaksi secara simultan.'
    },
    {
      id: 'q1-3',
      question:
        'Kenaikan temperatur dari 25°C ke 35°C umumnya melipatgandakan laju reaksi. Alasan utama fenomena ini menurut teori kinetik partikel adalah...',
      options: [
        'Kenaikan suhu mengubah wujud zat reaktan menjadi fase gas yang bergerak bebas.',
        'Kenaikan suhu menurunkan nilai tetapan gas ideal (R) dalam persamaan kimia.',
        'Kenaikan suhu meningkatkan energi kinetik partikel sehingga persentase partikel yang energinya melampaui Ea meningkat drastis.',
        'Kenaikan suhu memperbesar ukuran diameter molekul reaktan sehingga lebih mudah bersenggolan.'
      ],
      correctIndex: 2,
      explanation:
        'Berdasarkan kurva distribusi Maxwell-Boltzmann, peningkatan temperatur meningkatkan energi kinetik rata-rata partikel. Fraksi (proporsi) partikel yang energinya sama atau lebih besar dari Energi Aktivasi (E ≥ E<sub>a</sub>) melonjak signifikan, sehingga jumlah tumbukan yang sukses menjadi produk berlipat ganda.'
    },
    {
      id: 'q1-4',
      question:
        'Bagaimanakah mekanisme kerja penambahan katalis dalam mempercepat penguraian hidrogen peroksida (2H₂O₂ → 2H₂O + O₂)?',
      options: [
        'Katalis menaikkan suhu larutan sehingga partikel bergerak lebih gesit.',
        'Katalis menyediakan rute reaksi baru dengan Energi Aktivasi (Ea) yang lebih rendah.',
        'Katalis meningkatkan perubahan entalpi reaksi (ΔH) sehingga melepaskan lebih banyak kalor.',
        'Katalis mengikat molekul air (H₂O) sehingga reaksi terdorong ke arah pembentukan gas O₂.'
      ],
      correctIndex: 1,
      explanation:
        'Katalis bekerja dengan membentuk senyawa antara (intermedier) yang membuka rute mekanisme reaksi alternatif. Rute ini memiliki rintangan Energi Aktivasi (E<sub>a</sub>) yang jauh lebih rendah daripada rute tanpa katalis, tanpa mengubah nilai ΔH reaksi atau ikut habis di akhir reaksi.'
    },
    {
      id: 'q1-5',
      question:
        'Suatu reaksi berlangsung 3 kali lebih cepat setiap kenaikan suhu 10°C. Jika pada suhu 20°C reaksi selesai dalam 81 detik, berapa waktu yang dibutuhkan reaksi tersebut pada suhu 40°C?',
      options: [
        '27 detik',
        '9 detik',
        '18 detik',
        '3 detik'
      ],
      correctIndex: 1,
      explanation:
        'Kenaikan suhu dari 20°C ke 40°C adalah ΔT = 20°C. Karena tiap 10°C laju 3× lebih cepat, maka faktor pengali waktu adalah (⅓)^(20/10) = (⅓)² = ⅑. Jadi waktu pada suhu 40°C adalah 81 detik × ⅑ = 9 detik.'
    }
  ],
  'teori-tumbukan': [
    {
      id: 'q2-1',
      question:
        'Menurut Teori Tumbukan, apakah setiap tumbukan yang terjadi antarmolekul pereaksi selalu menghasilkan reaksi kimia?',
      options: [
        'Ya, asalkan molekul-molekul tersebut berada dalam fase larutan atau gas.',
        'Tidak, hanya tumbukan yang memiliki energi kinetik ≥ Ea dan orientasi spasial yang tepat yang menghasilkan reaksi.',
        'Ya, selama konsentrasi reaktan cukup tinggi dalam wadah tertutup.',
        'Tidak, hanya tumbukan yang disertai kenaikan volume wadah yang menghasilkan produk.'
      ],
      correctIndex: 1,
      explanation:
        'Tumbukan antarmolekul hanya menghasilkan reaksi jika merupakan tumbukan efektif. Dua syarat mutlak tumbukan efektif adalah: (1) energi kinetik partikel saat bertumbukan harus cukup untuk mengatasi Energi Aktivasi (E ≥ E<sub>a</sub>), dan (2) posisi/sudut benturan (orientasi geometri) molekul harus tepat agar ikatan baru dapat tersusun.'
    },
    {
      id: 'q2-2',
      question:
        'Apakah yang dimaksud dengan Energi Aktivasi (Ea) dalam profil reaksi kimia?',
      options: [
        'Total energi kalor yang dilepaskan ke lingkungan saat reaksi selesai.',
        'Energi minimum yang harus dimiliki molekul pereaksi untuk mencapai keadaan transisi (kompleks teraktivasi).',
        'Selisih antara energi produk dan energi reaktan pada reaksi eksoterm.',
        'Energi kinetik terendah yang dimiliki partikel sebelum pemanasan dimulai.'
      ],
      correctIndex: 1,
      explanation:
        'Energi Aktivasi (E<sub>a</sub>) adalah rintangan energi minimum yang harus dilampaui oleh molekul-molekul reaktan yang bertumbukan agar ikatan kimia lama terputus dan terbentuk kompleks teraktivasi berenergi tinggi sebelum bertransformasi menjadi produk.'
    },
    {
      id: 'q2-3',
      question:
        'Pada reaksi eksoterm, bagaimanakah perbandingan energi antara keadaan reaktan, kompleks teraktivasi, dan produk?',
      options: [
        'Energi reaktan paling tinggi, diikuti produk, lalu kompleks teraktivasi.',
        'Kompleks teraktivasi memiliki energi tertinggi, dan energi produk lebih rendah dari energi reaktan.',
        'Kompleks teraktivasi memiliki energi terendah karena sudah terbentuk ikatan stabil.',
        'Energi reaktan dan produk selalu setara, sedangkan kompleks teraktivasi berada di bawahnya.'
      ],
      correctIndex: 1,
      explanation:
        'Kompleks teraktivasi selalu berada di puncak bukit energi (energi potensial tertinggi karena struktur ikatan belum stabil). Pada reaksi eksoterm, sistem melepaskan kalor sehingga energi produk berada lebih rendah daripada energi reaktan awal (ΔH < 0).'
    },
    {
      id: 'q2-4',
      question:
        'Mengapa orientasi molekul (faktor sterik) sangat menentukan keberhasilan tumbukan antarpartikel?',
      options: [
        'Karena atom-atom tertentu yang akan membentuk ikatan baru harus saling berhadapan langsung saat terjadi benturan.',
        'Karena orientasi yang salah akan merubah massa jenis partikel dalam larutan.',
        'Karena molekul hanya dapat bertumbukan jika bergerak dalam garis lurus horizontal.',
        'Karena orientasi yang miring akan menyerap energi panas dari larutan.'
      ],
      correctIndex: 0,
      explanation:
        'Reaksi kimia melibatkan pemutusan dan pembentukan ikatan antaratom spesifik. Jika posisi sudut molekul tidak tepat (misal atom yang seharusnya berikatan terhalang oleh gugus lain), tumbukan hanya akan bersifat lenting sempurna di mana molekul memantul kembali tanpa terjadi pertukaran elektron.'
    },
    {
      id: 'q2-5',
      question:
        'Perhatikan diagram profil energi. Jika ditambahkan katalis, bagian manakah pada kurva energi potensial yang mengalami perubahan?',
      options: [
        'Energi keadaan awal reaktan (H reaktan).',
        'Energi keadaan akhir produk (H produk).',
        'Ketinggian puncak bukit energi (Energi Aktivasi, Ea).',
        'Nilai perubahan entalpi reaksi total (ΔH).'
      ],
      correctIndex: 2,
      explanation:
        'Katalis hanya menurunkan ketinggian puncak energi aktivasi (E<sub>a</sub>) dengan cara membuka mekanisme reaksi baru. Katalis sama sekali tidak mengubah tingkat energi reaktan awal, energi produk akhir, maupun nilai entalpi reaksi total (ΔH = H<sub>produk</sub> − H<sub>reaktan</sub>).'
    }
  ],
  'makroskopis-fenomena': [
    {
      id: 'q3-1',
      question:
        'Pada reaksi antara pualam kalsium karbonat (CaCO₃) dan larutan asam klorida (HCl), gejala makroskopis langsung yang membuktikan terjadinya reaksi adalah...',
      options: [
        'Munculnya endapan berwarna biru pekat di dasar tabung reaksi.',
        'Pelepasan desisan dan gelembung gas karbon dioksida (CO₂) yang meluap pada larutan.',
        'Larutan berubah warna menjadi merah muda terang tanpa adanya gas.',
        'Massa tabung reaksi tertutup menyusut drastis hingga setengahnya.'
      ],
      correctIndex: 1,
      explanation:
        'Persamaan reaksi: CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g). Bukti makroskopis nyata yang kasat mata adalah timbulnya luapan gelembung gas CO₂ yang mendesis dan pemuaian balon penampung yang dipasang di mulut tabung reaksi.'
    },
    {
      id: 'q3-2',
      question:
        'Jika reaksi pembentukan gas CO₂ dari CaCO₃ dan HCl dilakukan dalam labu erlenmeyer terbuka di atas timbangan digital, apa yang teramati pada jarum neraca seiring berjalannya waktu?',
      options: [
        'Angka timbangan bertambah karena molekul CaCl₂ yang terbentuk lebih berat dari CaCO₃.',
        'Angka timbangan tetap konstan sempurna karena hukum kekekalan massa Lavoisier.',
        'Angka timbangan berkurang secara bertahap karena gas CO₂ terlepas ke udara bebas.',
        'Angka timbangan berfluktuasi naik turun secara acak seiring gelembung pecah.'
      ],
      correctIndex: 2,
      explanation:
        'Karena wadah reaksi dalam keadaan terbuka, gas CO₂ yang dihasilkan akan terbang bebas meninggalkan sistem. Berkurangnya massa sistem per detik (−Δm/Δt) dapat diukur secara presisi sebagai representasi makroskopis laju reaksi.'
    },
    {
      id: 'q3-3',
      question:
        'Perhatikan kurva volume gas CO₂ terhadap waktu. Mengapa kemiringan kurva paling curam di awal reaksi dan melandai hingga mendatar di akhir reaksi?',
      options: [
        'Karena suhu larutan berangsur-angsur mendingin secara ekstrem di akhir reaksi.',
        'Karena konsentrasi reaktan maksimum di awal sehingga laju tertinggi, lalu reaktan berkurang hingga habis.',
        'Karena gas CO₂ yang dihasilkan menekan reaktan agar berhenti bertumbukan.',
        'Karena luas permukaan pualam bertambah luas seiring larutnya marmer.'
      ],
      correctIndex: 1,
      explanation:
        'Di awal reaksi, jumlah partikel reaktan (CaCO₃ dan HCl) masih utuh dan konsentrasi HCl maksimal, menghasilkan frekuensi tumbukan tertinggi (kemiringan kurva sangat curam). Seiring waktu, konsentrasi HCl berkurang sehingga frekuensi tumbukan turun, hingga kurva mendatar saat reaktan habis bereaksi.'
    },
    {
      id: 'q3-4',
      question:
        'Kembang api meledak menghasilkan kilatan cahaya dan bunyi dentuman dalam waktu kurang dari satu detik, sementara pagar besi berkarat memerlukan waktu berbulan-bulan. Hal ini menunjukkan bahwa...',
      options: [
        'Semua reaksi kimia memiliki konstanta laju yang sama jika berada di udara terbuka.',
        'Laju reaksi kimia sangat bervariasi bergantung pada sifat alami ikatan pereaksi dan energi aktivasinya.',
        'Reaksi perkaratan besi bukanlah reaksi kimia melainkan murni perubahan fisika.',
        'Kembang api tidak memerlukan oksigen untuk bereaksi secara makroskopis.'
      ],
      correctIndex: 1,
      explanation:
        'Sifat alami zat dan struktur ikatan pereaksi sangat memengaruhi besarnya Energi Aktivasi (E<sub>a</sub>). Serbuk mesiu kembang api memiliki ikatan kimia yang mudah terurai dan bereaksi sangat eksoterm dalam sekejap (laju sangat tinggi), sedangkan oksidasi besi memerlukan E<sub>a</sub> yang lebih tinggi pada suhu ruang (laju lambat).'
    },
    {
      id: 'q3-5',
      question:
        'Mengapa susu segar dan makanan cepat saji menjadi cepat basi dan berbau asam jika dibiarkan di atas meja ruangan tropis dibandingkan di dalam kulkas?',
      options: [
        'Karena pada suhu ruang (28°C - 30°C), bakteri pembusuk mengalami peningkatan laju metabolisme enzimatik akibat tingginya energi kinetik.',
        'Karena kulkas membunuh 100% bakteri pembusuk secara kimiawi.',
        'Karena di dalam kulkas tidak terdapat molekul oksigen untuk reaksi oksidasi makanan.',
        'Karena wadah di kulkas mengalami penurunan luas bidang sentuh secara mikroskopis.'
      ],
      correctIndex: 0,
      explanation:
        'Reaksi biokimia pembusukan makanan dikatalisis oleh enzim bakteri. Di suhu ruang yang hangat, energi kinetik partikel tinggi sehingga reaksi pembusukan berjalan pesat. Menurunkan suhu ke ~4°C di lemari es memperlambat energi kinetik dan laju reaksi biokimia bakteri secara drastis.'
    }
  ]
}

