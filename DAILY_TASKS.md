# Daily Tasks — Myvelora Store

## 2026-11-18

### Target Selesai
- [x] **Perbaikan Hapus Placeholder Customer Reviews**:
  - Mengidentifikasi bug di mana jika tabel database `customer_reviews` kosong, sistem secara paksa memuat data tiruan `MOCK_REVIEWS` (`if (allReviews.length === 0) allReviews = MOCK_REVIEWS`). Akibatnya placeholder WhatsApp review muncul kembali setiap kali halaman direfresh dan tidak bisa dihapus permanen.
  - Memperbaiki [`src/app/admin/(dashboard)/reviews/page.tsx`](file:///d:/project%20web/myvelorastore/src/app/admin/(dashboard)/reviews/page.tsx) dan [`src/lib/queries.ts`](file:///d:/project%20web/myvelorastore/src/lib/queries.ts) agar membaca murni data riil dari database.
  - Jika tabel ulasan kosong, panel admin menampilkan *empty state* bersih dengan tombol "+ Add WhatsApp Review", dan storefront menyembunyikan section ulasan sampai admin mengunggah ulasan nyata.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0) dan `npm run lint` 0 errors.
- [x] **Penerapan Aturan Bisnis Stok: Stok Dikunci & Hanya Berkurang Saat Diverifikasi Admin**:
  - Mengubah logika pengurangan stok di [`src/app/actions/checkout.ts`](file:///d:/project%20web/myvelorastore/src/app/actions/checkout.ts): Checkout pelanggan (`pending_payment`) **tidak lagi memotong stok fisik**. Stok tetap utuh selama pesanan belum diverifikasi admin.
  - Memindahkan logika pemotongan stok ke [`src/app/actions/admin-orders.ts`](file:///d:/project%20web/myvelorastore/src/app/actions/admin-orders.ts): Stok fisik **hanya dipotong saat Admin mengubah status pesanan menjadi `verified`**.
  - Mengatur mekanisme pembatalan (*cancellation*): Jika pesanan dibatalkan sebelum verifikasi, stok tidak terpengaruh; jika dibatalkan setelah diverifikasi, stok dipulihkan secara otomatis dan aman (idempoten via `stockRestoredAt`).
  - Mengubah stok awal produk ENHYPEN Light Stick di database dari 25 menjadi **10 unit**.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0) dan `npm run lint` 0 errors, 0 warnings.
- [x] **Tes Upload Produk Nyata dari Web Eksternal (KSpace Project)**:
  - Berhasil mengekstrak data dari `https://www.kspaceproject.com/products/enhypen-official-light-stick`.
  - Mengunggah foto resmi produk resolusi tinggi ke IDCloudHost S3 bucket `velora`: `https://is3.cloudhost.id/velora/products/enhypen-official-light-stick-ver-2-1794941310329.png`.
  - Menerapkan **MYVELORA STORE — PRICING RULES**:
    - Sumber: €83.95 EUR (kurs EUR-MYR ~ 4.50) → Potongan 20% → Dibulatkan ke bawah (FLOOR) → **RM 302**.
  - Mengunggah produk lengkap ke PostgreSQL:
    - Nama: *ENHYPEN - Official Light Stick Ver.2 (Renewal Edition)*
    - Kategori: *Lightstick*
    - Varian: *Ver.2 Renewal Edition* (Harga: **RM 302**, Stok: 25 unit).
- [x] **Penerapan Paten & Engine Kalkulator Myvelora Pricing Rules (Commit `902cb75`)**:
  - Menyusun dokumen paten [`_build_plan/pricing-rules.md`](file:///d:/project%20web/myvelorastore/_build_plan/pricing-rules.md).
  - Mengimplementasikan modul kalkulator [`src/lib/pricing-calculator.ts`](file:///d:/project%20web/myvelorastore/src/lib/pricing-calculator.ts) dengan kurs acuan USD 4.086165, diskon tunggal 20%, dan pembulatan `Math.floor`.
- [x] **Validasi & Aktivasi Kredensial IDCloudHost S3 Object Storage**:
  - Mengidentifikasi typo pada Access Key ID sebelumnya (`51C1MYLQVTHQPFWFIZM3` vs nilai asli `51C1MYLQVTHQPEWEIZM3` dari dashboard IDCloudHost).
  - Melakukan uji coba koneksi langsung via AWS SDK S3:
    - `ListBuckets` sukses mendeteksi bucket `velora`.
    - `PutObject` sukses mengunggah file ke bucket `velora` dengan ETag valid.
  - Memperbarui konfigurasi `.env` lokal dengan Access Key ID dan Secret Key yang 100% valid dan aktif.
- [x] **Dukungan Multi-Photo per Versi Produk & Upload Resilient Dev Fallback (Commit `77413bb`)**:
  - Menambahkan selector & uploader foto mandiri pada tiap varian versi produk di [`src/components/admin/product-editor/version-builder-card.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/product-editor/version-builder-card.tsx).
  - Menambahkan fallback Data URL WebP otomatis di [`src/app/actions/upload.ts`](file:///d:/project%20web/myvelorastore/src/app/actions/upload.ts) saat pengembangan lokal tanpa konfigurasi S3.
  - Verifikasi: `npx tsc --noEmit` EXIT=0 dan `npm run lint` 0 errors.
- [x] **Dekomposisi Total Monolitik Menjadi Sub-Komponen Modular (Commit `1c7e99c`)**:
  - Mengeliminasi file monolitik 800+ baris pada panel admin ([`settings-manager.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/settings-manager.tsx) dan [`product-editor.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/product-editor.tsx)) menjadi arsitektur sub-komponen kecil (50–160 baris per file).
  - **Folder `src/components/admin/settings/`**:
    - `hero-banner-tab.tsx` (164 baris) — Pratinjau banner 16:9 & input headline
    - `shipping-tab.tsx` (60 baris) — Tarif flat RM & threshold free shipping
    - `payment-tab.tsx` (168 baris) — Rekening bank & upload barcode DuitNow QR
    - `contact-bot-tab.tsx` (112 baris) — WhatsApp admin & token Telegram bot
    - `faq-policy-tab.tsx` (110 baris) — FAQ dinamis & teks kebijakan retur
    - `brand-logo-tab.tsx` (88 baris) — Upload logo master SVG/PNG
    - `settings-manager.tsx` kini hanya berupa orchestrator bersih berorientasi penuh
  - **Folder `src/components/admin/product-editor/`**:
    - `product-info-card.tsx` (120 baris) — Nama, artis, kategori, auto-slug, deskripsi
    - `version-builder-card.tsx` (144 baris) — Varian, input harga RM, SKU, stok fisik
    - `bundle-option-card.tsx` (70 baris) — Full set bundle & dynamic linked inventory
    - `preorder-card.tsx` (84 baris) — Switch PO, deadline kalender, kuota open/finite
    - `photo-uploader-card.tsx` (80 baris) — Pratinjau 1:1 square & upload WebP S3
    - `visibility-card.tsx` (51 baris) — Switch Published, New Arrival, Best Seller
    - `summary-card.tsx` (52 baris) — Ringkasan total stok, rentang harga, tombol simpan
  - Verifikasi: `npx tsc --noEmit` dan `npm run lint` 100% lolos (0 errors, 0 warnings).
- [x] **Refactoring Modular Halaman Produk Admin (Commit `f0e2f46`)**:
  - Menghilangkan anti-pattern monolitik sebelumnya di mana form tambah/edit produk, builder versi multi-varian, kompresi gambar, dan pengaturan pre-order dipaksakan dalam satu file raksasa 1.400+ baris dan pop-up dialog melayang (`DialogContent max-h-[92vh]`).
  - Memecah arsitektur produk menjadi halaman mandiri (*dedicated pages*) sesuai standar Next.js 16:
    - Rute `/admin/products/new`: Halaman khusus tambah produk K-pop baru berlayar penuh (*full-width grid*).
    - Rute `/admin/products/[id]`: Halaman khusus edit data produk & varian.
    - Komponen mandiri [`src/components/admin/product-editor.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/product-editor.tsx): Editor form yang bersih, terpisah, dengan alur 3 langkah dan ringkasan sticky.
    - Halaman katalog utama [`src/components/admin/products-manager.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/products-manager.tsx) dipangkas dari 1.442 baris menjadi ~430 baris bersih, fokus pada manajemen daftar dan stok.
  - Memastikan validasi `npx tsc --noEmit` dan `npm run lint` 100% bersih (0 errors, 0 warnings).
- [x] **Perbaikan Layout Admin Tabs Terhimpit/Mengecil (Commit `85c5cf9`)**:
  - Memperbaiki komponen [`src/components/ui/tabs.tsx`](file:///d:/project%20web/myvelorastore/src/components/ui/tabs.tsx) yang sebelumnya menggunakan `flex gap-2 data-horizontal:flex-col` sehingga dirender sebagai `flex-row` menyamping di browser (menyebabkan daftar tab di kiri dan kartu konten di kanan terdesak menjadi kolom sempit).
  - Mengubah orientasi bawaan menjadi `flex flex-col gap-4 w-full`, memperluas `TabsContent` menjadi `w-full`, serta menambahkan dukungan styling `data-active` pada `TabsTrigger` di [`src/components/admin/settings-manager.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/settings-manager.tsx).
  - Tampilan pengaturan toko (`/admin/settings`) kini tampil normal, proporsional, dan lebar penuh (full-width 100%).
- [x] **Penyempurnaan Arsitektur Upload S3 & Sinkronisasi dengan Standar IDCloudHost (Commit `478d55a`)**:
  - **Dukungan Alias Environtment Variables & IDCloudHost Fallback**: Mengadopsi standar multi-proyek (`PROKICK MY` & `kamera pung lallang`) pada [`src/lib/s3.ts`](file:///d:/project%20web/myvelorastore/src/lib/s3.ts) sehingga membaca otomatis `S3_ACCESS_KEY_ID` / `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY` / `S3_SECRET_KEY`, dan `S3_BUCKET` / `S3_BUCKET_PUBLIC`.
  - **Ceph Canned ACL Resilient Retry**: Menangani kebijakan ACL Ceph Object Storage IDCloudHost dengan mencoba `ACL: "public-read"` terlebih dahulu, dan secara otomatis melakukan retry tanpa ACL jika storage menolak header Canned ACL, menjamin file selalu berhasil tersimpan tanpa error `403/400`.
  - **Upload QRIS / DuitNow QR & Brand Logo dari Perangkat**: Mengaktifkan tombol upload langsung dari galeri/perangkat pada tab Pengaturan Pembayaran (DuitNow QR / QRIS) dan tab Brand Identity (Logo Master Toko) di [`settings-manager.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/settings-manager.tsx), lengkap dengan pratinjau instan (*live preview*).
  - **Pencegahan Error CORS 100%**: Alur upload gambar di toko (`payment-client.tsx`, `products-manager.tsx`, `settings-manager.tsx`, `reviews-manager.tsx`) mengompresi gambar di browser via HTML5 Canvas (WebP ~100-150KB), lalu mengirimkan ke Next.js Server Action (`uploadImageServerAction`) yang meneruskannya ke S3 backend-to-backend tanpa interaksi CORS browser.
  - **Verifikasi Kualitas**: Lulus validasi `npx tsc --noEmit` (EXIT=0) dan `npm run lint` (0 error).

## 2026-11-17

### Target Selesai
- [x] **Filter Notifikasi Telegram Khusus Bukti Transfer (Commit `e4fd320`)**:
  - Mengubah perilaku dispatcher notifikasi Telegram di [`src/lib/notifications.ts`](file:///d:/project%20web/myvelorastore/src/lib/notifications.ts) dan [`src/app/actions/checkout.ts`](file:///d:/project%20web/myvelorastore/src/app/actions/checkout.ts) agar **hanya** mengirimkan notifikasi saat pembeli mengunggah bukti transfer (`payment_submitted`), menghilangkan notifikasi checkout awal yang belum dibayar.
  - Format pesan Telegram menyajikan detail lengkap: Kode Order, Nama Pembeli (+WA), Tujuan Pengiriman, Rincian Barang, Total RM, dan tautan langsung untuk melihat foto bukti transfer.
- [x] **Arsitektur Upload Gambar Anti-CORS IDCloudHost S3 (Commit `519cc56`)**:
  - Menghilangkan potensi error preflight browser CORS pada bucket baru IDCloudHost Object Storage dengan menerapkan jalur upload Server-Side via Server Action [`src/app/actions/upload.ts`](file:///d:/project%20web/myvelorastore/src/app/actions/upload.ts) dan [`src/lib/s3.ts`](file:///d:/project%20web/myvelorastore/src/lib/s3.ts).
  - Foto tetap dikompresi di browser via HTML5 Canvas (WebP ~100-200KB) sebelum dikirim, menjaga kecepatan upload di mobile.
  - Mengintegrasikan fallback bertingkat (Server-Side Direct S3 -> Presigned PUT -> Local Data URL) pada halaman pembayaran bukti transfer ([`payment-client.tsx`](file:///d:/project%20web/myvelorastore/src/components/storefront/payment-client.tsx)), upload produk admin ([`products-manager.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/products-manager.tsx)), banner toko ([`settings-manager.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/settings-manager.tsx)), dan ulasan WhatsApp ([`reviews-manager.tsx`](file:///d:/project%20web/myvelorastore/src/components/admin/reviews-manager.tsx)).
- [x] **Migrasi Skema & Seeding Database Coolify PostgreSQL 18**:
  - Menghubungkan Drizzle ke database PostgreSQL produksi di Coolify (`157.10.253.46:5432`).
  - Menjalankan migrasi skema `npx drizzle-kit push` yang berhasil membuat tabel: `products`, `product_versions`, `orders`, `order_items`, `customer_reviews`, dan `store_settings`.
  - Menjalankan seeding komprehensif data awal toko: pengaturan toko (brand logo, WhatsApp, Maybank/DuitNow QR, threshold free shipping), seksi ulasan WhatsApp, 10 katalog produk K-pop terpopuler (NewJeans, aespa, IVE, SEVENTEEN, Stray Kids, LE SSERAFIM, TWICE, ENHYPEN, TXT, BLACKPINK) beserta varian, bundle, dan inventaris fisiknya.
  - Mempersiapkan [`Dockerfile`](file:///d:/project%20web/myvelorastore/Dockerfile) dan [`.dockerignore`](file:///d:/project%20web/myvelorastore/.dockerignore) produksi mandiri Next.js 16.4 berbasis Node 22 Alpine untuk deployment otomatis Coolify.
- [x] **Inisialisasi Git & Commit Milestone 1 & 2 (Commit `e28ca83`)**:
  - Menginisialisasi repositori Git lokal dengan branch utama `main`.
  - Mengonfigurasi remote origin ke repositori GitHub: `https://github.com/prokickstore1-maker/velora.git`.
  - Menambahkan pengecualian `!.env.example` pada `.gitignore` agar template environment variables tetap terlacak tanpa membocorkan file credential lokal `.env`.
  - Melakukan staging seluruh 125 file arsitektur proyek (storefront, 5-step checkout, admin panel, sistem stok anti-deadlock & anti-overselling, aset visual banner 2.5K, favicon bundle resmi, serta optimasi mobile 320px).
  - Berhasil membuat commit bersih: `feat: complete milestone 1 & 2 storefront, 5-step checkout, admin panel, and mobile layout` (`e28ca83`).
  - Menyerahkan perintah push ke pengguna sesuai instruksi.
- [x] **Penyempurnaan Total Panel Admin di Layar Ekstra Kecil (320px / iPhone SE Standard)**:
  - **Pemberantasan Text & Button Overflow pada Kartu Produk Admin di [src/components/admin/products-manager.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/products-manager.tsx)**:
    - Mengatasi tombol `Add Version` yang terpotong menjadi `sion` di batas kiri kartu akibat penggunaan `justify-end` pada flexbox yang melebihi lebar kontainer 256px.
    - Mengubah susunan tombol aksi menjadi proporsional: tombol `Edit Product` (`flex-1`), `+ Version` (`shrink-0`), dan tombol hapus (`Trash2`) dengan perataan `justify-start sm:justify-end`.
    - Merestrukturisasi tata letak header produk admin: tombol chevron dibuat kompak di posisi atas samping (`p-1 mt-0.5`), thumbnail foto 48px/56px dengan `shrink-0`, serta slug dan total stok diberikan `break-all line-clamp-2` agar tidak mendistorsi lebar kartu.
  - **Header & Sidebar Admin Responsif Collapsible di [src/components/admin/admin-sidebar.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/admin-sidebar.tsx) & [src/app/admin/(dashboard)/layout.tsx](file:///d:/project%20web/myvelorastore/src/app/admin/(dashboard)/layout.tsx)**:
    - Mengganti sidebar statis yang sebelumnya memakan tinggi 300px di layar mobile menjadi navigation bar collapsible modern dengan tombol toggle hamburger (`Menu` / `X`).
    - Menyesuaikan padding konten admin utama menjadi `p-3.5 sm:p-8` agar kartu memiliki ruang horizontal yang nyaman pada layar 320px.

## 2026-11-16

### Target Selesai
- [x] **Penyempurnaan Total Tata Letak Responsif Mobile Layar Ekstra Kecil (320px / iPhone SE Standard)**:
  - **Pencegahan Global Horizontal Viewport Blowout di [src/app/globals.css](file:///d:/project%20web/myvelorastore/src/app/globals.css)**: Menambahkan `max-width: 100%; overflow-x: clip;` pada tag `html, body` agar elemen horizontal tidak mendistorsi lebar viewport browser tanpa merusak elemen sticky.
  - **Navbar 320px Ultra-Compact di [src/components/storefront/navbar.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/navbar.tsx)**: Mengubah grid navbar menjadi `grid-cols-[auto_1fr_auto] md:grid-cols-3` dengan padding `px-3 sm:px-4`, ukuran touch-target `w-10 h-10 sm:w-11 sm:h-11`, dan membersihkan error runtime `mounted` sehingga navbar tampil presisi di layar 320px.
  - **Form Checkout & Order Summary Anti-Overflow di [src/components/storefront/checkout-form.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/checkout-form.tsx)**: Mengganti struktur grid `CardHeader` bawaan yang kaku dengan responsive flex layout stack (`flex-col sm:flex-row gap-2.5`) sehingga judul "SHIPPING DETAILS" dan tombol "Back to Shop" tidak melompat keluar dari batas layar 320px.
  - **Toolbar Filter & Sort Katalog di [src/components/storefront/catalog-view.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/catalog-view.tsx)**: Menerapkan `flex-wrap gap-2.5` dan lebar adaptif `w-36 sm:w-48` pada dropdown sort agar tidak berhimpitan dengan switch *In Stock Only*.
  - **Grid Kartu Produk 2-Kolom di [src/components/storefront/product-card.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-card.tsx)**: Padding rapat `p-2 sm:p-3`, penanganan text overflow `min-w-0 flex-1 truncate`, dan tombol quick-add responsif (`h-7 w-7 sm:h-8 sm:w-auto`) untuk memastikan grid 2 kolom pas di lebar 288px tanpa overflow.
  - **Halaman Detail Produk di [src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx)**: Menyesuaikan padding bawah `pb-20 sm:pb-8` agar tidak tertutup sticky bar, tombol varian `p-2 sm:p-3` dengan truncate, dan sticky bottom bar yang pas di layar 320px.
  - **Carousel & Baju Kategori di [src/components/storefront/hero-banner-carousel.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/hero-banner-carousel.tsx) & [src/components/storefront/category-banners-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/category-banners-section.tsx)**: Menyembunyikan tombol panah chevron di mobile agar tidak menutupi teks headline banner, serta menyesuaikan skala pil label kategori (`text-sm sm:text-2xl px-4 sm:px-8`).
- [x] **Penyempurnaan Arsitektur Stok Transaksional & Anti-Overselling**:
  - **Single-Pass Deadlock-Free Lock di [src/app/actions/checkout.ts](file:///d:/project%20web/myvelorastore/src/app/actions/checkout.ts)**: Mengidentifikasi seluruh ID versi (versi langsung + versi komponen linked bundle), menyortir secara numerik menaik (`.sort((a, b) => a - b)`), dan mengunci semuanya dalam 1 kali query atomik `SELECT ... FOR UPDATE` di awal transaksi untuk mencegah error deadlock PostgreSQL (`40P01`).
  - **Pencegahan Overselling via Total Physical Demand Map**: Mengakumulasikan total kebutuhan fisik bersih per ID versi dari seluruh item keranjang belanja sebelum validasi; memblokir checkout jika kuantitas gabungan satuan + bundle melebihi stok fisik gudang.
  - **Restorasi Stok Simetris saat Pembatalan Order di [src/app/actions/admin-orders.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-orders.ts)**: Ketika order dibatalkan (`status === "cancelled"`), sistem mendeteksi apakah item berupa *Linked Bundle* dan memulihkan stok ke masing-masing versi komponen penyusunnya secara idempoten (`stockRestoredAt`).
  - **Handling Open Pre-Order & Akurasi Stok di [src/components/storefront/product-card.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-card.tsx)**: Mencegah status salah *"Out of Stock"* pada produk Pre-Order kuota terbuka (`preOrderQuotaMode === "open"`), menghitung stok fisik murni tanpa menggandakan counter bundle, dan memilih versi pertama yang tersedia untuk tombol quick-add.
  - **Dynamic Bundle Stock dengan `linkedVersionIds` di [src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx)**: Menghitung ketersediaan paket bundle berdasarkan array ID komponen spesifik yang dikaitkan Admin.
- [x] **Pembaruan FAQ & Kebijakan Pre-Order (PO) vs Ready Stock**:
  - Memperbarui daftar FAQ utama di [src/db/mock-data.ts](file:///d:/project%20web/myvelorastore/src/db/mock-data.ts) dan [src/app/how-to-order/page.tsx](file:///d:/project%20web/myvelorastore/src/app/how-to-order/page.tsx) agar 100% akurat merefleksikan model operasional toko saat ini yang menyediakan barang **Ready Stock** dan **Pre-Order (PO)**.
  - Menjelaskan secara transparan perbedaan estimasi pengiriman (Ready stock: 1-2 hari kerja; PO: dikirim segera saat batch tiba di gudang sesuai deadline tanggal 'Available until').
  - Menjelaskan rekomendasi pemisahan order (disarankan checkout terpisah agar barang ready tidak tertahan menunggu barang PO).
  - Menambahkan styling `whitespace-pre-line` pada [src/components/storefront/faq-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/faq-section.tsx) agar format paragraf dan poin-poin penjelasan tampil rapi di tampilan accordion.
- [x] **Halaman Khusus Panduan Order ("How to Order") Mandiri (`/how-to-order`)**:
  - Membangun halaman editorial komprehensif [src/app/how-to-order/page.tsx](file:///d:/project%20web/myvelorastore/src/app/how-to-order/page.tsx) dengan visual 5-step guide, tips penting belanja K-pop (unboxing video, format alamat Malaysia), jaminan proteksi kemasan (*multi-layer bubble wrap & rigid cardboard*), FAQ alur order, dan tombol CTA ke katalog produk.
  - Menghapus seksi `<HowToOrderSection />` dari beranda utama [src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx) sesuai instruksi user agar beranda lebih bersih, fokus pada showcase produk, dan tidak redundan.
  - Memperbarui seluruh tautan navigasi di [src/components/storefront/navbar.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/navbar.tsx) dan [src/components/storefront/footer.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/footer.tsx) agar mengarah ke `/how-to-order`.
- [x] **Instalasi Banner Kategori Resolusi Tinggi (6 Kategori)**:
  - Menyalin dan mengonfigurasi aset 2.5K high-res ke `public/banners/`: `album-banner.jpg`, `merch-banner.jpg`, `lightstick-banner.jpg`, `photobook-banner.jpg`, `fashion-banner.jpg`, dan `stationery-banner.jpg`.
  - Memperbarui [src/components/storefront/category-banners-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/category-banners-section.tsx) dan [src/lib/constants.ts](file:///d:/project%20web/myvelorastore/src/lib/constants.ts) untuk menampilkan cover banner berasio 16:9 dengan hover zoom dan label pil kategori putih di tengah.
- [x] **Instalasi Bundle Favicon Resmi Myvelora**:
  - Mengekstrak `public/favicon_bundle.zip` ke `public/` dan `src/app/` (`favicon.ico`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `favicon-32x32.png`, `favicon-16x16.png`, dan `site.webmanifest`).
  - Mengonfigurasi `metadata.icons` dan `manifest` di [src/app/layout.tsx](file:///d:/project%20web/myvelorastore/src/app/layout.tsx).
- [x] **8 Task Arsitektur & Logika Produk/Versi/Bundle**:
  - **Task 1 (Sinkronisasi Stok Bundle)**: Pengurangan stok atomik pada versi komponen saat varian bundle dibeli di [src/app/actions/checkout.ts](file:///d:/project%20web/myvelorastore/src/app/actions/checkout.ts), serta kalkulasi dinamis ketersediaan stok bundle (`Math.min(...)`) di [src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx).
  - **Task 2 (Non-Destructive Version Upsert)**: Mengganti operasi `delete + insert` destruktif dengan transaksi atomik update/insert/soft-deactivate di [src/app/actions/admin-products.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-products.ts).
  - **Task 3 (Eksplisit `isBundle` & `bundleMode`)**: Menambahkan kolom `isBundle` & `bundleMode` di [src/db/schema.ts](file:///d:/project%20web/myvelorastore/src/db/schema.ts) dan form Admin.
  - **Task 4 (Pre-Order Auto-Close)**: Input datetime `<input type="datetime-local">` di Admin, formatter di [src/lib/date.ts](file:///d:/project%20web/myvelorastore/src/lib/date.ts), serta penutupan otomatis pembelian jika deadline terlewat.
  - **Task 5 (Pembersihan Like Sintetis)**: Tombol Wishlist `❤️ Save` / `❤️ Saved` yang bersih tanpa angka formula palsu di [product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx).
  - **Task 6 (Guardrail Base64 di Mode Produksi)**: Memblokir penyimpanan payload data URL mentah jika `NODE_ENV === "production"`.
  - **Task 7 (Konstanta Terpusat / Single Source of Truth)**: Membuat [src/lib/constants.ts](file:///d:/project%20web/myvelorastore/src/lib/constants.ts) untuk kategori, metadata, bundle modes, dan quota modes.
  - **Task 8 (Mode Kuota Pre-Order)**: Mendukung mode kuota `finite` vs `open` di skema DB dan UI admin.
- [x] **Step-by-Step Guided Product & Version Generator di Admin (`/admin/products`)**:
  - Merombak [src/components/admin/products-manager.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/products-manager.tsx) dan [src/app/actions/admin-products.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-products.ts) dengan alur terpandu 4 langkah:
    1. **Step 1 (Pilih Kategori)**: `Album`, `Merch`, `Lightstick`, `Photobook`, `Fashion`, `Stationery`, `Photocard`.
    2. **Step 2 (Info & Upload Foto)**: Input nama, grup/artis, dan tombol **Upload Photo from Device** (kompresi Canvas WebP otomatis + fallback lokal/S3).
    3. **Step 3 (Jumlah Versi & Opsi Beli Keduanya / Full Set)**: Pilihan cepat jumlah versi (`1` s/d `6+`) yang otomatis men-generate baris input Nama Versi, Harga (`RM`), dan Stok; dilengkapi tombol *Apply Version #1 Price & Stock to All* serta checkbox **`Add "Buy All N Versions (Full Set)" Option?`** (otomatis membuat opsi paket seperti `Full 2-Album Set` beserta kalkulasi harga paket & stoknya).
    4. **Step 4 (Detail Inclusions & Status Beranda)**: Input `DETAIL :` dan checkbox `Pre-Order`, `New Arrival`, `Best Seller`.
- [x] **Smart Hybrid Layout pada Halaman Detail Produk ([src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx))**:
  - Menambahkan kolom `pre_order_deadline` pada `products` di [src/db/schema.ts](file:///d:/project%20web/myvelorastore/src/db/schema.ts), [_build_plan/blueprints/schema-proposal.ts](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/schema-proposal.ts), [src/db/mock-data.ts](file:///d:/project%20web/myvelorastore/src/db/mock-data.ts), [src/app/actions/admin-products.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-products.ts), dan input di [src/components/admin/products-manager.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/products-manager.tsx).
  - Menampilkan baris `Available until: ...` untuk produk Pre-Order, tombol *Like/Wishlist* interaktif (`❤️`) berdampingan dengan status stok (`Pre Order`, `In Stock (X available)`, atau `Out of Stock`), serta tampilan harga `PRICE` yang bersih.
  - Menerapkan **Smart Version Selector**: otomatis tampil hanya jika produk memiliki `> 1` versi (tetap dapat diklik walaupun salah satu versi *Sold Out* untuk melihat foto & harganya) dan otomatis disembunyikan untuk produk 1 versi.
  - Menampilkan stepper `QUANTITY: - 0 +` nonaktif disertai pesan merah `Sorry, insufficient stock available.` saat versi/produk habis, serta blok daftar isi `DETAIL :` yang rapi.
- [x] **Tombol "View All" pada Seksi Pre Order, New Arrival, & Best Seller**:
  - Menambahkan tombol **`View All Pre-Order`** (`/shop?category=pre-order`), **`View All New Arrivals`** (`/shop?category=new`), dan **`View All Best Sellers`** (`/shop?category=best-seller`) di bagian bawah masing-masing seksi pada [src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx).
  - Menambahkan dukungan filter pil **`Pre-Order`**, **`New Arrivals`**, dan **`Best Sellers`** pada [src/app/shop/page.tsx](file:///d:/project%20web/myvelorastore/src/app/shop/page.tsx) dan [src/components/storefront/catalog-view.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/catalog-view.tsx).
- [x] **Pembaruan Menu Navigasi Mobile & Desktop ([src/components/storefront/navbar.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/navbar.tsx))**:
  - Menambahkan navigasi utama (`Shop All`, `Pre Order`, `New Arrival`, `Best Seller`), grid *Categories* 2-kolom untuk ke-6 kategori (`Album`, `Merchandise`, `Lightstick`, `Photobook`, `Fashion`, `Stationery`), serta tautan bantuan (`How to Order`, `Reviews`, `Track Order`) pada drawer menu mobile.
- [x] **Sinkronisasi Skema Database, Server Actions, & Panel Admin (`/admin/products`, `/admin/reviews`, `/admin/settings`)**:
  - Menambahkan kolom boolean `is_pre_order` dan `is_best_seller` berdampingan dengan `is_new_arrival` pada tabel `products` di [src/db/schema.ts](file:///d:/project%20web/myvelorastore/src/db/schema.ts), [_build_plan/blueprints/schema-proposal.ts](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/schema-proposal.ts), dan [src/db/mock-data.ts](file:///d:/project%20web/myvelorastore/src/db/mock-data.ts).
  - Memperbarui Server Actions [src/app/actions/admin-products.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-products.ts) dan [src/app/actions/admin-reviews.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-reviews.ts) agar mendukung penyimpanan `isPreOrder`, `isNewArrival`, dan `isBestSeller` serta dilengkapi *in-memory mock sync* + `updateTag` ketika PostgreSQL belum aktif.
  - Memperbarui UI [src/components/admin/products-manager.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/products-manager.tsx) dengan tombol *quick-select* untuk ke-7 kategori (`Album`, `Merch`, `Lightstick`, `Photobook`, `Fashion`, `Stationery`, `Photocard`) serta checkbox penanda seksi beranda (`Mark as Pre-Order`, `Mark as New Arrival`, `Mark as Best Seller`).
- [x] **Seksi Beranda "PRE ORDER", "NEW ARRIVAL", & "BEST SELLER" Sesuai Referensi**:
  - Menyusun ulang seksi produk di [src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx) langsung di bawah seksi *"SHOP NOW"* dengan judul tengah uppercase yang konsisten:
    1. **`PRE ORDER`**: Menampilkan produk berstatus Pre-Order (Upcoming Drops).
    2. **`NEW ARRIVAL`**: Menampilkan rilis terbaru (*Just In Store*).
    3. **`BEST SELLER`**: Menampilkan produk terpopuler termasuk varian siap kirim maupun *Out of Stock*.
  - Memperbarui komponen [src/components/storefront/product-card.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-card.tsx) agar 100% selaras dengan referensi:
    - Frame foto produk persegi rapi (*1:1 aspect-square*).
    - Judul produk 1-baris (*truncate/line-clamp-1*).
    - Tampilan harga dinamis (rentang `RM min - RM max` bila varian beda harga, atau `RM single` bila sama).
    - Indikator status stok langsung di bawah harga: **`In Stock`** (hijau), **`Pre Order`** (hijau), atau **`Out of Stock`** (merah marun `#9b1c48`).
    - Tombol cepat tambah ke keranjang yang elegan dan ramah layar sentuh mobile.
- [x] **Hero Banner Slider, Seksi Banner Kategori "SHOP NOW", & Tombol WhatsApp Mengambang**:
  - Membuat [src/components/storefront/hero-banner-carousel.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/hero-banner-carousel.tsx): Slider Hero Banner *full-width* tepat di bawah Navbar dengan tombol panah kiri/kanan (`<ChevronLeft />` / `<ChevronRight />`), *indicator dots* di bagian bawah, serta *auto-play* yang menggabungkan Hero Banner utama (dari pengaturan Admin `/admin/settings`) bersama slide produk *New Arrivals*.
  - Membuat [src/components/storefront/category-banners-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/category-banners-section.tsx): Seksi **"SHOP NOW"** berisi kartu *collage* visual 6-tile dengan label kategori putih besar di tengah (**`ALBUM`**, **`MERCHANDISE`**, **`LIGHTSTICK`**, **`PHOTOBOOK`**, **`FASHION`**, **`STATIONERY`**) yang langsung mengarah ke `/shop?category=...`.
  - Memasang tombol mengambang **WhatsApp Chat** di pojok kanan bawah (`fixed bottom-5 right-5 z-30`) pada [src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx) yang terhubung secara dinamis ke nomor WhatsApp Admin (`settings.adminWhatsappNumber`).
  - Memperbarui [src/app/shop/page.tsx](file:///d:/project%20web/myvelorastore/src/app/shop/page.tsx) dan [src/components/storefront/catalog-view.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/catalog-view.tsx) agar membaca query parameter `?category=` (`Album`, `Merch`, `Lightstick`, `Photocard`, `new`) dan langsung memilih pil kategori terkait saat halaman dibuka.
- [x] **Tata Letak Header/Navbar 3-Kolom (Kiri Menu, Tengah Logo, Kanan User & Cart)**:
  - Merombak [src/components/storefront/navbar.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/navbar.tsx) mengikuti referensi susunan 3 kolom (`grid-cols-3`): **Kiri** = tombol Hamburger Menu (`<Menu />`, membuka drawer navigasi dari sisi kiri `side="left"`), **Tengah** = `<BrandLogo />` (`mv*`) tepat di tengah, **Kanan** = ikon `<User />` (menuju `/track-order`) dan ikon `<ShoppingBag />` beserta badge jumlah item.
- [x] **Tautan Dinamis WhatsApp & Instagram di Footer (Diatur via Admin Settings)**:
  - Menambahkan kolom `instagram_url` pada `store_settings` di [src/db/schema.ts](file:///d:/project%20web/myvelorastore/src/db/schema.ts), [src/db/index.ts](file:///d:/project%20web/myvelorastore/src/db/index.ts), [src/db/mock-data.ts](file:///d:/project%20web/myvelorastore/src/db/mock-data.ts), dan [src/app/actions/admin-settings.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-settings.ts).
  - Menambahkan field **Instagram Username or URL** berdampingan dengan **Admin WhatsApp Phone** pada tab **WhatsApp & Instagram** di [src/components/admin/settings-manager.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/settings-manager.tsx).
  - Memperbarui [src/components/storefront/footer.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/footer.tsx) dan seluruh 8 halaman storefront agar merender tombol kontak **WhatsApp** (`https://wa.me/...`) dan **Instagram** (`@username` / URL penuh) secara dinamis sesuai konfigurasi Admin (dan otomatis disembunyikan jika dikosongkan).
- [x] **Audit & Polishing Menyeluruh Halaman Storefront Frontend**:
  - Mengganti `<select>` HTML biasa di [src/components/storefront/catalog-view.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/catalog-view.tsx) dengan komponen Shadcn `<Select>` (`@radix-ui/react-select`) dan memperbarui ukuran font input pencarian ke `text-base sm:text-sm` (`h-12`) untuk mencegah *auto-zoom* iOS Safari.
  - Menghapus pil dekoratif `<HelpCircle /> Questions & Answers` dari [src/components/storefront/faq-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/faq-section.tsx).
  - Menyesuaikan teks kecil `text-pink` di atas permukaan terang menjadi `text-plum-muted` pada [product-card.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-card.tsx), [how-to-order-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/how-to-order-section.tsx), dan [customer-reviews-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/customer-reviews-section.tsx) sesuai aturan kontras [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md).
- [x] **Penghapusan Link Admin Dashboard dari Footer Publik**:
  - Menghapus tautan `/admin/login` ("Admin Dashboard") dari [src/components/storefront/footer.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/footer.tsx) agar footer pelanggan hanya berisi navigasi publik yang relevan.
- [x] **Penambahan Seksi Customer Reviews di Halaman Detail Produk (`/products/[slug]`)**:
  - Memasang `<CustomerReviewsSection reviews={reviews} />` di antara blok *Product Details* dan *Footer* pada [src/app/products/[slug]/page.tsx](file:///d:/project%20web/myvelorastore/src/app/products/%5Bslug%5D/page.tsx) serta merapikan spasi bawah (`pb-4 md:pb-8`) di [src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx) agar tidak ada ruang kosong berlebih sebelum testimoni.
- [x] **Integrasi Aset Logo Resmi Myvelora (`mv`)**:
  - Ekstraksi aset logo resmi dari file sumber user (`photo_2026-11-12_21-10-19.jpg`) menjadi PNG transparan presisi tanpa distorsi di `public/brand/myvelora-logo.png`, salinan penuh di `public/brand/myvelora-logo-full.jpg`, serta favicon aplikasi di `src/app/icon.png`.
  - Pembaruan [src/components/common/brand-logo.tsx](file:///d:/project%20web/myvelorastore/src/components/common/brand-logo.tsx) dan [src/components/storefront/navbar.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/navbar.tsx) agar menampilkan monogram resmi `/brand/myvelora-logo.png` secara bersih tanpa duplikasi teks `MYVELORA` di sebelahnya (mematuhi aturan *clear space* [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md)), serta memperbaiki posisi badge angka keranjang (`top-1 right-1 ring-2 ring-plum`) agar tidak menutupi ikon tas belanja.
- [x] **Manajemen Hero Banner Dinamis oleh Admin (`/admin/settings`)**:
  - Penambahan kolom `hero_banner_image_url`, `hero_banner_badge`, `hero_banner_title`, dan `hero_banner_link` pada tabel `store_settings` di [src/db/schema.ts](file:///d:/project%20web/myvelorastore/src/db/schema.ts), [src/db/index.ts](file:///d:/project%20web/myvelorastore/src/db/index.ts), serta [src/db/mock-data.ts](file:///d:/project%20web/myvelorastore/src/db/mock-data.ts).
  - Pembaruan Server Action [src/app/actions/admin-settings.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-settings.ts) dengan dukungan *presigned upload* S3 (`getBrandAssetPresignedUrlAction`), sinkronisasi in-memory + `updateTag("settings")` untuk mode lokal maupun PostgreSQL.
  - Penambahan tab **Hero Banner** di [src/components/admin/settings-manager.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/settings-manager.tsx) lengkap dengan *Live 16:9 Banner Preview*, tombol upload foto banner langsung dari perangkat (kompresi Canvas WebP otomatis), input URL gambar, teks badge, judul headline, link tujuan, dan tombol reset ke *Auto New Arrival*.
  - Integrasi Hero Banner di [src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx) agar merender pengaturan Admin secara langsung (dengan fallback otomatis ke produk *New Arrival* terbaru apabila dikosongkan).
  - Verifikasi: `npx tsc --noEmit` EXIT=0, `npm run lint` 0 errors.

### Ringkasan Teknis
- Hero Banner kini sepenuhnya dikendalikan Admin melalui `/admin/settings` (mendukung upload gambar 16:9, badge, judul, dan link tujuan, serta langsung ter-update di beranda via `updateTag("settings")`).
- Pemasangan favicon bundle resmi Myvelora (`favicon.ico`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`) di `public/` dan `src/app/`.
- Integrasi lengkap seluruh 6 aset banner kategori resmi beresolusi tinggi (2528x1696) di `public/banners/`:
  - `album-banner.jpg` untuk kategori **ALBUM**.
  - `merch-banner.jpg` untuk kategori **MERCHANDISE**.
  - `lightstick-banner.jpg` untuk kategori **LIGHTSTICK**.
  - `photobook-banner.jpg` untuk kategori **PHOTOBOOK**.
  - `fashion-banner.jpg` untuk kategori **FASHION**.
  - `stationery-banner.jpg` untuk kategori **STATIONERY**.
  - Seluruh ke-6 banner terpasang rapi di seksi **"SHOP NOW"** [src/components/storefront/category-banners-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/category-banners-section.tsx) dan metadata terpusat [src/lib/constants.ts](file:///d:/project%20web/myvelorastore/src/lib/constants.ts).
- [x] **Remake "How to Order" Menjadi Halaman Mandiri ([src/app/how-to-order/page.tsx](file:///d:/project%20web/myvelorastore/src/app/how-to-order/page.tsx))**:
  - Menghapus seksi `<HowToOrderSection />` dari halaman beranda utama ([src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx)) agar homepage fokus pada konversi produk dan kurasi katalog.
  - Membangun halaman mandiri baru `/how-to-order` dengan tata letak editorial premium:
    - Panduan terperinci 5 langkah (Pilih Versi, Tas Belanja, Form Alamat Malaysia, Transfer DuitNow QR / Bank, Konfirmasi WhatsApp & Live Tracking).
    - Blok komitmen kualitas & proteksi kemasan (*100% Factory Sealed*, *Multi-Layer Shockproof Bubble Wrap*, *Direct WhatsApp Support*).
    - Seksi Tanya-Jawab Pesanan (FAQ) khusus seputar checkout & pembayaran.
    - Tombol CTA menuju katalog `/shop` dan `/track-order`.
  - Memperbarui tautan menu di Navbar mobile drawer dan Footer ke rute `/how-to-order`.
- Pemasangan favicon bundle resmi Myvelora (`favicon.ico`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`) di `public/` dan `src/app/`.
- Integrasi lengkap seluruh 6 aset banner kategori resmi beresolusi tinggi (2528x1696) di `public/banners/`:
  - `album-banner.jpg` untuk kategori **ALBUM**.
  - `merch-banner.jpg` untuk kategori **MERCHANDISE**.
  - `lightstick-banner.jpg` untuk kategori **LIGHTSTICK**.
  - `photobook-banner.jpg` untuk kategori **PHOTOBOOK**.
  - `fashion-banner.jpg` untuk kategori **FASHION**.
  - `stationery-banner.jpg` untuk kategori **STATIONERY**.
  - Seluruh ke-6 banner terpasang rapi di seksi **"SHOP NOW"** [src/components/storefront/category-banners-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/category-banners-section.tsx) dan metadata terpusat [src/lib/constants.ts](file:///d:/project%20web/myvelorastore/src/lib/constants.ts).
- [x] **Remake "How to Order" Menjadi Halaman Mandiri ([src/app/how-to-order/page.tsx](file:///d:/project%20web/myvelorastore/src/app/how-to-order/page.tsx))**:
  - Menghapus seksi `<HowToOrderSection />` dari halaman beranda utama ([src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx)) agar homepage fokus pada konversi produk dan kurasi katalog.
  - Membangun halaman mandiri baru `/how-to-order` dengan tata letak editorial premium:
    - Panduan terperinci 5 langkah (Pilih Versi, Tas Belanja, Form Alamat Malaysia, Transfer DuitNow QR / Bank, Konfirmasi WhatsApp & Live Tracking).
    - Blok komitmen kualitas & proteksi kemasan (*100% Factory Sealed*, *Multi-Layer Shockproof Bubble Wrap*, *Direct WhatsApp Support*).
    - Seksi Tanya-Jawab Pesanan (FAQ) khusus seputar checkout & pembayaran.
    - Tombol CTA menuju katalog `/shop` dan `/track-order`.
  - Memperbarui tautan menu di Navbar mobile drawer dan Footer ke rute `/how-to-order`.

### Prioritas Sesi Berikutnya (Backlog Perbaikan Logika Admin, Stok, & Produk)

#### 🔴 Prioritas Tinggi (Kritikal — Integritas Stok & Database)
- [x] **Task 1 — Sinkronisasi Stok Bundle / Full Set (`is_bundle` & Mode Stok Paket)**:
  - Menangani logika pemotongan stok saat pembeli membeli paket `Full N-Album Set` (atau opsi *Buy All Versions*): menyediakan pilihan bagi Admin antara **Shared / Linked Stock** (otomatis memotong `1x` stok dari masing-masing versi satuan di dalam transaksi ACID checkout [src/app/actions/checkout.ts](file:///d:/project%20web/myvelorastore/src/app/actions/checkout.ts) dan menghitung ketersediaan set dari `min(stock versi satuan)` di UI [src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx)) atau **Standalone Set Stock** (stok jatah khusus set terpisah).
- [x] **Task 2 — Non-Destructive Version Upsert di `db.transaction` ([src/app/actions/admin-products.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-products.ts))**:
  - Mengganti pola `delete(productVersions) + insert` saat Admin mengedit produk menjadi transaksi atomik `db.transaction`:
    - Versi lama yang memiliki `id` dilakukan **`UPDATE`** (agar `product_version_id` di keranjang pelanggan & histori `order_items` tidak rusak/putus).
    - Versi baru tanpa `id` dilakukan **`INSERT`**.
    - Versi lama yang dihapus Admin di-nonaktifkan secara aman (**soft-deactivate** `isActive = false`) bila sudah pernah terkait order.
- [x] **Task 3 — Kolom Eksplisit `is_bundle` pada `product_versions` ([src/db/schema.ts](file:///d:/project%20web/myvelorastore/src/db/schema.ts))**:
  - Menambahkan kolom boolean `is_bundle` (`default: false`) dan `bundle_mode` (`standalone` | `linked`) pada tabel `product_versions` untuk menggantikan deteksi berbasis regex nama versi (`/set|bundle|all|both/i`) di [src/components/admin/products-manager.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/products-manager.tsx), sehingga versi reguler yang mengandung kata *"Set"* (seperti *"Sticker Set Ver."*) tidak salah terdeteksi sebagai bundel.

#### 🟡 Prioritas Menengah (Operasional Toko & Guardrail Brand)
- [x] **Task 4 — Otomatisasi Penutupan Pre-Order (`pre_order_deadline` Timestamp + Datepicker)**:
  - Mengubah input batas waktu Pre-Order di Admin menjadi pemilih tanggal & jam (`<input type="datetime-local">`) ditambah tampilan format tanggal ramah baca di Storefront via `src/lib/date.ts`, serta otomatis mengunci tombol *Add to Cart* menjadi **`Pre-Order Closed`** ketika waktu sekarang melewati `preOrderDeadline`.
- [x] **Task 5 — Penghapusan Angka Like Sintetis ([src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx))**:
  - Menghapus rumus angka awal sintetis `(product.id * 3 + ...) % 11` demi kepatuhan ketat pada Brand Guardrail (*No Unconfirmed Claims*), dan menggantinya dengan tombol **Save / Wishlist (`❤️ Save` / `❤️ Saved`)** murni tanpa angka palsu yang tersimpan di `localStorage`.
- [x] **Task 6 — Proteksi Upload Foto Produksi (S3/MinIO Guard)**:
  - Memastikan fallback penyimpanan foto format Base64 (`data:image/webp;base64,...`) hanya diizinkan pada mode pengembangan lokal (`NODE_ENV !== "production"`), sementara di server produksi wajib melalui S3/MinIO Presigned URL agar ukuran baris tabel PostgreSQL tetap ringan dan cepat.

#### 🟢 Prioritas Rendah (Kerapian Kode & Fleksibilitas Admin)
- [x] **Task 7 — Single Source of Truth Konstanta Kategori ([src/lib/constants.ts](file:///d:/project%20web/myvelorastore/src/lib/constants.ts))**:
  - Menyatukan daftar kategori resmi (`Album`, `Merch`, `Lightstick`, `Photobook`, `Fashion`, `Stationery`, `Photocard`) beserta label tampilannya di satu file konstanta terpusat dan mengimpornya di Navbar, Category Banners, Catalog View, dan Admin Products Manager.
- [x] **Task 8 — Mode Kuota Pre-Order (Kuota Terbatas vs Open PO sampai Deadline)**:
  - Menambahkan opsi pada produk Pre-Order di Admin untuk memilih apakah PO menggunakan **Kuota Stok Terbatas** (mengikuti angka `stock` versi) atau **Open PO** (selalu bisa dipesan selama belum melewati `pre_order_deadline`).

### Prioritas Sesi Berikutnya
1. Verifikasi alur CRUD Admin Orders & Tracking Input di `/admin/orders`.
2. Persiapan deployment Milestone 3 Coolify (`Dockerfile`, `/api/health`).

---

## 2026-11-15

### Target Selesai
- [x] Analisis dokumen brand identity resmi [Myvelora_Brand_Identity_PRD.pdf](file:///d:/project%20web/myvelorastore/Myvelora_Brand_Identity_PRD.pdf) (V1.0).
- [x] Konfirmasi keputusan bisnis & MVP bersama user (Ready Stock Only, Malaysia MYR Flat Rate + Free Shipping threshold, DuitNow QR/Bank Transfer + Upload Bukti Bayar, Click-to-WhatsApp + Bot Notifikasi Admin, Dynamic Store Settings, Anti-AI Slop inline).
- [x] Penyusunan Master PRD di [_build_plan/prd.md](file:///d:/project%20web/myvelorastore/_build_plan/prd.md).
- [x] Penyusunan Design System di [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md).
- [x] Pembuatan cetak biru teknis di `_build_plan/blueprints/`:
  - [theme-config.css](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/theme-config.css)
  - [schema-proposal.ts](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/schema-proposal.ts)
  - [shadcn-components.txt](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/shadcn-components.txt)
  - [Dockerfile](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/Dockerfile)
- [x] Penyusunan roadmap milestone (`milestone-1-init.md`, `milestone-2-core.md`, `milestone-3-coolify.md`).
- [x] Pembaruan [AGENTS.md](file:///d:/project%20web/myvelorastore/AGENTS.md) dan pembuatan [HANDOFF.md](file:///d:/project%20web/myvelorastore/HANDOFF.md).
- [x] Penambahan standar arsitektur **Mobile-First** (`360px–430px` & *Instagram In-App Browser*, sticky thumb-zone CTA, anti-misclick, input `16px` anti-iOS-zoom, `.pb-safe`, `.mv-snap-carousel`, dan Admin mobile card view) pada `DESIGN.md`, `_build_plan/prd.md`, `theme-config.css`, dan `milestone-2-core.md`.
- [x] **Eksekusi Milestone 1 (Inisialisasi Fondasi Teknis Proyek)**:
  - Scaffold Next.js 16.4.6 (TypeScript, App Router, Tailwind CSS v4, ESLint 9, `output: "standalone"`).
  - Integrasi token tema Myvelora (`#47023B` Deep Plum, `#FA3890` Pink, `#F5D5E3` Blush, `#FBF7F4` Ivory, `#FFFFFF` White, `.mv-heading-italic`, `.mv-corner-frame`, `.pb-safe`, `.mv-snap-carousel`).
  - Google Fonts `Montserrat` + `Poppins` via `next/font/google` pada `layout.tsx`.
  - Instalasi 17 komponen Shadcn UI + `@radix-ui/react-slot` (Button `asChild`).
  - Komponen resmi `<BrandLogo />` monogram `mv` + sparkle `#FA3890`.
  - Konfigurasi Drizzle ORM PostgreSQL (`src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`, `.env.example`).
  - Utilitas S3/MinIO presigned upload (`src/lib/s3.ts`) & kompresi Canvas klien (`src/lib/image-compress.ts`).
  - Verifikasi: `npx tsc --noEmit` EXIT=0, `npm run lint` 0 warning 0 error.

### Ringkasan Teknis
- [x] Inisialisasi fondasi Next.js 16.4, styling sistem tema Myvelora, skema Drizzle ORM, dan utilitas upload telah tuntas terverifikasi tanpa error typecheck maupun lint.
- [x] **Implementasi & Refactoring Mobile Storefront (Milestone 2 & Polishing)**:
  - Katalog & Beranda: Grid responsif 2-kolom pada mobile (`grid-cols-2 gap-3 sm:gap-6`), tata letak kartu produk terstruktur (`flex-col sm:flex-row`) bebas benturan teks harga dan tombol.
  - Cart Drawer: Diperbaiki untuk layar sempit (320px), gambar produk rasio terkunci (`72x90px`), teks dan stepper kuantitas rapi tanpa clipping.
  - Section Customer Reviews: Desain ulang sesuai referensi (`kamera pung lallang`), aspect ratio gambar 1:1, 5 bintang pink, lencana *Verified Buyer*, navigasi carousel lancar.
  - Form Checkout & State Dropdown: Komponen `Select` diperbarui ke `@radix-ui/react-select` dengan trigger `w-full h-12 rounded-xl`, proporsi tinggi dan radius selaras 100% dengan input teks (`Postcode`, `City`, `Street Address`).
  - Button "Continue to Payment": Sizing proporsional `w-full h-12 text-sm sm:text-base` bebas text-clipping.
  - Bottom Sticky Bar Product Detail: Padding aman `.pb-safe`, penataan informasi varian + harga di kiri dan tombol `h-11 px-6` di kanan secara proporsional.
  - Isolasi Database Offline: Penambahan guard `hasDatabaseUrl` langsung di `src/db/index.ts` dan Server Actions (`checkout.ts`, `payment.ts`, `queries.ts`) sehingga mode preview lokal berjalan instan tanpa popup error unhandled TCP connection.
  - Pembersihan Anti-AI Slop: Dihapus notifikasi hijau menumpuk saat tambah keranjang, dibersihkan jargon internal PRD dari footer.
  - Hero Section ([src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx)): Dihapus pil `<Sparkles />` generik, tata letak teks tengah, dan dua tombol bertumpuk; diganti dengan **Photo-First Editorial Hero** (copy kiri ringkas, CTA inline `Shop Catalog` + link `How to Order`, dan **1 Hero Banner landscape `16:9` / `16:10`** dengan overlay gradasi Deep Plum, lencana `New Drop`, serta judul produk unggulan). Label kecil pink di atas latar terang juga diganti ke `text-plum-muted` sesuai aturan kontras `DESIGN.md`.
  - Verifikasi: `npx tsc --noEmit` EXIT=0, `npm run lint` 0 errors, dev server route `/`, `/shop`, `/checkout`, `/track-order` respon HTTP 200 OK.

### Ringkasan Teknis
- Seluruh issue layout mobile (grid 2 kolom, drawer 320px, state dropdown proporsional, teks button tidak terpotong, dan pencegahan error overlay database offline) telah selesai diperbaiki dan diverifikasi.
- Sesuai aturan `AGENTS.md`, belum ada operasi `git commit`/`push` atau eksekusi migrasi database fisik yang dijalankan tanpa izin user.

### Prioritas Sesi Berikutnya
1. Finalisasi halaman Admin Dashboard ([_build_plan/milestone-2-core.md](file:///d:/project%20web/myvelorastore/_build_plan/milestone-2-core.md)): Product CRUD, Order Status & Verification, Store Settings.
2. Persiapan deployment Milestone 3 Coolify: `Dockerfile`, route `/api/health`.
