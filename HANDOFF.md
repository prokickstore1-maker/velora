# HANDOFF.md — Estafet Teknis & Guardrail Myvelora Store

**Last Updated:** 2026-11-17  
**Current Phase:** Milestone 1 Complete -> **Milestone 2 (Core Storefront, 5-Step Checkout & Admin Dashboard)**  
**Source Documents:** [_build_plan/prd.md](file:///d:/project%20web/myvelorastore/_build_plan/prd.md), [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md), [Myvelora_Brand_Identity_PRD.pdf](file:///d:/project%20web/myvelorastore/Myvelora_Brand_Identity_PRD.pdf)

---

## 1. Status Terkini

- **Milestone 1 SELESAI & Milestone 2 Storefront SELESAI**: 
  - Proyek Next.js 16.4.6 terinisialisasi dengan TypeScript, Tailwind CSS v4, ESLint 9, `output: "standalone"` di `next.config.ts`, Google Fonts `Montserrat` dan `Poppins`, 17 komponen Shadcn UI, skema Drizzle ORM PostgreSQL (`src/db/schema.ts` & `src/db/index.ts`), utilitas S3/MinIO presigned upload (`src/lib/s3.ts`), utilitas kompresi Canvas (`src/lib/image-compress.ts`), serta komponen logo resmi `<BrandLogo />`.
  - Seluruh Storefront Publik (Navbar 3-kolom, **Hero Banner Carousel Slider** yang diatur langsung oleh Admin di `/admin/settings`, seksi **"SHOP NOW" Category Collage Banners** (`ALBUM`, `MERCHANDISE`, `LIGHTSTICK`, `PHOTOBOOK`, `FASHION`, `STATIONERY`), seksi **`PRE ORDER`**, **`NEW ARRIVAL`**, dan **`BEST SELLER`** dengan desain kartu produk 1:1, status stok hijau/marun, dan rentang harga `RM`, tombol mengambang WhatsApp, Katalog Grid 2-kolom mobile, Product Detail dengan sticky thumb-zone bar & Customer Reviews, Cart Drawer 320px, Checkout Form 5 langkah dengan `@radix-ui/react-select` proporsional, serta Order Tracking) telah terimplementasi dan teroptimasi mobile.
  - Mode preview lokal bebas error unhandled TCP PostgreSQL berkat penanganan isolasi `hasDatabaseUrl` langsung di `src/db/index.ts` dan Server Actions.
- **Verifikasi Lolos**: `npx tsc --noEmit` berhasil EXIT=0 dan `npm run lint` bersih tanpa warning/error. Dev server berjalan normal di `http://localhost:3000`.
- **Izin Operasi Dipatuhi**: Belum ada perintah `git commit`, `git push`, build produksi besar, atau eksekusi migrasi database fisik (`drizzle-kit push`) yang dijalankan tanpa izin user.

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
