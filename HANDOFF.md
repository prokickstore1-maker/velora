# HANDOFF.md — Estafet Teknis & Guardrail Myvelora Store

**Last Updated:** 2026-11-19  
**Current Phase:** Milestone 1 & 2 Complete -> **Production S3 Integration & Deployment on Coolify**  
**Source Documents:** [_build_plan/prd.md](file:///d:/project%20web/myvelorastore/_build_plan/prd.md), [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md), [Myvelora_Brand_Identity_PRD.pdf](file:///d:/project%20web/myvelorastore/Myvelora_Brand_Identity_PRD.pdf)

---

## 1. Status Terkini

- **Milestone 1 SELESAI & Milestone 2 Storefront + Admin Panel SELESAI**: 
  - Proyek Next.js 16.4.6 terinisialisasi dengan TypeScript, Tailwind CSS v4, ESLint 9, `output: "standalone"` di `next.config.ts`, Google Fonts `Montserrat` dan `Poppins`, 17 komponen Shadcn UI, skema Drizzle ORM PostgreSQL (`src/db/schema.ts` & `src/db/index.ts`), utilitas S3 presigned + Server-side direct S3 upload (`src/lib/s3.ts`), utilitas kompresi Canvas (`src/lib/image-compress.ts`), serta komponen logo resmi `<BrandLogo />`.
  - Database PostgreSQL 18 di Coolify (`157.10.253.46:5432`) kini memiliki **949 produk aktif** (**616 Album**, **228 Lightstick**, **105 Photobook/Magazine**) dengan seluruh foto sampul resolusi tinggi di S3 IDCloudHost (`velora` bucket).
  - Password admin `Jarwo828@Jr` telah di-hash SHA-256 (`1d3b79f404fad6c61abd28b4afe496185e0458de3c3987fa9d8c36a820712d60`).
  - Bot Telegram `@myvelorastore_bot` terverifikasi aktif & terhubung dengan akun Admin `7562689082` (@Gantengbanget77) untuk notifikasi bukti bayar serta upload rekening & QR harian.
  - Review Management (`/admin/reviews`): Dilengkapi form lengkap terpisah (Customer Name, 1-5 Star Interactive Selector, Review Feedback Quotes, Unboxing Image Upload + Live Thumbnail Preview) serta kapabilitas Edit & Delete dan dynamic star render pada storefront.
  - Arsitektur Upload S3 diselaraskan 100% dengan standar proyek produksi IDCloudHost (`PROKICK MY` & `kamera pung lallang`) via Server Action bypass CORS dan otomatis retry tanpa ACL bila Ceph menolak Canned ACL header. Tombol upload QRIS/DuitNow QR dan Brand Logo langsung dari galeri perangkat aktif di admin settings.
- **Verifikasi Lolos**: `npx tsc --noEmit` berhasil EXIT=0 dan `npm run lint` bersih tanpa warning/error.
- **Izin Operasi Dipatuhi**: Sesuai instruksi user, `git push` diserahkan kepada user. Commit lokal telah dirapikan.

---

## 2. Guardrail Wajib (Dilarang Dilanggar)

1. **Kepatuhan Brand PDF (Hal. 2, 3, 6, 7):**
   - **Storefront Public Language = 100% English.** Jangan menuliskan copy Bahasa Indonesia/Melayu di halaman pelanggan (termasuk judul ulasan harus *CUSTOMER REVIEWS*, bukan *TESTIMONI PELANGGAN*).
   - **No Unconfirmed Operational Claims:** Jangan pernah men-hardcode klaim keaslian (*"100% Official/Authentic"*), jargon promosi *ready stock*, kebijakan retur, tarif ongkir, waktu pengiriman, metode pembayaran, atau URL domain. Seluruh informasi pembayaran, ongkir, dan FAQ **harus** dikontrol melalui tabel `store_settings` dan hanya ditampilkan saat diaktifkan (`*Enabled === true`) oleh Admin.
   - **No Decorative "Malaysia":** Kata *"Malaysia"* hanya boleh dipakai pada konteks fungsional form alamat pengiriman checkout (`State / Negeri` & daftar negara tujuan).
   - **Logo `mv` Integrity:** Jangan meregangkan, memutar, mengganti warna, atau menambahkan efek ke monogram `mv` + sparkle pink `#FA3890`.
   - **Text Contrast Rule:** Dilarang menggunakan **Accent Pink (`#FA3890`)** untuk teks kecil di atas latar putih/ivory. Gunakan **Deep Plum (`#47023B`)** di atas Ivory/White, atau **White (`#FFFFFF`)** di atas Deep Plum.

2. **Arsitektur Transaksi & Stok (ACID):**
   - Stok berjenis **Ready Stock Only** pada tabel `product_versions`.
   - Pembuatan order (`POST /api/orders` atau Server Action checkout) **wajib** memakai `db.transaction` dengan row locking `.for('update')` yang diurutkan per `product_versions.id` untuk mencegah *overselling* dan *deadlock*.
   - Harga satuan, subtotal, flat shipping fee (`RM`), dan free shipping threshold **wajib dihitung ulang di server** dari database — abaikan nominal harga dari payload klien.
   - Pembatalan order (`status = 'cancelled'`) wajib memulihkan stok secara atomik dan mencatat `stock_restored_at` agar idempoten.

3. **Keamanan Presigned Upload S3/MinIO:**
   - Validasi tipe file (`image/jpeg`, `image/png`, `image/webp`; plus `image/svg+xml` khusus untuk logo admin) dan batas ukuran di server sebelum menerbitkan presigned URL.
   - Kompresi foto bukti bayar & foto produk dilakukan di sisi klien via HTML5 Canvas sebelum diunggah ke S3/MinIO.

4. **Konvensi Next.js 16.4:**
   - Wajib `await params`, `await searchParams`, `await cookies()`, dan `await headers()`.
   - Mutasi Admin wajib memanggil `updateTag(tag)` untuk *read-your-writes* (bukan `revalidateTag(tag)` 1 argumen atau `{ expire: 0 }`).
   - Dilarang memanggil `git commit`, `git push`, `npm run build` produksi besar, atau `drizzle-kit push` / `migrate` tanpa izin eksplisit user.
   - Standar **Anti-AI Slop** diterapkan **inline saat menulis kode & UI**.

---

## 3. Langkah Selanjutnya (Estafet & Task Backlog)

1. **Status Task Selesai**:
   - [x] **Integrasi Upload Rekening Harian & DuitNow QR via Bot Telegram (`src/lib/telegram-bot.ts` & `/api/telegram/webhook`)**: Admin dapat mengunggah foto DuitNow QR (otomatis disimpan ke S3 IDCloudHost) sekaligus meng-update nomor rekening harian langsung dari chat Bot Telegram (`@myvelorastore_bot`), lengkap dengan perintah `/rekening`, `/status`, `/hapusqr`, `/tutup`, dan proteksi Admin Chat ID.
   - [x] **Logic Rotasi Rekening Harian Malaysia & Auto-Close Jam 22:00 MYT (`src/lib/store-hours.ts`)**: Setiap pukul 22:00 MYT (`Asia/Kuala_Lumpur`), rekening toko & DuitNow QR otomatis hilang dari website, halaman `/checkout` menampilkan **"STORE IS CLOSED NOW"** dengan tombol **"Order Directly via WhatsApp"** (otomatis memformat daftar item keranjang ke WA Admin), dan baru terbuka kembali setelah Admin mengunggah rekening/QR baru pada hari berikutnya di `/admin/settings`.
   - [x] **Perbaikan 5 Logic Storefront, Cart & Admin Panel**: Tombol `Select` (multi-versi) vs `Add` (1 versi) + fix `maxStock` Open PO dan validasi `preOrderDeadline` di `product-card.tsx`, Search + Filter + Paginasi 20 item/halaman di `/admin/products` (`products-manager.tsx`), sinkronisasi harga diskon pada Mobile Sticky Bar di `product-detail-client.tsx`, serta smart cross-category matching untuk *Photobook/Merch/Fashion/Stationery*.
   - [x] **Penyelarasan Tampilan & Logic Status Pre-Order vs Ready Stock**: Menghilangkan label angka `(10 available)` pada produk Pre-Order di halaman detail produk agar tidak membingungkan pembeli, status murni `Pre-Order`, tombol dinamis `Pre-Order Now` vs `Add to Cart`, dan `In Stock (X available)` khusus barang Ready Stock.
   - [x] **Penyempurnaan Total Logic Search & Filter Katalog Storefront**: Multi-keyword tokenized AND search, fuzzy punctuation/space normalization (`(G)I-DLE` vs `gidle`), mobile keyboard anti-autocorrect, opsi sort abjad A-Z & Z-A, serta auto-reset pagination ke halaman 1 saat filter berubah.
   - [x] **Storefront Catalog Pagination (20 Produk per Halaman)**: Membatasi render katalog storefront menjadi 20 produk per halaman (`ITEMS_PER_PAGE = 20`) pada `src/components/storefront/catalog-view.tsx` guna mengoptimalkan performa browser dan mobile rendering dari 383 produk aktif. Dilengkapi kontrol Prev/Next, nomor halaman pintar dengan ellipsis (`1`, `2`, `3` ... `totalPages`), touch target minimum 44px, otomatis reset ke halaman 1 saat filter diubah, dan smooth scroll ke bagian atas katalog saat berpindah halaman.
   - [x] **Bulk Import 244 Album K-Pop Resmi & Standarisasi Kategori (Total 383 Produk Aktif di PostgreSQL & S3)**: Mengimpor 244 album K-pop resmi dengan varian versi lengkap dari KSENDY ke kategori `Album`, menstandarisasi casing kategori menjadi `Album` (244 produk) dan `Lightstick` (139 produk), serta mengunggah seluruh foto Ultra-HD ke S3 IDCloudHost.
   - [x] **Bulk Import Seluruh Katalog Light Stick Resmi KSENDY (Total 139 Produk Aktif di PostgreSQL & S3)**: Mengimpor seluruh produk light stick resmi dari KSENDY lengkap dengan foto Ultra-HD (800x800 – 1900x1900) ke S3 IDCloudHost, status published, stok 10, dan harga paten Myvelora Ringgit Malaysia (RM).
   - [x] **Penyelarasan Katalog & Upgrade Foto Ultra-HD dari KSENDY (Total 72 Produk Aktif di PostgreSQL & S3)**: Mengganti 24 foto produk lama yang buram menjadi foto Ultra-HD (800x800 – 1600x1600) serta menambahkan 18 light stick resmi grup populer baru dari KSENDY (IVE Ver.2, aespa Ver.2, ITZY, DAY6, RIIZE, Red Velvet Ver.2, MONSTA X, KISS OF LIFE, ILLIT, G-DRAGON, SUPER JUNIOR, TVXQ!, NCT 127, HIGHLIGHT, WJSN, PLAVE, INFINITE, B1A4).
   - [x] **Bulk Upload Katalog K-Pop Lightstick Resmi (Total 54 Produk Aktif di PostgreSQL & S3)**: Mengunggah 54 produk resmi K-Pop Light Stick lengkap dengan foto resolusi tinggi ke IDCloudHost S3 (`velora` bucket), status `is_published = true`, stok 10, penetapan Pre-Order vs Ready Stock, dan kalkulasi harga paten Myvelora ($\text{CZK} \times 0.185028 \times 0.80 \rightarrow \text{FLOOR Integer RM}$).
   - [x] **Arsitektur Upload Gambar Anti-CORS IDCloudHost S3 (Commit `519cc56`)**: Menambahkan jalur upload server-side langsung ke S3 via Server Action Next.js sehingga aman 100% dari potensi error CORS browser pada bucket IDCloudHost Ceph S3, dengan kompresi Canvas WebP di sisi klien.
   - [x] **Migrasi Skema & Seeding Database Coolify PostgreSQL 18**: Struktur tabel toko (`products`, `product_versions`, `orders`, `order_items`, `customer_reviews`, `store_settings`) berhasil di-push via `drizzle-kit push`, data awal 10 katalog produk K-pop, pengaturan toko & FAQ tersimpan rapi, dan `Dockerfile` produksi Next.js 16 siap di-deploy di Coolify.
   - [x] **Inisialisasi Git & Commit Milestone 1 & 2 (Commit `e28ca83`)**: Repositori Git lokal diinisialisasi pada branch `main`, remote origin diarahkan ke `https://github.com/prokickstore1-maker/velora.git`, 125 file di-stage dan di-commit secara rapi dengan pengecualian `.env` lokal terjaga aman.
   - [x] **Penyempurnaan Total Panel Admin di Layar Ekstra Kecil (320px / iPhone SE Standard)**: Pembenahan kartu produk admin (`products-manager.tsx`) yang terpotong tombol `Add Version`-nya menjadi `sion`, penataan ulang tombol aksi `Edit Product` + `+ Version` + `Trash` menjadi pas di dalam kartu 256px, dan penambahan responsive collapsible sidebar admin (`admin-sidebar.tsx`).
   - [x] **Penyempurnaan Total Tata Letak Responsif Mobile Layar 320px (iPhone SE Standard)**: Eliminasi global horizontal blowout (`overflow-x: clip`), optimasi navbar (`grid-cols-[auto_1fr_auto]`), responsive stack pada `checkout-form.tsx` (CardHeader), adaptasi filter toolbar `catalog-view.tsx`, padding 2-kolom `product-card.tsx`, penyesuaian padding detail produk `product-detail-client.tsx`, dan carousel chevron hide.
   - [x] **Penyempurnaan Arsitektur Stok Transaksional & Anti-Overselling**: Penerapan Single-Pass Deadlock-Free Lock (`SELECT ... FOR UPDATE` terurut), akumulasi Total Physical Demand Map di [src/app/actions/checkout.ts](file:///d:/project%20web/myvelorastore/src/app/actions/checkout.ts), pemulihan stok komponen bundle simetris saat order dibatalkan di [src/app/actions/admin-orders.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-orders.ts), dan penanganan status Open Pre-Order di [src/components/storefront/product-card.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-card.tsx).
   - [x] **Pembaruan FAQ Pre-Order (PO) & Ready Stock**: Memperbarui konten FAQ di [src/db/mock-data.ts](file:///d:/project%20web/myvelorastore/src/db/mock-data.ts), [src/app/how-to-order/page.tsx](file:///d:/project%20web/myvelorastore/src/app/how-to-order/page.tsx), dan [src/components/storefront/faq-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/faq-section.tsx) dengan penjelasan komprehensif mengenai perbedaan Ready Stock vs Pre-Order, alur pengiriman, rekomendasi pemisahan order, serta proteksi kemasan anti-penyok.
   - [x] **Task 1 (Sinkronisasi Stok Bundle / Full Set)**: Transaksi ACID checkout di [src/app/actions/checkout.ts](file:///d:/project%20web/myvelorastore/src/app/actions/checkout.ts) kini memotong stok komponen satuan secara atomik untuk mode *Linked Stock*, dan UI storefront menghitung stok set dari minimum stok versi penyusunnya.
   - [x] **Task 2 (Non-Destructive Version Upsert)**: Di [src/app/actions/admin-products.ts](file:///d:/project%20web/myvelorastore/src/app/actions/admin-products.ts), versi ber-ID di-`UPDATE`, versi baru di-`INSERT`, dan versi yang dihapus di-`soft-deactivate` (`isActive = false`) dalam `db.transaction`.
   - [x] **Task 3 (Kolom Eksplisit `is_bundle` & `bundle_mode`)**: Drizzle schema PostgreSQL, blueprint, dan mock data kini memiliki kolom `is_bundle` dan `bundle_mode` tanpa tebak regex.
   - [x] **Task 4 (Auto-Close Pre-Order Deadline)**: Input datetime-local di Admin, helper format lokal [src/lib/date.ts](file:///d:/project%20web/myvelorastore/src/lib/date.ts), serta auto-lock tombol menjadi `Pre-Order Closed` di Storefront dan server checkout.
   - [x] **Task 5 (Hapus Angka Like Sintetis)**: Tombol Wishlist di [src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx) kini murni `❤️ Save` / `❤️ Saved` tanpa angka buatan.
   - [x] **Task 6 (Proteksi Upload S3 Produksi)**: Base64 diblokir pada `NODE_ENV === "production"` di server action & UI admin.
   - [x] **Task 7 (Single Source of Truth Kategori)**: Terpusat di [src/lib/constants.ts](file:///d:/project%20web/myvelorastore/src/lib/constants.ts) dan diimpor di Navbar, Catalog, dan Admin.
   - [x] **Category Banners (Lengkap 6 Kategori)**: Pemasangan aset banner resolusi tinggi `album-banner.jpg`, `merch-banner.jpg`, `lightstick-banner.jpg`, `photobook-banner.jpg`, `fashion-banner.jpg`, dan `stationery-banner.jpg` di `public/banners/` dan seksi "SHOP NOW" [src/components/storefront/category-banners-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/category-banners-section.tsx).
   - [x] **Dedicated How to Order Page (`/how-to-order`)**: Seksi How to Order dipindahkan dari beranda utama ke halaman terdedikasi [src/app/how-to-order/page.tsx](file:///d:/project%20web/myvelorastore/src/app/how-to-order/page.tsx) lengkap dengan detail 5 langkah, tips pemesanan, standar kemasan anti-penyok, FAQ pembayaran, dan navigasi baru.
   - [x] **Favicon Bundle Resmi**: Instalasi paket favicon (`favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`, `site.webmanifest`) di `public/` dan `src/app/`.
   - [x] **Category Banners (Lengkap 6 Kategori)**: Pemasangan aset banner resolusi tinggi `album-banner.jpg`, `merch-banner.jpg`, `lightstick-banner.jpg`, `photobook-banner.jpg`, `fashion-banner.jpg`, dan `stationery-banner.jpg` di `public/banners/` dan seksi "SHOP NOW" [src/components/storefront/category-banners-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/category-banners-section.tsx).
   - [x] **Dedicated How to Order Page (`/how-to-order`)**: Seksi How to Order dipindahkan dari beranda utama ke halaman terdedikasi [src/app/how-to-order/page.tsx](file:///d:/project%20web/myvelorastore/src/app/how-to-order/page.tsx) lengkap dengan detail 5 langkah, tips pemesanan, standar kemasan anti-penyok, FAQ pembayaran, dan navigasi baru.
   - [x] **Favicon Bundle Resmi**: Instalasi paket favicon (`favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`, `site.webmanifest`) di `public/` dan `src/app/`.
   - [x] **Task 8 (Mode Kuota Pre-Order)**: Kolom `pre_order_quota_mode` (`finite` vs `open`) aktif di schema, admin, dan storefront.

2. **Prioritas Sesi Berikutnya**:
   - Verifikasi manajemen pesanan & input nomor resi kurir di `/admin/orders`.
   - Persiapan deployment Milestone 3 Coolify (`Dockerfile`, health check endpoint `/api/health`).
