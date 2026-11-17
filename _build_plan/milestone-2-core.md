# Milestone 2: Core Storefront, 5-Step Checkout & Admin Dashboard

**Goal:** Membangun seluruh halaman Storefront publik (100% Bahasa Inggris, Photo-First) dan Admin Dashboard fungsional lengkap dengan transaksi stok ACID, upload bukti bayar, konfirmasi WhatsApp, notifikasi bot Admin, dan *Dynamic Store Settings*.

**Referensi Wajib:**
- [_build_plan/prd.md](file:///d:/project%20web/myvelorastore/_build_plan/prd.md)
- [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md)
- [AGENTS.md](file:///d:/project%20web/myvelorastore/AGENTS.md)

---

## Checklist Pekerjaan

### 1. Data Access Layer & Cache Strategy (Next.js 16)
- [ ] Buat query publik ter-cache (`unstable_cache` + cache tags: `products`, `reviews`, `settings`) agar halaman storefront cepat.
- [ ] Pada setiap Server Action mutasi Admin, gunakan `updateTag(tag)` (*read-your-writes*) sehingga update katalog, stok, review, dan settings langsung terefleksi di UI.
- [ ] Pastikan seluruh Route Handlers & Dynamic Pages melakukan `await params`, `await searchParams`, `await cookies()`, dan `await headers()`.

### 2. Storefront Publik (100% English Copy & Photo-First UI)
- [ ] **Header & Footer (`src/components/storefront/`):**
  - Header Deep Plum `#47023B` dengan logo `mv`, navigasi (`Shop`, `New Arrivals`, `How to Order`, `Reviews`, `Track Order`), dan `CartDrawer` sheet ramah sentuhan (`min-h-11` / `44x44px`).
  - Footer bersih sesuai aturan PDF (*Clear Hierarchy*: hanya link berguna, tanpa klaim operasional yang belum aktif).
- [ ] **Landing Page (`src/app/page.tsx`) & Catalog (`src/app/shop/page.tsx`):**
  - Hero / New Arrivals section dengan headline `NEW ARRIVAL` (`Montserrat ExtraBold Italic`).
  - Product Card berdesain *Photo-First* (`aspect-[4/5]`, `.mv-corner-frame`, triad informasi `Product Name / Version / RM Price`, badge `NEW ARRIVAL` atau `SOLD OUT`). Di layar ponsel: 1 kolom (`<390px`) / 2 kolom rapat (`>=390px`), tanpa wrapper `onClick` dan tanpa `active:scale-95` untuk mencegah misclick saat scroll.
  - Filter kategori/status (scrollable pill carousel di ponsel) dan pencarian real-time.
- [ ] **Product Details Page (`src/app/products/[slug]/page.tsx`):**
  - Satu frame foto utama dominan (berganti saat user memilih versi yang memiliki foto khusus).
  - Pemilih **Version** (pill interaktif minimal tinggi `44px` menampilkan nama versi, harga `RM`, dan status ketersediaan stok).
  - Kontrol kuantitas terikat batas stok aktual + tombol `ADD TO CART` (dengan **Sticky Bottom Action Bar** + `.pb-safe` pada layar ponsel).
- [ ] **How to Order & Customer Reviews Sections:**
  - Komponen `HowToOrderSection` menampilkan tepat 5 langkah resmi Bahasa Inggris (Hal. 6 PDF) bernomor `01`–`05`.
  - Komponen `CustomerReviewsSection` menampilkan galeri screenshot berbingkai `9:16` dengan header `CUSTOMER REVIEWS` (menggunakan `.mv-snap-carousel` di layar ponsel agar nyaman digeser satu tangan).
  - Komponen `FaqSection` **hanya dirender** bila `storeSettings.faqEnabled === true` dan `faqItems.length > 0`.

### 3. 5-Step Checkout, ACID Stock Locking & WhatsApp Confirmation
- [ ] **Checkout Page (`src/app/checkout/page.tsx`):**
  - Form alamat pengiriman Malaysia (Name, WhatsApp `+60` dengan `inputMode="tel"`, Email opsional, Address Line 1 & 2, Postcode dengan `inputMode="numeric"`, City, State/Negeri dropdown) tanpa menggunakan kata *"Malaysia"* sebagai ornamen dekoratif. Seluruh field memakai minimal `h-12 text-base` (`16px`) untuk mencegah auto-zoom Safari iOS.
  - Kalkulasi `Subtotal (RM)` + `Shipping Fee (RM)` berbasis Flat Rate dari `storeSettings` (atau `RM 0.00` jika mencapai `freeShippingMinRm`).
  - Server Action / API `POST /api/orders`:
    - Hitung ulang seluruh harga dari DB (`productVersions`).
    - Eksekusi `db.transaction` dengan `.for('update')` pada `productVersions` yang diurutkan per `id`.
    - Kurangi `stock` secara atomik; buat record `orders` & `orderItems`.
    - Panggil `updateTag('products')` dan kirim notifikasi order baru ke Bot Admin (`telegram` / `whatsapp_api`, non-blocking agar tidak menggagalkan checkout).
- [ ] **Complete Payment Page (`src/app/orders/[orderCode]/payment/page.tsx`):**
  - Tampilkan instruksi bayar (DuitNow QR / detail bank) **hanya** jika `storeSettings.paymentEnabled === true`.
  - Input unggah bukti bayar mendukung pilihan galeri/kamera ponsel (`accept="image/*"`), dikompresi di browser via Canvas -> upload via presigned URL -> simpan `paymentReceiptUrl` dan ubah status menjadi `payment_submitted` + kirim notifikasi bot ke Admin.
- [ ] **Order Confirmation Page (`src/app/orders/[orderCode]/confirmation/page.tsx`):**
  - Tampilkan ringkasan order & status terkini.
  - Tombol **Confirm Order via WhatsApp** (`wa.me`) dengan teks otomatis Bahasa Inggris berisi `Order Code`, daftar item (`Product Name - Version x Qty`), Total (`RM`), dan status pembayaran.
- [ ] **Track Order Page (`src/app/track-order/page.tsx`):**
  - Verifikasi dengan `Order Code` + 4 digit terakhir nomor WhatsApp pembeli untuk menampilkan status order dan nomor resi (`trackingNumber`).

### 4. Admin Dashboard (`/admin`, Protected)
- [ ] **Auth Guard (`/admin/login` & `src/lib/admin-auth.ts`):** Cookie session terenkripsi/ditandatangani HMAC di server.
- [ ] **Products & Versions CRUD (`/admin/products`):** Tambah/edit produk, atur multiple `Version` (harga RM, stok, SKU, foto versi), toggle `New Arrival` dan `Published` (otomatis tampil sebagai *stacked cards* di layar ponsel `< md`).
- [ ] **Orders Management (`/admin/orders`):** Tabel pesanan di desktop & *Mobile Stacked Action Cards* di `< md` agar Admin bisa langsung cek modal pratinjau bukti bayar, update status (`verified`, `packing`, `shipped` + input kurir & resi, `completed`, `cancelled` dengan auto-restock transaksi ACID), dan klik WhatsApp ke pembeli dari ponsel.
- [ ] **Customer Reviews CRUD (`/admin/reviews`):** Upload screenshot ulasan, edit caption, atur urutan & publikasi.
- [ ] **Dynamic Store Settings (`/admin/settings`):** Upload logo `mv` resmi, kelola rekening & DuitNow QR (`paymentEnabled`), tarif Flat Rate & ambang Free Shipping (`shippingEnabled`), nomor WA Admin & pengaturan bot notifikasi, serta editor FAQ/Return Policy.

### 5. Verifikasi Milestone 2
- [ ] Pastikan seluruh copy publik berbahasa Inggris dan bebas klaim operasional yang belum diaktifkan di *Store Settings*.
- [ ] Jalankan `npx tsc --noEmit` (EXIT=0) dan `npm run lint`.
- [ ] Perbarui `DAILY_TASKS.md` dan `HANDOFF.md`.
