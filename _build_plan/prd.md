# Product Requirements Document (PRD) — Myvelora Store (`myvelorastore`)

**Version:** 1.0  
**Date:** 2026-11-15  
**Source Reference:** [Myvelora_Brand_Identity_PRD.pdf](file:///d:/project%20web/myvelorastore/Myvelora_Brand_Identity_PRD.pdf)  
**Design System:** [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md)  
**Theme Blueprint:** [_build_plan/blueprints/theme-config.css](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/theme-config.css)

---

## 1. Executive Summary & Brand Foundation

- **Project Name:** **Myvelora Store** (`mv` / `myvelorastore`)
- **Domain:** E-Commerce K-Pop Merchandise Store untuk pelanggan di Malaysia (mata uang **MYR / `RM`**).
- **Positioning:** Toko merchandise K-Pop dengan pengalaman belanja yang rapi, jelas, dan mudah melalui website, didukung konfirmasi pesanan via WhatsApp.
- **Brand Personality:** Modern, minimal, premium, friendly, dan profesional. Tidak berlebihan atau ramai.
- **Target Audience:** Penggemar K-Pop dan kolektor merchandise di Malaysia yang mencari produk serta informasi produk/harga/stok yang mudah dipahami, terutama melalui layar ponsel (*mobile-first*).
- **Public Storefront Language:** **100% Bahasa Inggris** dengan kalimat singkat, natural, dan langsung.
- **Inventory Model:** **Ready Stock Only** — stok langsung berkurang saat checkout berhasil menggunakan transaksi database ACID dan otomatis kembali apabila pesanan dibatalkan (*Cancelled*).

### Guardrails & Kepatuhan Wajib (Dari PDF Hal. 2, 6, & 7)
1. **Tanpa Klaim Belum Terkonfirmasi:** Website **dilarang keras** melakukan hardcode atau menampilkan klaim keaslian (*"100% Official/Authentic"*), klaim *ready stock* sebagai jargon promosi, kebijakan retur/refund, nominal ongkir, estimasi waktu pengiriman, metode pembayaran, atau URL domain sebelum datanya dikonfirmasi dan diaktifkan oleh Admin di *Store Settings*.
2. **Tanpa Ornamen "Malaysia":** Kata *"Malaysia"* tidak boleh digunakan sebagai elemen dekorasi atau ornamen desain. Kata tersebut hanya muncul secara fungsional pada field/label alamat pengiriman saat checkout.
3. **Photo-First Hierarchy:** Setiap kartu katalog maupun detail produk menampilkan **satu frame foto dominan** tanpa kerumunan kotak kecil. Informasi kartu produk dibatasi pada triad inti: **`Product Name` / `Version` / `Price (RM)`** (plus badge *New Arrival* atau *Sold Out* jika relevan).
4. **Anti-AI Slop (Inline Mode):** Diterapkan langsung saat pembuatan komponen UI, copy bahasa Inggris, tata letak mobile, dan komentar kode.

---

## 2. Visual Identity & Design Tokens (Locked)

**Mode Default:** **Light Mode First** (tanpa dark mode toggle di storefront publik agar konsisten dengan palet Ivory & White dari brand guide).

| Token Role | Name | HEX | Usage Rules |
| :--- | :--- | :--- | :--- |
| **Primary** | Deep Plum | `#47023B` | Identitas utama, top header/navbar, hero banner, tombol CTA utama, dan warna teks utama di atas latar Ivory/White. |
| **Accent** | Accent Pink | `#FA3890` | Sparkle logo `mv`, siku sudut frame (*corner accent*), nomor langkah italic (`01`–`05`), dan penekanan kata kunci pada headline berlatar gelap (`#47023B`). **Dilarang dipakai untuk teks kecil di atas latar putih/ivory.** |
| **Secondary** | Soft Blush | `#F5D5E3` | Kartu langkah *How to Order*, background pill/callout lembut, border halus elemen pendukung. |
| **Background** | Ivory | `#FBF7F4` | Latar belakang halaman utama yang hangat dan bersih. |
| **Surface / Frame** | White | `#FFFFFF` | Bingkai foto produk (`4:5`), kartu konten, input form, dan teks kontras tinggi di atas Deep Plum `#47023B`. |

### Tipografi
- **Headline (`font-heading`):** `Montserrat` (*ExtraBold Italic* / *Bold Italic*, `uppercase`, tight tracking) — untuk judul seksi/banner seperti `NEW ARRIVAL`, `PRODUCT DETAILS`, `HOW TO ORDER`, `CUSTOMER REVIEWS`.
- **Supporting Product Triad (`Product Name / Version / Price`):** `Montserrat` (*Medium* `500` / *SemiBold* `600`).
- **Body & UI Copy (`font-sans`):** `Poppins` (*Regular* `400` / *Medium* `500`) — untuk deskripsi, formulir checkout, dan label UI.

---

## 3. Tech Stack & Arsitektur Teknis

- **Framework:** Next.js **16.4** (App Router, Turbopack default, React **19.3**).
- **Styling & UI:** Tailwind CSS **v4** + Shadcn UI (komponen di `_build_plan/blueprints/shadcn-components.txt`).
- **Database & ORM:** PostgreSQL + Drizzle ORM (`pg-core`, skema di `_build_plan/blueprints/schema-proposal.ts`).
- **Object Storage:** S3 / MinIO (untuk foto produk, aset logo master `mv`, QR DuitNow, screenshot review, dan bukti pembayaran pembeli) menggunakan **Presigned URL** + kompresi gambar di sisi klien melalui Canvas (`webp`/`jpeg`) sebelum upload.
- **Deployment Target:** Coolify Self-Hosted Engine (Docker multi-stage standalone build di `_build_plan/blueprints/Dockerfile`).

### Aturan Wajib Next.js 16.4
1. **Async Request APIs:** `params`, `searchParams`, `cookies()`, `headers()`, dan `draftMode()` wajib di-`await`.
2. **Cache Invalidation di Server Actions:**
   - Gunakan `updateTag(tag)` untuk mutasi Admin (*read-your-writes*) agar perubahan katalog, stok, review, maupun *Store Settings* langsung muncul di storefront.
   - Gunakan `revalidateTag(tag, 'max')` untuk pembacaan toleran *stale-while-revalidate*.
3. **Turbopack Default:** Jangan menambahkan flag `--turbopack` manual atau plugin webpack kustom.
4. **Linting & Typecheck:** Gunakan `npm run lint` (`eslint` flat config) dan `npx tsc --noEmit` (wajib exit code `0`).

---

## 4. Spesifikasi Modul MVP

### A. Storefront Publik (`100% English Copy`, `Mobile-First`)
1. **Header & Navigation:**
   - Latar Deep Plum `#47023B`, menampilkan logo resmi `mv` (mengambil aset logo SVG/PNG dari *Store Settings* atau fallback tipografi sementara sebelum aset final diunggah), tautan ringkas (*Shop*, *New Arrivals*, *How to Order*, *Reviews*, *Track Order*), serta ikon *Cart Drawer* dengan penghitung item.
2. **Hero & New Arrival Showcase:**
   - Desain *Photo-First* dengan frame foto utama besar (`4:5`), headline italic uppercase (`NEW ARRIVAL`), serta tombol aksi langsung menuju katalog atau produk unggulan.
3. **Catalog & Product Cards (`/` & `/shop`):**
   - Filter berdasarkan kategori/status (*All*, *New Arrivals*, *In Stock*) dan pencarian nama produk.
   - Kartu produk mengikuti template PDF: satu frame foto rasio `4:5` berlatar `#FFFFFF` dengan aksen sudut `#FA3890`, menampilkan `Product Name`, `Version` (ringkasan varian atau varian default), dan `Price (RM)`. Produk habis stok menampilkan label `SOLD OUT` dengan rapi.
4. **Product Details Page (`/products/[slug]`):**
   - Satu frame foto utama dominan (berganti mengikuti foto *Version* yang dipilih jika tersedia).
   - Pemilih **Version** (misal: *Ver. A*, *Ver. B*, *Set*, *Member*) yang secara dinamis memperbarui **Price (`RM`)**, **SKU**, dan **Stock Availability**.
   - Pemilih kuantitas (dibatasi maksimal stok aktual di DB) dan tombol **Add to Cart**.
5. **Cart Drawer & 5-Step Checkout Flow (Hal. 6 PDF):**
   - **Step 01 — Browse Products:** *Explore our website and choose your items.*
   - **Step 02 — Add to Cart:** *Select your preferred options and add items to your cart.*
   - **Step 03 — Checkout (`/checkout`):** *Enter your shipping details and review your order.*
     - Form pengiriman: *Full Name*, *WhatsApp Number* (`+60...`), *Email* (opsional/notifikasi), *Address Line 1 & 2*, *Postcode* (5 digit), *City*, *State / Negeri* (dropdown negeri Malaysia).
     - Ringkasan biaya dihitung di server & ditampilkan transparan: `Subtotal (RM)` + `Shipping Fee (RM)` menggunakan **Flat Rate** dari *Store Settings* atau otomatis `RM 0.00 (Free Shipping)` apabila subtotal mencapai ambang `free_shipping_min_rm`.
   - **Step 04 — Complete Payment (`/orders/[orderCode]/payment`):** *Follow the payment instructions to place your order.*
     - Menampilkan instruksi pembayaran yang aktif di *Store Settings* (DuitNow QR image dan/atau detail rekening Bank Transfer MYR). Apabila Admin belum mengaktifkan metode pembayaran, halaman menampilkan pemberitahuan netral bahwa detail pembayaran sedang disiapkan tanpa membuat klaim palsu.
     - Form unggah bukti pembayaran (*Payment Receipt* — dikompresi otomatis di browser via HTML5 Canvas lalu diunggah ke S3/MinIO via presigned URL) + catatan referensi transfer opsional.
   - **Step 05 — Order Confirmation (`/orders/[orderCode]/confirmation`):** *Receive your order confirmation via WhatsApp.*
     - Menampilkan ringkasan pesanan (`Order Code`, daftar item, total `RM`, status pembayaran).
     - Tombol utama **Confirm Order via WhatsApp** (`https://wa.me/<admin_wa>?text=...`) dengan draf pesan Bahasa Inggris terstruktur berisi `Order Code`, rincian item, total pembayaran, dan tautan/status bukti bayar.
     - Saat pesanan dibuat / bukti bayar dikirim, sistem mengirim **notifikasi otomatis via Bot (Telegram / WhatsApp API)** ke Admin.
6. **Track Order (`/track-order`):**
   - Pembeli dapat memeriksa status pesanan (`Pending Payment`, `Payment Submitted`, `Paid / Verified`, `Packing`, `Shipped` + Tracking Number, `Completed`, `Cancelled`) menggunakan `Order Code` + 4 digit terakhir nomor WhatsApp.
7. **Section *How to Order*, *Customer Reviews*, & *FAQ*:**
   - **How to Order:** Merender 5 langkah resmi Bahasa Inggris dari halaman 6 PDF.
   - **Customer Reviews:** Galeri horizontal/grid *screenshot* ulasan pelanggan berbingkai rasio `9:16` dengan judul Inggris *CUSTOMER REVIEWS*.
   - **FAQ & Store Policies:** Seksi kondisional — **hanya dirender apabila Admin telah mengisi dan mengaktifkan entri FAQ/kebijakan yang sudah final**.

### B. Admin Dashboard (`/admin`, Protected Route)
1. **Authentication:** Sesi admin terlindungi (password/credential hash di server + HTTP-only cookie).
2. **Products & Versions Manager (`/admin/products`):**
   - CRUD produk (`name`, `slug`, `category`, `description`, `isNewArrival`, `isPublished`).
   - CRUD multi-varian *Version* (`versionName`, `sku`, `priceRm`, `stock`, `imageUrl`, `isActive`).
   - Upload foto ke S3/MinIO dengan kompresi klien.
3. **Orders & Stock Verification (`/admin/orders`):**
   - Daftar pesanan masuk dengan filter status dan pencarian `Order Code` / nama pembeli.
   - Pratinjau foto bukti pembayaran (*Payment Receipt*).
   - Transisi status pesanan (`pending_payment` -> `payment_submitted` -> `verified` -> `packing` -> `shipped` -> `completed`, atau `cancelled`).
   - Input `trackingNumber` dan `courierName` saat status diubah menjadi `shipped`.
   - Tombol **Message Buyer on WhatsApp** untuk konfirmasi manual/kirim resi.
4. **Customer Reviews Manager (`/admin/reviews`):**
   - Upload screenshot testimoni pelanggan, atur caption singkat Bahasa Inggris, urutan tampil, dan status publikasi.
5. **Dynamic Store Settings (`/admin/settings`):**
   - **Brand Assets:** Upload aset logo `mv` master (SVG/PNG transparan) & favicon.
   - **Payment Config:** Toggle aktif/nonaktif metode bayar, nama bank, nomor rekening, nama pemilik rekening, upload gambar DuitNow QR.
   - **Shipping Config (Malaysia):** Toggle aktif/nonaktif ongkir, nilai **Flat Rate Shipping (`RM`)**, nilai **Free Shipping Minimum (`RM`)**.
   - **WhatsApp & Bot Notification:** Nomor WhatsApp Admin (`60...`), tipe bot (`telegram` / `whatsapp_api` / `none`), token/chat ID/webhook URL (disimpan aman di server).
   - **FAQ & Policies:** Toggle publikasi dan editor daftar FAQ/kebijakan toko yang sudah disahkan (mencegah klaim sebelum disetujui).

### C. Standar Mobile-First & Optimasi In-App Browser
Karena mayoritas pelanggan mengakses link toko dari Instagram Bio/Story di ponsel (`360px–430px`):
1. **In-App Browser Compatibility:** Seluruh layout memakai `min-h-dvh` dan `env(safe-area-inset-bottom)` agar aman di Instagram, TikTok, dan WhatsApp *in-app browser* serta perangkat ber-notch/home-bar.
2. **Thumb-Zone & Anti-Misclick:** Seluruh target sentuh minimal `44x44px` (`min-h-11`), tanpa `active:scale-95` pada tombol aksi, dan tanpa `onClick` pada wrapper kartu agar tidak salah pencet saat scroll.
3. **Sticky Mobile Action Bar:** Halaman *Product Details* menyediakan bar bawah tetap berisi harga `RM` versi aktif dan tombol `ADD TO CART` di layar ponsel; halaman *Checkout* memiliki ringkasan total & tombol submit yang jelas.
4. **Checkout Ergonomics (Anti-iOS Auto-Zoom):** Field input berukuran minimal `48px` (`h-12`) dengan font `16px` (`text-base`) untuk mencegah Safari iOS auto-zoom, lengkap dengan `inputMode="tel"` (WhatsApp `+60`), `inputMode="numeric"` (Postcode 5 digit), dan `accept="image/*"` untuk upload bukti bayar dari galeri/kamera ponsel.
5. **Swipeable Story Reviews:** Galeri *Customer Reviews* (`9:16`) menggunakan *horizontal snap carousel* di layar ponsel agar nyaman digeser satu tangan.
6. **Mobile-Friendly Admin Dashboard:** Tabel daftar pesanan dan produk otomatis beralih menjadi *stacked action cards* di layar `< md` sehingga Admin dapat memeriksa bukti bayar, mengubah status, dan memasukkan tracking number langsung dari ponsel.

---

## 5. Keamanan, Integritas Stok (ACID), & Upload Pipeline

1. **Zero Client-Side Price Trust:** Client hanya mengirimkan array `{ productVersionId, quantity }` dan data pengiriman. Server menghitung ulang seluruh harga satuan (`priceRm`), subtotal, ongkir (`shippingFeeRm`), dan grand total (`totalRm`) dari database.
2. **ACID Stock Locking (`SELECT ... FOR UPDATE`):**
   - Pembuatan order dijalankan dalam satu `db.transaction(async (tx) => { ... })`.
   - Baris pada `product_versions` dikunci dengan `.for('update')` (diurutkan berdasarkan `id` untuk mencegah deadlock).
   - Validasi `version.isActive === true` dan `version.stock >= item.quantity`. Jika tidak cukup, transaksi di-rollback dengan pesan error jelas (`Insufficient stock for <Product> - <Version>`).
   - Stok dikurangi secara atomik dalam transaksi yang sama.
3. **Automatic Stock Restock on Cancel:** Jika Admin mengubah status order yang belum dibatalkan menjadi `cancelled`, sistem melakukan transaksi atomik untuk mengembalikan `stock` ke masing-masing `product_versions` dan menandai `stockRestoredAt` agar tidak terjadi double-restock.
4. **Presigned S3/MinIO Upload Security:**
   - Endpoint pembuat presigned URL memvalidasi tipe MIME (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` khusus admin logo) dan batas ukuran file (`<= 5 MB` untuk produk/admin, `<= 3 MB` untuk bukti bayar).
   - Bukti bayar menggunakan kunci path unik berisi `orderCode` agar tidak dapat menimpa file milik pesanan lain.

---

## 6. Roadmap Milestone

1. **Milestone 1 (`milestone-1-init.md`):** Inisialisasi Next.js 16.4, Tailwind CSS v4 + `theme-config.css`, Google Fonts (`Montserrat`, `Poppins`), Shadcn UI, Drizzle ORM + PostgreSQL, utilitas S3/MinIO & kompresi Canvas.
2. **Milestone 2 (`milestone-2-core.md`):** Implementasi skema database, Server Actions & API routes (ACID checkout, order tracking, bot notification), Storefront publik 100% English, dan Admin Dashboard lengkap.
3. **Milestone 3 (`milestone-3-coolify.md`):** Audit checklist desain PDF Hal. 7, audit Anti-AI Slop & responsivitas ponsel, `npx tsc --noEmit` + `npm run lint` + `npm run build`, serta kesiapan deploy Coolify.
