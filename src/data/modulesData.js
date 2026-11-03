/**
 * Data materi pembelajaran kimia kelas XI Fase F: Laju Reaksi
 * Sesuai PRD.md & AGENTS.md: Data dipisahkan dari tampilan di src/data/
 * Notasi kimia menggunakan format subskrip/superskrip baku.
 */

export const MODULES_DATA = [
  {
    id: 'faktor-laju',
    number: '01',
    badge: 'Modul 01',
    title: 'Faktor-Faktor Laju Reaksi',
    subtitle: 'Pengaruh Suhu, Luas Permukaan, Konsentrasi, dan Katalis',
    category: 'Kinetika Kimia',
    accentColor: 'emerald',
    estimatedTime: '20 Menit',
    totalActivities: 3,
    description:
      'Pelajari bagaimana perubahan konsentrasi reaktan, luas bidang sentuh, temperatur sistem, dan keberadaan katalis memengaruhi frekuensi tumbukan serta kecepatan berlangsungnya reaksi kimia.',
    sampleReaction: {
      reactants: [
        { coeff: '2', formula: 'HCl', state: 'aq' },
        { coeff: '1', formula: 'Na', sub: '2', formulaAfter: 'S', sub2: '2', formulaAfter2: 'O', sub3: '3', state: 'aq' }
      ],
      products: [
        { coeff: '2', formula: 'NaCl', state: 'aq' },
        { coeff: '1', formula: 'SO', sub: '2', state: 'g' },
        { coeff: '1', formula: 'S', state: 's' },
        { coeff: '1', formula: 'H', sub: '2', formulaAfter: 'O', state: 'l' }
      ],
      equationText: '2HCl(aq) + Na₂S₂O₃(aq) → 2NaCl(aq) + SO₂(g) + S(s) + H₂O(l)'
    },
    formulaBadges: [
      {
        label: 'Persamaan Laju',
        formulaParts: [
          { text: 'v = k [A]' },
          { sup: 'm' },
          { text: ' [B]' },
          { sup: 'n' }
        ]
      },
      {
        label: 'Pengaruh Suhu (ΔT)',
        formulaParts: [
          { text: 'v' },
          { sub: '2' },
          { text: ' = v' },
          { sub: '1' },
          { text: ' × 2' },
          { sup: '(T₂ − T₁) / 10' }
        ]
      },
      {
        label: 'Waktu Reaksi',
        formulaParts: [
          { text: 't' },
          { sub: '2' },
          { text: ' = t' },
          { sub: '1' },
          { text: ' × (½)' },
          { sup: '(T₂ − T₁) / 10' }
        ]
      }
    ],
    keyPoints: [
      'Peningkatan konsentrasi menambah kerapatan partikel per satuan volume, sehingga peluang tumbukan antarpartikel meningkat.',
      'Memperkecil ukuran partikel (menjadi serbuk) memperluas bidang sentuh, membuka lebih banyak area permukaan untuk bertumbukan.',
      'Kenaikan suhu meningkatkan energi kinetik rata-rata partikel, sehingga partikel bergerak lebih cepat dan lebih banyak melampaui energi aktivasi (Ea).',
      'Katalis menyediakan rute reaksi baru dengan energi aktivasi (Ea) lebih rendah tanpa ikut terkonsumsi secara permanen di akhir reaksi.'
    ],
    comprehensiveContent: {
      introduction:
        'Laju reaksi menyatakan laju berkurangnya konsentrasi pereaksi (reaktan) atau laju bertambahnya konsentrasi hasil reaksi (produk) per satuan waktu. Cepat atau lambatnya reaksi berlangsung dikendalikan oleh empat faktor utama.',
      sections: [
        {
          title: '1. Pengaruh Konsentrasi Reaktan',
          explanation:
            'Konsentrasi menyatakan kepekatan partikel zat terlarut dalam suatu larutan. Ketika konsentrasi ditingkatkan (misalnya dari 0,5 M menjadi 2,0 M), jumlah partikel per satuan volume menjadi jauh lebih padat. Secara mikroskopis, partikel yang berdekatan memiliki kemungkinan bertumbukan lebih sering setiap detiknya. Frekuensi tumbukan yang meningkat berbanding lurus dengan peningkatan jumlah tumbukan efektif, sehingga laju reaksi meningkat.',
          notations: ['v ∝ [Reaktan]', 'Kerapatan partikel tinggi → Peluang tumbukan naik'],
          dailyExample:
            'Reaksi pemutih pakaian (larutan NaOCl pekat) membersihkan noda kain jauh lebih cepat dibanding larutan pemutih yang diencerkan dengan banyak air.'
        },
        {
          title: '2. Pengaruh Luas Permukaan Bidang Sentuh',
          explanation:
            'Pada reaksi heterogen (misalnya padatan dengan larutan atau gas), reaksi hanya terjadi di permukaan sentuh zat padat. Jika bongkahan zat padat dipecah menjadi butiran atau serbuk halus, bagian dalam padatan akan terbuka menjadi permukaan baru. Akibatnya, total luas bidang sentuh yang bersentuhan dengan reaktan lain menjadi berlipat ganda, memungkinkan lebih banyak partikel bereaksi secara simultan.',
          notations: ['Luas serbuk > Luas bongkahan', 'Laju serbuk > Laju bongkahan'],
          dailyExample:
            'Gula pasir halus lebih cepat larut dalam teh dibandingkan gula batu padat berukuran besar karena luas permukaan gula halus jauh lebih besar.'
        },
        {
          title: '3. Pengaruh Suhu (Temperatur)',
          explanation:
            'Suhu merupakan ukuran energi kinetik rata-rata partikel. Kenaikan suhu sebesar 10°C umumnya melipatgandakan laju reaksi (menjadi 2 hingga 3 kali lebih cepat). Secara mikroskopis, kenaikan suhu membuat partikel bergerak lebih cepat, menghasilkan frekuensi tumbukan yang lebih tinggi. Yang lebih penting, fraksi partikel yang memiliki energi kinetik sama atau lebih besar dari energi aktivasi (Ea) melonjak drastis berdasarkan distribusi Maxwell-Boltzmann.',
          notations: [
            'T naik → Ek naik',
            'v₂ = v₁ × n^((T₂ - T₁) / ΔT)',
            'Fraksi molekul dengan E ≥ Ea meningkat'
          ],
          dailyExample:
            'Daging dan susu disimpan di lemari es (suhu rendah 4°C) agar reaksi pembusukan oleh bakteri melambat secara signifikan, sehingga makanan bertahan berminggu-minggu.'
        },
        {
          title: '4. Pengaruh Katalis',
          explanation:
            'Katalis adalah zat yang mempercepat reaksi kimia tanpa dirinya mengalami perubahan kimiawi permanen di akhir reaksi. Katalis bekerja dengan cara menawarkan mekanisme reaksi alternatif yang memiliki energi aktivasi (Ea) lebih rendah dibanding reaksi tanpa katalis. Akibatnya, pada suhu yang sama, persentase partikel yang energinya mampu melampaui puncak energi aktivasi menjadi jauh lebih banyak.',
          notations: ['Ea (dengan katalis) < Ea (tanpa katalis)', 'Katalis tidak mengubah ΔH reaksi'],
          dailyExample:
            'Enzim ptialin (amilase) dalam air liur manusia bertindak sebagai biokatalis yang memecah amilum menjadi maltosa dalam hitungan detik di dalam mulut.'
        }
      ]
    },
    poeScenario: {
      type: 'faktor-laju',
      question:
        'Jika konsentrasi asam klorida (HCl) dinaikkan dari 0,5 M ke 2,0 M dan suhunya dinaikkan dari 25°C ke 50°C, apa yang akan terjadi pada tumbukan mikroskopis partikel dan laju reaksinya?',
      predictions: [
        {
          id: 'p1',
          text: 'Laju reaksi meningkat drastis karena kerapatan partikel bertambah dan energi kinetik partikel meningkat, sehingga frekuensi tumbukan efektif melonjak.',
          isCorrect: true
        },
        {
          id: 'p2',
          text: 'Laju reaksi melambat karena partikel yang terlalu padat saling menghalangi jalan tumbukan satu sama lain.',
          isCorrect: false
        },
        {
          id: 'p3',
          text: 'Hanya konsentrasi yang berpengaruh, sedangkan kenaikan suhu tidak mengubah energi kinetik partikel.',
          isCorrect: false
        }
      ],
      explanationPoe:
        'Peningkatan konsentrasi (0,5 M → 2,0 M) menambah kerapatan partikel per volume wadah, melipatgandakan peluang terjadinya tumbukan. Kenaikan suhu (25°C → 50°C) meningkatkan energi kinetik rata-rata partikel, sehingga partikel bergerak lebih cepat dan lebih banyak tumbukan yang memiliki energi melebihi E<sub>a</sub>. Gabungan kedua faktor ini menyebabkan laju reaksi melonjak secara eksponensial!'
    }
  },
  {
    id: 'teori-tumbukan',
    number: '02',
    badge: 'Modul 02',
    title: 'Teori Tumbukan & Energi Aktivasi',
    subtitle: 'Syarat Tumbukan Efektif, Orientasi Molekul, dan Profil Energi Reaksi',
    category: 'Mekanisme Reaksi',
    accentColor: 'amber',
    estimatedTime: '25 Menit',
    totalActivities: 3,
    description:
      'Bedah secara mikroskopis syarat terjadinya reaksi kimia: frekuensi tumbukan, orientasi ruang partikel yang tepat, dan energi kinetik minimum untuk melampaui Energi Aktivasi (E<sub>a</sub>).',
    sampleReaction: {
      reactants: [
        { coeff: '2', formula: 'NO', state: 'g' },
        { coeff: '1', formula: 'O', sub: '2', state: 'g' }
      ],
      products: [
        { coeff: '2', formula: 'NO', sub: '2', state: 'g' }
      ],
      equationText: '2NO(g) + O₂(g) → 2NO₂(g)'
    },
    formulaBadges: [
      {
        label: 'Persamaan Arrhenius',
        formulaParts: [
          { text: 'k = A × e' },
          { sup: '−Ea / (R × T)' }
        ]
      },
      {
        label: 'Energi Aktivasi',
        formulaParts: [
          { text: 'E' },
          { sub: 'a' },
          { text: ' = E' },
          { sub: 'kompleks' },
          { text: ' − E' },
          { sub: 'reaktan' }
        ]
      },
      {
        label: 'Tumbukan Efektif',
        formulaParts: [
          { text: 'Laju = Z × f × p (Z: frekuensi, f: fraksi energi ≥ E' },
          { sub: 'a' },
          { text: ', p: faktor orientasi)' }
        ]
      }
    ],
    keyPoints: [
      'Tidak setiap tumbukan antarpartikel menghasilkan reaksi kimia; hanya tumbukan efektif yang menghasilkan produk.',
      'Dua syarat mutlak tumbukan efektif: memiliki energi kinetik ≥ Energi Aktivasi (Ea) dan memiliki orientasi spasial (sudut benturan) yang tepat.',
      'Energi Aktivasi (Ea) adalah energi kinetik minimum yang harus dimiliki molekul pereaksi untuk mencapai keadaan transisi (kompleks teraktivasi).',
      'Kurva distribusi Maxwell-Boltzmann menggambarkan fraksi molekul yang memiliki energi cukup untuk melampaui Ea pada temperatur tertentu.'
    ],
    comprehensiveContent: {
      introduction:
        'Menurut Teori Tumbukan (Collision Theory) yang dikemukakan oleh Max Trautz dan William Lewis, reaksi kimia berlangsung ketika molekul pereaksi saling bertumbukan. Namun, dari miliaran tumbukan per detik, hanya sebagian kecil yang berhasil menghasilkan ikatan baru.',
      sections: [
        {
          title: '1. Hakikat Tumbukan Efektif',
          explanation:
            'Tumbukan efektif adalah tumbukan antarpartikel reaktan yang berhasil memutuskan ikatan kimia lama dan membentuk ikatan kimia baru menghasilkan produk. Agar tumbukan efektif dapat terjadi, harus terpenuhi dua kriteria mendasar secara simultan: (1) Energi kinetik partikel yang bertumbukan harus cukup besar untuk mengatasi gaya tolak menolak elektron dan memutuskan ikatan (E ≥ Ea), dan (2) Partikel harus bertumbukan dengan orientasi geometri yang tepat.',
          notations: ['Syarat 1: E_kinetik ≥ E_a', 'Syarat 2: Orientasi ruang tepat'],
          dailyExample:
            'Mengunci pintu: Kunci harus diarahkan dengan posisi pas (orientasi tepat) dan didorong dengan tenaga yang cukup (energi melampaui Ea) agar grendel pintu terbuka.'
        },
        {
          title: '2. Orientasi Tumbukan yang Tepat (Steric Factor)',
          explanation:
            'Molekul bukanlah bola titik tanpa arah; molekul memiliki bentuk tiga dimensi. Misalnya pada reaksi antara molekul gas NO dan O3 menghasilkan NO2 dan O2: atom nitrogen pada NO harus bertumbukan langsung ke atom oksigen terminal pada O3. Jika molekul bertumbukan dengan posisi atom oksigen bertemu atom oksigen, ikatan N−O baru tidak akan terbentuk dan kedua molekul hanya akan memantul kembali tanpa bereaksi.',
          notations: ['Orientasi tepat → Terbentuk ikatan baru', 'Orientasi keliru → Memantul kembali (tidak bereaksi)'],
          dailyExample:
            'Dua pemain sepak bola menyundul bola: jika kepala membentur bola dari sudut yang tepat, bola akan terarah ke gawang; jika menyenggol pelipis dari sudut miring, bola melenceng.'
        },
        {
          title: '3. Konsep Energi Aktivasi (Ea) & Kompleks Teraktivasi',
          explanation:
            'Energi Aktivasi (Ea) dianalogikan sebagai "bukit energi" yang harus didaki oleh molekul reaktan. Saat reaktan bertumbukan dengan energi yang cukup, ikatan lama mulai meregang dan melemah, sementara ikatan baru mulai terbentuk secara parsial. Keadaan puncak berenergi tinggi yang sangat tidak stabil ini disebut keadaan transisi atau kompleks teraktivasi. Begitu kompleks ini terbentuk, molekul akan meluncur turun membentuk produk yang stabil.',
          notations: [
            'Ea = E(kompleks teraktivasi) − E(reaktan)',
            'Reaksi eksoterm: H_produk < H_reaktan (ΔH < 0)',
            'Reaksi endoterm: H_produk > H_reaktan (ΔH > 0)'
          ],
          dailyExample:
            'Korek api kayu: Kepala korek api tidak akan menyala sendiri di udara (memerlukan gesekan untuk menghasilkan panas yang melampaui Ea gesekan), namun begitu digesek, nyala api terus berlanjut.'
        },
        {
          title: '4. Cara Katalis Mengubah Kurva Profil Energi',
          explanation:
            'Katalis tidak meningkatkan energi kinetik partikel, dan katalis juga tidak mengubah perubahan entalpi (ΔH) reaksi. Katalis menurunkan "ketinggian bukit" dengan membentuk senyawa perantara (intermedier) baru yang energinya lebih rendah. Akibatnya, pada suhu yang sama, jumlah partikel yang energinya mampu melintasi puncak Ea menjadi jauh lebih melimpah.',
          notations: [
            'Ea_katalis < Ea_tanpa_katalis',
            'ΔH reaksi tetap konstan',
            'Konstanta laju (k) melonjak'
          ],
          dailyExample:
            'Terowongan tembus bukit: Daripada mendaki bukit tinggi yang curam (reaksi tanpa katalis), katalis membuka jalan terowongan berenergi rendah sehingga kendaraan (partikel) lewat dengan cepat.'
        }
      ]
    },
    poeScenario: {
      type: 'teori-tumbukan',
      question:
        'Dua partikel gas A dan B bertumbukan pada sudut yang tepat, namun energi kinetik total keduanya hanya 35 kJ/mol, sedangkan Energi Aktivasi (Ea) reaksi adalah 60 kJ/mol. Apa hasil dari tumbukan ini?',
      predictions: [
        {
          id: 'p1',
          text: 'Kedua partikel memantul kembali tanpa bereaksi karena energi kinetik (35 kJ/mol) belum mampu melampaui Energi Aktivasi (60 kJ/mol).',
          isCorrect: true
        },
        {
          id: 'p2',
          text: 'Reaksi tetap berlangsung sempurna karena orientasi sudutnya sudah tepat.',
          isCorrect: false
        },
        {
          id: 'p3',
          text: 'Energi kinetik akan otomatis bertambah saat terjadi benturan sehingga produk tetap terbentuk.',
          isCorrect: false
        }
      ],
      explanationPoe:
        'Tepat sekali! Orientasi yang tepat hanyalah salah satu syarat. Partikel wajib memiliki energi kinetik minimal sama dengan atau melebihi Energi Aktivasi (E<sub>a</sub> = 60 kJ/mol). Karena energinya hanya 35 kJ/mol, partikel tidak sanggup mencapai keadaan transisi (kompleks teraktivasi) dan akan memantul kembali secara elastis tanpa terjadi reaksi kimia.'
    }
  },
  {
    id: 'makroskopis-fenomena',
    number: '03',
    badge: 'Modul 03',
    title: 'Tampilan Makroskopis & Fenomena Laju',
    subtitle: 'Pengamatan Nyata Produksi Gas, Perubahan Massa, Warna, dan Penerapan Sehari-hari',
    category: 'Fenomena & Aplikasi',
    accentColor: 'indigo',
    estimatedTime: '20 Menit',
    totalActivities: 3,
    description:
      'Hubungkan dunia mikroskopis partikel dengan bukti makroskopis yang dapat diamati: laju pembentukan gelembung gas CO<sub>2</sub>, pemuaian balon, perubahan massa reaktan, dan fenomena laju dalam industri serta kehidupan.',
    sampleReaction: {
      reactants: [
        { coeff: '1', formula: 'CaCO', sub: '3', state: 's' },
        { coeff: '2', formula: 'HCl', state: 'aq' }
      ],
      products: [
        { coeff: '1', formula: 'CaCl', sub: '2', state: 'aq' },
        { coeff: '1', formula: 'H', sub: '2', formulaAfter: 'O', state: 'l' },
        { coeff: '1', formula: 'CO', sub: '2', state: 'g' }
      ],
      equationText: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)'
    },
    formulaBadges: [
      {
        label: 'Laju Pembentukan Gas',
        formulaParts: [
          { text: 'v = ΔV(CO' },
          { sub: '2' },
          { text: ') / Δt (mL/detik)' }
        ]
      },
      {
        label: 'Laju Pengurangan Massa',
        formulaParts: [
          { text: 'v = −Δm(CaCO' },
          { sub: '3' },
          { text: ') / Δt' }
        ]
      },
      {
        label: 'Laju Berdasarkan Konsentrasi',
        formulaParts: [
          { text: 'v = −Δ[HCl] / (2 × Δt) = +Δ[CO' },
          { sub: '2' },
          { text: '] / Δt' }
        ]
      }
    ],
    keyPoints: [
      'Gejala makroskopis laju reaksi dapat diamati langsung dari pembentukan gelembung gas, perubahan warna, pembentukan endapan, kenaikan temperatur, atau pengurangan massa sistem terbuka.',
      'Reaksi pualam CaCO₃ dengan larutan HCl menghasilkan gas CO₂ yang dapat diukur menggunakan labu erlenmeyer tertutup bersambung buret gas atau balon elastis.',
      'Grafik volume gas terhadap waktu menunjukkan kemiringan (gradien) paling curam di awal reaksi dan mendatar ketika reaktan pembatas telah habis bereaksi.',
      'Fenomena laju reaksi hadir dalam pengolahan pangan, industri pupuk (proses Haber-Bosch), katalis knalpot kendaraan bermotor (catalytic converter), dan pencegahan korosi.'
    ],
    comprehensiveContent: {
      introduction:
        'Siswa sering kali kesulitan mengaitkan rumus kinetika dengan dunia nyata karena partikel tidak kasat mata. Tingkat makroskopis adalah jembatan nyata yang membuktikan terjadinya reaksi: kita dapat melihat gelembung meletup, warna cairan berganti, atau jarum timbangan yang menyusut seiring bertambahnya waktu reaksi.',
      sections: [
        {
          title: '1. Pengamatan Makroskopis Pembentukan Gas CO₂',
          explanation:
            'Pada reaksi antara kalsium karbonat padat (CaCO3) dan larutan asam klorida (HCl), produk yang dihasilkan berupa gas karbon dioksida (CO2). Tampilan makroskopisnya berupa desisan dan rentetan gelembung gas yang meluap di dalam larutan. Jika tabung reaksi dihubungkan ke balon elastis atau buret gas, balon akan mengembang seiring bertambahnya volume gas per detik.',
          notations: [
            'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
            'Laju pembentukan gas = dV/dt (gradien kurva V vs t)'
          ],
          dailyExample:
            'Tablet antasida atau tablet vitamin C effervescent yang dicelupkan ke dalam air langsung menghasilkan gelembung gas karbon dioksida berbusa dengan cepat.'
        },
        {
          title: '2. Pengukuran Laju Lewat Pengurangan Massa Sistem',
          explanation:
            'Jika labu erlenmeyer berisi CaCO3 dan HCl diletakkan di atas neraca analitis digital tanpa tutup kedap, gas CO2 yang terbentuk akan lepas ke udara bebas. Akibatnya, angka timbangan akan terus menyusut. Pengurangan massa sistem per satuan waktu (−Δm/Δt) merepresentasikan laju pelepasan gas CO2 secara kuantitatif.',
          notations: ['Δm sistem = massa gas CO₂ yang lepas ke udara', 'v = (m₀ − m_t) / t'],
          dailyExample:
            'Kue bolu yang dipanggang mengembang dan bobot adonan berkurang sedikit karena gas CO2 dari baking powder (natrium bikarbonat) menguap ke udara.'
        },
        {
          title: '3. Analisis Kurva Makroskopis Laju Reaksi',
          explanation:
            'Jika kita memplot volume gas CO2 yang terbentuk terhadap waktu (t), diperoleh kurva yang awalnya sangat curam, kemudian melandai secara bertahap, dan akhirnya horizontal (datar). Kurva curam di awal karena konsentrasi reaktan masih maksimum. Seiring berjalannya reaksi, reaktan makin berkurang sehingga laju melambat, hingga akhirnya berhenti saat reaktan pembatas habis bereaksi.',
          notations: ['Kemiringan awal = Laju sesaat awal (v₀)', 'Kurva mendatar = Reaksi tuntas (reaktan habis)'],
          dailyExample:
            'Lilin menyala dengan kobaran stabil, namun saat oksigen dalam sungkup mulai menipis, nyala lilin meredup perlahan hingga padam total.'
        },
        {
          title: '4. Penerapan Kontrol Laju Reaksi dalam Kehidupan & Industri',
          explanation:
            'Dalam dunia nyata, pemahaman laju reaksi diterapkan untuk dua tujuan: mempercepat reaksi yang menguntungkan dan memperlambat reaksi yang merugikan. Reaksi sintesis amonia (NH3) pada Proses Haber-Bosch dipercepat menggunakan katalis serbuk besi (Fe) dan suhu optimal 450°C. Sebaliknya, korosi besi (perkaratan) diperlambat dengan mengecat atau melapisi logam dengan seng (galvanisasi).',
          notations: [
            'Proses Haber-Bosch: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (Katalis Fe)',
            'Katalis konverter mobil: 2CO(g) + 2NO(g) → 2CO₂(g) + N₂(g) (Katalis Pt/Rh)'
          ],
          dailyExample:
            'Knalpot mobil modern dilengkapi konverter katalitik logam platina-rodium yang mengubah gas racun CO dan NO menjadi CO2 dan N2 yang tidak beracun dalam hitungan milidetik sebelum keluar knalpot.'
        }
      ]
    },
    poeScenario: {
      type: 'makroskopis-fenomena',
      question:
        'Dua wadah diisi 50 mL larutan HCl 1,0 M. Wadah A dimasukkan 5 gram kepingan batu marmer utuh (CaCO₃), sedangkan Wadah B dimasukkan 5 gram serbuk halus marmer (CaCO₃). Apa yang tampak secara makroskopis pada kedua wadah dalam 30 detik pertama?',
      predictions: [
        {
          id: 'p1',
          text: 'Wadah B (serbuk) langsung menghasilkan luapan gelembung gas CO₂ yang sangat deras dan balon mengembang cepat, sedangkan wadah A gelembungnya muncul perlahan.',
          isCorrect: true
        },
        {
          id: 'p2',
          text: 'Wadah A menghasilkan gas lebih banyak karena kepingan marmer utuh memiliki massa yang lebih padat dibanding serbuk.',
          isCorrect: false
        },
        {
          id: 'p3',
          text: 'Kedua wadah menghasilkan gelembung gas dengan kecepatan yang persis sama karena massa marmer dan volume asamnya sama-sama 5 gram dan 50 mL.',
          isCorrect: false
        }
      ],
      explanationPoe:
        'Tepat sekali! Meskipun massa marmer sama (5 gram), serbuk halus marmer pada Wadah B memiliki total luas bidang sentuh yang jauh lebih luas. Larutan HCl dapat bersentuhan secara bersamaan dengan jutaan butir partikel marmer, menghasilkan desisan deras dan lonjakan volume gas CO<sub>2</sub> dalam waktu singkat!'
    }
  }
]

