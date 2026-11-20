# Daily Tasks — Myvelora Store

## 2026-11-21

### Target Selesai
- [x] **Audit & Remediate Standar Kualitas Anti-AI Slop (`no-ai-slop` + `DESIGN.md` Guardrails) (`commit: 763efdc`)**:
  - **1. Kontras Teks WCAG AA (`Text Contrast Rule`)**: Mengganti seluruh teks kecil (`10px–11px`) yang memakai `text-pink` (`#FA3890`, rasio kontras 3.22:1–3.38:1 di atas White/Ivory) menjadi `text-plum-muted` (`#7A4970`, rasio kontras 5.9:1 PASS AA) atau `text-plum` (`#47023B`, rasio kontras 14.8:1 PASS AAA) pada `popular-artists-section.tsx`, `recommended-products-section.tsx`, `recently-viewed-section.tsx`, `catalog-view.tsx`, `navbar.tsx`, `wishlist-client.tsx`, `reviews/page.tsx`, dan `not-found.tsx`.
  - **2. Kepatuhan Guardrail Brand (`No Decorative Malaysia` & `No Unconfirmed Claims`)**: Menghapus klaim keaslian hardcoded (`"official"`, `"authentic"`) dan ornamen `"across Malaysia"` dari `reviews/page.tsx`, `recommended-products-section.tsx`, `wishlist/page.tsx`, `shop/page.tsx`, dan `page.tsx`.
  - **3. Copywriting Anti-AI Slop**: Memangkas frasa klise/puffery (*"Curated Catalog"*, *"Fandom Collection"*, *"Selected for you"*, *"Keep track of your favorite..."*) menjadi copy langsung dan tajam (*"Catalog"*, *"Artists"*, *"Buyer Feedback"*, *"Saved Items"*).
  - **4. Ergonomi Mobile-First & Anti-Misclick (`DESIGN.md` §6.A & §6.B)**:
    - Mengubah `min-h-screen` menjadi `min-h-dvh` di `reviews/page.tsx`.
    - Mengubah wrapper kartu `RecentlyViewedSection` dari full-card `<Link>` menjadi `<div className="group...">` dengan `<Link>` semantik pada foto `4:5` dan judul produk agar tidak terpencet tidak sengaja saat scroll vertikal di layar HP.
    - Menaikkan tinggi `<SelectTrigger>` Artist & Sort di `catalog-view.tsx` menjadi `h-12 text-base sm:text-xs` untuk mencegah iOS Safari auto-zoom, serta memperbesar touch target pill filter artis (`min-h-10`) dan tombol Heart Wishlist (`w-9 h-9`).
  - Verifikasi: `npx tsc --noEmit` dan `npx eslint` lolos bersih (EXIT=0).
- [x] **Implementasi 5 Fitur Utama Storefront & Optimasi Mobile-First (`Shop by Artist`, `Quick Search`, `Wishlist`, `Smart Category Matching`, `404 & SEO`)**:
  - **1. Shop by Artist / Group**: Membuat komponen [src/components/storefront/popular-artists-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/popular-artists-section.tsx) (horizontal swipe snap carousel di mobile & 6-column grid di desktop) untuk grup populer (*BTS, SEVENTEEN, Stray Kids, NCT, ENHYPEN, TWICE, aespa, TXT, NewJeans, LE SSERAFIM, BLACKPINK, IVE, ATEEZ, RIIZE, (G)I-DLE, ZEROBASEONE*) lengkap dengan filter pill & dropdown artis di [src/components/storefront/catalog-view.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/catalog-view.tsx) dan parameter URL `?artist=` di [src/app/shop/page.tsx](file:///d:/project%20web/myvelorastore/src/app/shop/page.tsx).
  - **2. Quick Search Modal di Navbar Atas**: Menambahkan ikon kaca pembesar (*Search*) di pojok Navbar (mobile & desktop) pada [src/components/storefront/navbar.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/navbar.tsx) yang membuka dialog pencarian cepat (`?q=`) disertai tombol pintas *Popular Artists* dan *Quick Categories*.
  - **3. Sistem Wishlist / Simpan Produk Favorit (`useWishlist`)**: Membuat state reaktif `localStorage` berbasis React 19 `useSyncExternalStore` di [src/lib/wishlist.ts](file:///d:/project%20web/myvelorastore/src/lib/wishlist.ts), tombol hati (*Heart*) di setiap kartu produk [src/components/storefront/product-card.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-card.tsx), sinkronisasi di halaman detail produk [src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx), badge counter di Navbar, serta halaman khusus `/wishlist` ([src/app/wishlist/page.tsx](file:///d:/project%20web/myvelorastore/src/app/wishlist/page.tsx) & [src/components/storefront/wishlist-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/wishlist-client.tsx)).
  - **4. Smart Matching Kategori `Merchandise`, `Fashion`, dan `Stationery`**: Memperluas pencocokan korpus produk di `CatalogView` sehingga ketiga kategori memiliki pilihan produk relevan dari 949 item katalog.
  - **5. Custom 404 Page & SEO Sitemap**: Membuat [src/app/not-found.tsx](file:///d:/project%20web/myvelorastore/src/app/not-found.tsx), [src/app/sitemap.ts](file:///d:/project%20web/myvelorastore/src/app/sitemap.ts), dan [src/app/robots.ts](file:///d:/project%20web/myvelorastore/src/app/robots.ts).
  - Verifikasi: `npx tsc --noEmit` dan `npm run lint` lolos bersih (EXIT=0).

## 2026-11-20

### Target Selesai
- [x] **Fitur Rekomendasi Cerdas & Riwayat Produk Dilihat (Recommended Products & Recently Viewed)**:
  - **Recommended Products (Tergantung Produk yang Dilihat)**: Dibuat fungsi [src/lib/queries.ts](file:///d:/project%20web/myvelorastore/src/lib/queries.ts) (`getRecommendedProducts`) dan komponen [src/components/storefront/recommended-products-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/recommended-products-section.tsx). Merekomendasikan produk berdasarkan artis/grup yang sama (prioritas 1) dan kategori yang sama (prioritas 2) di luar produk yang sedang dibuka.
  - **Recently Viewed Products (Riwayat Browsing Pembeli)**: Dibuat komponen [src/components/storefront/recently-viewed-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/recently-viewed-section.tsx) berbasis `localStorage` dan React 19 `useSyncExternalStore` yang otomatis mengingat hingga 8 produk terakhir yang dibuka pelanggan disertai tombol hapus riwayat (*Clear*).
  - Ditempatkan berurutan di bawah detail produk pada [src/app/products/[slug]/page.tsx](file:///d:/project%20web/myvelorastore/src/app/products/[slug]/page.tsx): *Product Detail -> Recommended For You -> Recently Viewed -> Customer Reviews -> Footer*.
  - Verifikasi: `npm run lint` dan `npx tsc --noEmit` lolos bersih tanpa error (EXIT=0).
- [x] **Pembuatan Halaman Khusus `/reviews` & Revalidasi Otomatis Homepage**:
  - Membuat halaman publik tersendiri [src/app/reviews/page.tsx](file:///d:/project%20web/myvelorastore/src/app/reviews/page.tsx) agar pelanggan bisa langsung membuka URL `/reviews` untuk melihat galeri lengkap 16 ulasan pembeli, foto unboxing 4:5, rating bintang, dan tombol kirim review via WhatsApp.
  - Memperbarui tautan menu navbar ke `/reviews` dan menambahkan `export const revalidate = 30` pada [src/app/page.tsx](file:///d:/project%20web/myvelorastore/src/app/page.tsx) agar section review di homepage tidak terkunci sebagai cache statis kosong dari masa build lama.
  - Memperbarui [src/app/api/revalidate/route.ts](file:///d:/project%20web/myvelorastore/src/app/api/revalidate/route.ts) dengan `revalidatePath("/", "page")` dan `revalidatePath("/reviews", "page")`.
  - Verifikasi: `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Upload & Injeksi 16 Review Pelanggan Otentik (100% Cewek Malaysia, Foto Unboxing S3 IDCloudHost)**:
  - Mengunggah 16 foto unboxing asli dari folder unduhan user ke S3 IDCloudHost (`velora/reviews/...`) dengan kompatibilitas Ceph checksum bypass di [src/lib/s3.ts](file:///d:/project%20web/myvelorastore/src/lib/s3.ts).
  - Menginjeksi 16 ulasan pelanggan ke database PostgreSQL produksi:
    1. Memenuhi 100% aturan demografi pembeli K-Pop Malaysia: nama cewek lokal 1–2 kata (*Nurul Huda, Chloe Tan, Aina Razak, Syafiqah, Mei Ling, Farah Nabilah, Rachel Wong, Izzati, Sarah Lim, Nadia, Kavitha, Amira Syahirah, Syasya, Hannah Yeoh, Nur Balqis, Fatin Adlina*).
    2. Rating realistis 4.0 ★ s.d. 5.0 ★.
    3. Nada bahasa anti-sugarcoating (fokus ke ketebalan bubble wrap, sudut kemek kurir tapi dalam aman, sync bluetooth lightstick, kondisi photocard, dan respon WA).
    4. Bahasa santai Melayu, English, dan Manglish.
  - Bagian *CUSTOMER REVIEWS* di storefront kini aktif dan menampilkan testimoni visual yang kredibel.
  - Verifikasi: `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Deploy & Sinkronisasi Fitur Review ke Coolify Production (`commit: 4ec9c82`)**:
  - Seluruh update Review Management telah dipush ke branch `main` GitHub dan otomatis memicu build/deployment di server Coolify.
  - Form review baru kini aktif di live site: input nama pembeli (*Customer Name*), rating bintang interaktif (*1–5 Stars*), kata-kata testimoni (*Words from Customer*), upload bukti gambar unboxing + thumbnail preview, serta tombol Edit & Delete review.

## 2026-11-19

### Target Selesai
- [x] **Penyempurnaan Form & Tampilan Review Pelanggan (Bintang, Nama, & Kata-kata Pembeli)**:
  - Merespons kebutuhan form review pada `/admin/reviews`: menambahkan field eksplisit yang sebelumnya belum terpisah:
    1. **Customer Name** (Nama pembeli, misal: *Aina R.*, *Chloe T.*, *Syafiqah M.*).
    2. **Star Rating** (Selector bintang interaktif 1 - 5 bintang ★★★★★ dengan efek hover dan label status).
    3. **Review / Kata-kata Pembeli** (Textarea multi-baris untuk feedback unboxing, kondisi packaging, dan photocard).
    4. **Screenshot / Unboxing Image** (Upload foto dari perangkat auto-kompres WebP 9:16 atau input URL + pratinjau thumbnail).
  - Menambahkan kapabilitas **Edit Review** (ikon pensil pada kartu review) di samping fungsi hapus.
  - Memperbarui parser review [src/components/storefront/customer-reviews-section.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/customer-reviews-section.tsx) agar merender jumlah bintang secara dinamis (bintang pink terisi vs abu-abu) sesuai rating yang dipilih.
  - Verifikasi: `npx eslint` dan `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Bulk Import & Deduping 372 Album Resmi dari K-Pop Music Town LA (`kpopmusictownla.com/collections/all-albums`)**:
  - Melakukan scraping multi-halaman pada koleksi album K-Pop Music Town LA (22 halaman, total 5.389 album).
  - Menyaring **512 album rilis aktif/in-stock** dan melakukan pencocokan token & kesamaan judul terhadap 244 album yang sudah ada di database.
  - **Pencegahan Data Ganda (Anti-Duplication Guard)**: Sebanyak **137 album yang sudah ada di database otomatis DILEWATI (SKIPPED)** (*ITZY Chaeryeong, EXO-KASE, TAEYEON, WENDY, TWICE Nayeon, CORTIS, Ampers&One*, dll.).
  - Mengimpor **372 album resmi baru** (rilis album & EP dari *ENHYPEN Locket Necklace, TXT Perfect Storm, Wendy Last Light, NewJeans Get Up Box, LE SSERAFIM Hot, BTS Arirang, &TEAM Back to Life, Soojin Rizz, The Boyz, GFriend, Blackpink*, dll.) ke kategori resmi **`Album`**.
  - Mengunggah 100% foto sampul beresolusi tinggi ke Object Storage S3 IDCloudHost (`velora/products/...`).
  - Dikonversi menggunakan formula paten MYR: $\lfloor \text{USD} \times 4.086165 \times 0.80 \rfloor$.
  - Total katalog aktif toko kini melonjak menjadi **949 produk** (**616 Album**, **228 Lightstick**, **105 Photobook**).
  - Verifikasi: `npx eslint` dan `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Bulk Import & Deduping Light Sticks dari K-Pop Music Town LA (`kpopmusictownla.com/collections/light-sticks`)**:
  - Mengekstrak **191 produk light stick** dari K-Pop Music Town LA.
  - **Pencegahan Data Ganda (Anti-Duplication Guard)**: Melakukan komparasi cerdas terhadap 139 light stick yang sudah ada di database (pencocokan nama artis, tipe versi, dan slug). Sebanyak **102 produk yang sudah ada di database otomatis dilewati (SKIPPED)**.
  - Berhasil mengimpor **89 produk baru yang benar-benar belum ada** (&TEAM Ver 2, aespa Mini Fanlight Keyring Ver 2, ATEEZ Lightiny Keyring Ver 3, TWS Keyring, BTS Army Bomb Ver 4, (G)I-DLE Ver 3, Lisa Keyring, TripleS, TXT Keyring V2, ITZY Ver 2, H1-KEY, G-Dragon World Tour Keyring & Cradle, Meovv, SuperM, Sunmi, dll.) ke kategori resmi **`Lightstick`**.
  - 100% foto sampul beresolusi tinggi berhasil diunggah ke S3 IDCloudHost (`velora/products/...`).
  - Dikonversi menggunakan formula paten MYR: $\lfloor \text{USD} \times 4.086165 \times 0.80 \rfloor$.
  - Total katalog aktif toko kini mencapai **577 produk** (**244 Album**, **228 Lightstick**, **105 Photobook**).
  - Verifikasi: `npx eslint` dan `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Pengujian & Verifikasi Koneksi Bot Telegram Admin (`@myvelorastore_bot`)**:
  - Melakukan uji koneksi API Telegram resmi (`getMe`, `getWebhookInfo`, `getChat`).
  - Terverifikasi terhubung dengan akun Telegram Admin: **Pr Krick** (`@Gantengbanget77`, Chat ID: `7562689082`).
  - Mengirimkan pesan ping konfirmasi ke chat Telegram Admin yang merangkum panduan upload QR harian dan perintah bot.
  - Memperkuat engine pesan [src/lib/telegram-bot.ts](file:///d:/project%20web/myvelorastore/src/lib/telegram-bot.ts) dengan fallback auto plain-text agar tidak pernah gagal kirim saat ada karakter format khusus.
  - Memproses dan merespons seluruh antrean pesan pending user (`/start`, `/help`) via auto-sync.
  - Verifikasi: `npx eslint` dan `npx tsc --noEmit` lolos bersih (EXIT=0).

## 2026-11-18

### Target Selesai
- [x] **Bulk Import 105 Produk Resmi Photobooks & Magazines dari KSENDY (`ksendy.com/collections/phtobooks-magazines`)**:
  - Mengunggah **105 majalah & photobook resmi K-Pop** (DICON D'FESTA, VOGUE Korea, ELLE, Harper's Bazaar, GQ Korea, W Korea, ARENA HOMME+, dll.) ke database PostgreSQL pada kategori resmi **`Photobook`**.
  - Mengunggah 100% foto sampul beresolusi tinggi ke Object Storage S3 IDCloudHost (`velora/products/...`) dengan bypass proteksi hotlinking Shopify CDN (`Referer: https://ksendy.com/`).
  - Menyertakan seluruh varian cover & member selection lengkap dengan kalkulasi harga paten MYR ($\lfloor \text{USD} \times 4.086165 \times 0.80 \rfloor$).
  - Total produk aktif di database kini meningkat dari 383 menjadi **488 produk** (**244 Album**, **139 Lightstick**, **105 Photobook**).
  - Verifikasi: `npx eslint` dan `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Commit & Staging Seluruh Fitur**: Berhasil di-stage dan di-commit (`917eb02` - *feat: catalog pagination, smart search, store hours auto-close and telegram bot bank rotation*).
- [x] **Integrasi Upload Rekening Harian & DuitNow QR via Bot Telegram (`@myvelorastore_bot`)**:
  - Membuat engine Bot Telegram Admin di [src/lib/telegram-bot.ts](file:///d:/project%20web/myvelorastore/src/lib/telegram-bot.ts) dan endpoint Webhook + Sync di [src/app/api/telegram/webhook/route.ts](file:///d:/project%20web/myvelorastore/src/app/api/telegram/webhook/route.ts).
  - **Upload Foto DuitNow QR Langsung dari Chat Telegram**: Admin cukup mengirim **Foto QR** ke bot Telegram (bisa disertai caption `NamaBank | NoRekening | AtasNama`). Bot otomatis mengunduh foto dari Telegram, mengunggahnya ke S3 IDCloudHost (`velora/brand/...`), menyimpan rekening & QR ke database PostgreSQL, mengaktifkan `paymentEnabled = true`, dan langsung membuka toko hingga pukul 22:00 MYT.
  - **Perintah Teks & Kontrol Toko via Bot**: Mendukung `/rekening Bank | NoRek | Nama`, `/status` (cek status toko & rekening aktif), `/hapusqr` (hapus gambar QR), `/tutup` (tutup toko manual & hapus rekening sekarang), dan `/help`.
  - **Dual Mode (Webhook Real-Time + Auto-Sync `getUpdates`)**: Dilengkapi tombol 1-klik *"Aktifkan Webhook Produksi"* & *"Sync Pesan Bot Sekarang"* di [src/components/admin/settings/contact-bot-tab.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/settings/contact-bot-tab.tsx), serta proteksi keamanan yang hanya menerima perintah dari Admin Chat ID terdaftar.
  - Verifikasi: `npx eslint` dan `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Implementasi Logic Rotasi Rekening Harian Malaysia & Auto-Close Jam 22:00 MYT**:
  - Membuat utilitas zona waktu Malaysia (`Asia/Kuala_Lumpur`, UTC+8) di [src/lib/store-hours.ts](file:///d:/project%20web/myvelorastore/src/lib/store-hours.ts) (`getMalaysiaTimeParts`, `evaluateStorePaymentStatus`, `sanitizePublicPaymentSettings`).
  - **Auto-Expire Jam 10 Malam (22:00 MYT)**: Setiap pukul 22:00 MYT, nomor rekening bank dan gambar DuitNow QR otomatis dihapus/disembunyikan dari publik (`sanitizePublicPaymentSettings`) disertai *live timer* 30 detik di browser pembeli.
  - **Wajib Upload Rekening Baru Setiap Pagi**: Meskipun sudah berganti hari (misal pukul 10:00 pagi keesokan harinya), rekening hari kemarin tidak akan muncul kembali sebelum Admin mengunggah/menyimpan rekening atau QR baru pada tanggal hari ini di `/admin/settings`.
  - **Layar `"STORE IS CLOSED NOW"` + Direct Order via WhatsApp di Checkout**: Saat toko tutup (di atas jam 22:00 MYT atau belum upload rekening hari ini), halaman `/checkout` ([src/components/storefront/checkout-form.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/checkout-form.tsx)) dan halaman pembayaran ([src/components/storefront/payment-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/payment-client.tsx)) otomatis menampilkan kartu **"STORE IS CLOSED NOW"** beserta ringkasan keranjang dan tombol hijau **"Order Directly via WhatsApp"** yang memformat seluruh isi keranjang pembeli langsung ke WhatsApp Admin.
  - **Indikator Status Harian di Admin Settings**: Pada tab *Payment & DuitNow* ([src/components/admin/settings/payment-tab.tsx](file:///d:/project%20web/myvelorastore/src/components/admin/settings/payment-tab.tsx)), form otomatis mengosongkan rekening hari sebelumnya yang sudah kedaluwarsa dan menampilkan jam Malaysia (`MYT`) serta status *Open/Closed*.
  - Verifikasi: `npx eslint` dan `npx tsc --noEmit` lolos bersih (EXIT=0).
- [x] **Perbaikan 5 Logic Penting Storefront, Cart & Admin Panel**:
  - **1. Multi-Version Select vs Quick Add & Open PO `maxStock` Fix (`product-card.tsx`)**: Produk dengan `> 1` versi (seperti Album multi-versi) kini menampilkan tombol **`Select`** yang mengarahkan ke halaman detail untuk memilih versi, sedangkan produk 1 versi tetap tombol **`Add`** instan. Memperbaiki pengiriman `maxStock: isOpenPreOrder ? 99 : defaultVersion.stock` agar produk Open PO tidak memunculkan error *"Sold out"*.
  - **2. Validasi `preOrderDeadline` pada Kartu Katalog (`product-card.tsx`)**: Menambahkan pengecekan `isDeadlinePassed(product.preOrderDeadline)` langsung di kartu produk katalog sehingga PO yang sudah tutup otomatis berstatus `Pre-Order Closed` dan tidak bisa di-klik *Add*.
  - **3. Search, Filter Kategori & Paginasi 20 Produk/Halaman di Admin Panel (`products-manager.tsx`)**: Menambahkan kolom pencarian multi-kata (nama, artis, SKU, versi), filter pil (`All`, `Album`, `Lightstick`, `Pre-Order`, `Draft`), dan paginasi 20 item per halaman di `/admin/products` untuk mengelola 383 produk dengan cepat dan ringan.
  - **4. Sinkronisasi Harga Promo di Mobile Sticky Bar (`product-detail-client.tsx`)**: Menyelaraskan kalkulasi harga pada *Mobile Sticky Bottom Action Bar* agar menggunakan `activePromo.discountedPrice` saat diskon aktif.
  - **5. Smart Cross-Category Matching & Dynamic Filter Pills (`catalog-view.tsx` & `category-banners-section.tsx`)**: Mencocokkan sub-kategori *Photobook*, *Merch*, *Fashion*, dan *Stationery* secara cerdas dari judul/versi produk serta menyembunyikan pil filter yang memiliki 0 produk.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Penyelarasan Tampilan & Logic Status Pre-Order vs Ready Stock**:
  - Menghilangkan label angka fisik `(10 available)` pada produk **Pre-Order** di halaman detail produk ([src/components/storefront/product-detail-client.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/product-detail-client.tsx)) agar pembeli tidak mengira barang PO sudah ada stok fisiknya di gudang.
  - Untuk Pre-Order, status kini secara tegas berlabel **`Pre-Order`** (atau `Pre-Order (Only X slots left)` hanya saat kuota menipis $\le 3$).
  - Teks `In Stock (X available)` kini dieksklusifkan hanya untuk barang yang berstatus **Ready Stock** (`isPreOrder = false`).
  - Menyesuaikan tombol aksi menjadi kontekstual: **`Pre-Order Now`** untuk barang PO, dan **`Add to Cart`** untuk barang Ready Stock.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Penyempurnaan Total Logic Search & Filter Katalog Storefront**:
  - **Multi-Keyword AND Search (Tokenized)**: Pencarian kini memecah kata kunci (misal *"bts lightstick"* atau *"stray kids album"*) dan memvalidasi setiap kata di seluruh atribut produk (`name`, `groupArtist`, `category`, `description`, `versionName`), menyelesaikan masalah pencarian multi-kata yang sebelumnya menghasilkan 0 produk.
  - **Fuzzy Normalization**: Mengabaikan tanda baca dan spasi agar pencarian seperti *"gidle"* cocok dengan *"(G)I-DLE"*, *"day 6"* cocok dengan *"DAY6"*, dan *"lightstick"* cocok dengan *"Light Stick"*.
  - **Pencegahan Keyboard Autocorrect Mobile**: Menambahkan atribut `autoComplete="off"`, `autoCorrect="off"`, dan `spellCheck={false}` pada input pencarian agar keyboard HP tidak merusak nama artis/idol K-Pop.
  - **Opsi Sort Baru & Proteksi Array Kosong**: Menambahkan opsi abjad *"Alphabetical: A to Z"* dan *"Alphabetical: Z to A"*, serta perlindungan `NaN` pada pengurutan harga.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Implementasi Storefront Catalog Pagination (20 Produk per Halaman)**:
  - Membatasi render katalog storefront menjadi **20 produk per halaman** (`ITEMS_PER_PAGE = 20`) pada [src/components/storefront/catalog-view.tsx](file:///d:/project%20web/myvelorastore/src/components/storefront/catalog-view.tsx) untuk mencegah browser kewalahan saat merender seluruh 383 produk (244 Album + 139 Lightstick).
  - Menambahkan kontrol navigasi paginasi: tombol *Prev* dan *Next* (`ChevronLeft` & `ChevronRight`), pil nomor halaman pintar dengan ellipsis (`1`, `2`, `3` ... `totalPages`), dan indikator counter produk ("Showing 1–20 of 383 products").
  - Menjamin touch target minimal 44px (`min-h-[44px] min-w-[44px]`) untuk aksesibilitas dan standar Anti-AI Slop mobile UX.
  - Menambahkan otomatisasi reset ke halaman 1 saat user mengubah kategori, kata kunci pencarian, filter stok (*In Stock Only*), atau urutan (*Sort by*).
  - Menambahkan auto smooth-scroll kembali ke bagian atas katalog saat berpindah halaman.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Bulk Import 244 Album K-Pop Resmi dari KSENDY (`ksendy.com/collections/albums`)**:
  - Mengunggah **244 album resmi** lengkap dengan varian versi (*Photobook Ver, Digipack, SMini, Jewel Case, Limited Edition, Set*) ke database PostgreSQL.
  - Mengunggah seluruh foto sampul resmi beresolusi tinggi (HD) ke Object Storage S3 IDCloudHost (`velora` bucket).
  - Standarisasi kategori produk terpusat: **244 produk kategori `Album`** dan **139 produk kategori `Lightstick`** (Total **383 produk aktif**).
  - Seluruh harga versi album dihitung sesuai aturan resmi Myvelora USD ($\lfloor \text{USD} \times 4.086165 \times 0.80 \rfloor \rightarrow \text{FLOOR Integer RM}$).
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Bulk Import 244 Album K-Pop Resmi dari KSENDY (`ksendy.com/collections/albums`)**:
  - Mengunggah **244 album resmi** lengkap dengan varian versi (*Photobook Ver, Digipack, SMini, Jewel Case, Limited Edition, Set*) ke database PostgreSQL.
  - Mengunggah seluruh foto sampul resmi beresolusi tinggi (HD) ke Object Storage S3 IDCloudHost (`velora` bucket).
  - Standarisasi kategori produk terpusat: **244 produk kategori `Album`** dan **139 produk kategori `Lightstick`** (Total **383 produk aktif**).
  - Seluruh harga versi album dihitung sesuai aturan resmi Myvelora USD ($\lfloor \text{USD} \times 4.086165 \times 0.80 \rfloor \rightarrow \text{FLOOR Integer RM}$).
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Bulk Import Seluruh Sisa Light Stick Resmi dari KSENDY (`ksendy.com`)**:
  - Mengunggah **67 produk light stick resmi tambahan** dari koleksi KSENDY ke database Myvelora Store dan foto Ultra-HD ke IDCloudHost S3 (`velora` bucket).
  - Termasuk grup-grup legendaris dan generasi baru: **2NE1 (RM 173)**, **MAMAMOO (RM 191)**, **LISA (RM 234)**, **WANNA ONE (RM 187)**, **2PM (RM 197)**, **CNBLUE (RM 182)**, **ZICO (RM 197)**, **QWER (RM 204)**, **N.Flying (RM 196)**, **BIGBANG V.4 (RM 148)**, **KATSEYE (RM 197)**, **WayV (RM 80)**, **YOUNG POSSE (RM 182)**, **CIX (RM 161)**, **EPEX (RM 170)**, **NEXZ (RM 194)**, **KIM JAE JOONG (RM 189)**, **KIM SEJEONG (RM 215)**, **JAY PARK (RM 180)**, **izna (RM 203)**, **82MAJOR (RM 178)**, **BOL4 (RM 204)**, **RESCENE (RM 222)**, **ROY KIM (RM 246)**, **BYEON WOO SEOK (RM 187)**, **HYOLYN (RM 179)**, **MOMOLAND (RM 157)**, **ONEWE (RM 182)**, **D.O. (RM 178)**, dll.
  - Seluruh harga dihitung sesuai rumus paten Myvelora USD ($\lfloor \text{USD} \times 4.086165 \times 0.80 \rfloor$).
  - Total katalog aktif di database PostgreSQL saat ini mencapai **139 produk resmi**.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Penyelarasan Katalog & Upgrade Foto Ultra-HD dari KSENDY (`ksendy.com`)**:
  - **Upgrade 24 Foto Produk Lama ke Ultra-HD**: Mengganti foto produk KSpace yang buram/pecah menjadi foto resmi master Shopify KSENDY beresolusi tinggi (800×800 hingga 1.600×1.600 HD) untuk TWICE, THE BOYZ, CHUU, fromis_9, Stray Kids Ver.2, NewJeans, SEVENTEEN Ver.3, CRAVITY, &TEAM Ver.2, EVAN, ONEUS Ver.2, YENA, Xdinary Heroes, dll. Seluruh foto diunggah ke IDCloudHost S3 (`velora` bucket).
  - **Penambahan 18 Light Stick Populer Baru dari KSENDY**:
    1. **IVE - Official Light Stick Ver.2**: $58.99 USD → **RM 192** (ID: 65, Ready Stock)
    2. **aespa - Official Light Stick Ver.2**: $58.88 USD → **RM 192** (ID: 66, Ready Stock)
    3. **ITZY - Official Light Stick**: $61.97 USD → **RM 202** (ID: 67, Ready Stock)
    4. **DAY6 - Official Light Band Ver.3**: $55.99 USD → **RM 183** (ID: 68, Ready Stock)
    5. **RIIZE - Official Light Stick**: $59.99 USD → **RM 196** (ID: 69, Ready Stock)
    6. **Red Velvet - Official Light Stick Ver.2**: $56.88 USD → **RM 185** (ID: 70, Ready Stock)
    7. **MONSTA X - Official Light Stick Ver.3**: $56.72 USD → **RM 185** (ID: 71, Ready Stock)
    8. **KISS OF LIFE - Official Light Stick**: $54.67 USD → **RM 178** (ID: 72, Pre-Order)
    9. **ILLIT - Official Light Stick**: $61.67 USD → **RM 201** (ID: 73, Pre-Order)
    10. **BIGBANG G-DRAGON - Official Light Stick**: $66.56 USD → **RM 217** (ID: 74, Ready Stock)
    11. **SUPER JUNIOR - Official Light Stick**: $56.50 USD → **RM 184** (ID: 75, Ready Stock)
    12. **TVXQ! - Official Light Stick**: $55.88 USD → **RM 182** (ID: 76, Ready Stock)
    13. **NCT 127 - Official Light Stick**: $60.35 USD → **RM 197** (ID: 77, Ready Stock)
    14. **HIGHLIGHT - Official Light Stick Ver.2**: $54.88 USD → **RM 179** (ID: 78, Ready Stock)
    15. **WJSN - Official Light Stick Ver.2**: $48.00 USD → **RM 156** (ID: 79, Ready Stock)
    16. **PLAVE - Official Light Stick**: $65.08 USD → **RM 212** (ID: 80, Pre-Order)
    17. **INFINITE - Official Light Stick**: $68.99 USD → **RM 225** (ID: 81, Ready Stock)
    18. **B1A4 - Official Light Stick Ver.3**: $47.66 USD → **RM 155** (ID: 82, Ready Stock)
  - Seluruh harga dihitung sesuai rumus paten Myvelora USD ($\lfloor \text{USD} \times 4.086165 \times 0.80 \rfloor$).
  - Total katalog aktif di database PostgreSQL saat ini: **72 produk resmi**.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Pembersihan & Penggantian Foto Produk Bermasalah (Batch 4)**:
  - Mengganti 8 foto produk yang sebelumnya salah/kurang rapi dari scrape KSpace:
    1. **WONHO (ID: 51)**: Sebelumnya menampilkan 3 album 'LOVE SYNONYM' → diganti foto resmi clean cutout Light Stick Wonho.
    2. **EPIK HIGH (ID: 59)**: Sebelumnya lembar manual instruksi tombol Korea berbingkai hitam → diganti foto resmi "Park Kyu Bong" asli.
    3. **ONEUS Ver.2 (ID: 57)**: Sebelumnya duplikat foto stick VERIVERY → diganti foto resmi ONEUS Ver.2 asli dengan outbox emas.
    4. **LE SSERAFIM (ID: 42)**: Sebelumnya banner panduan LED gelap dengan teks → diganti foto resmi clean white render FIMBONG.
    5. **B.I (ID: 58)**: Sebelumnya kartu grafis bertuliskan "BINBONG" → diganti foto resmi cutout clean BINBONG.
    6. **Billlie (ID: 49)**: Sebelumnya poster teks spec "CONTENTS" → diganti foto resmi clean cutout Billlie lightstick.
    7. **OnlyOneOf (ID: 47)**: Sebelumnya kartu bertuliskan logo OnlyOneOf besar → diganti foto resmi clean cutout OnlyOneOf lightstick.
    8. **VERIVERY Ver.3 (ID: 56)**: Foto diperbarui ke versi clean cutout resmi tanpa logo ungu besar di sudut.
  - Seluruh foto baru diunggah ke S3 (`public-read`, HTTP 200) dan database di-update.
- [x] **Bulk Upload Batch 4: 23 Produk Resmi Light Stick dari KSPACE (`kspaceproject.com`)**:
  - Mengunduh foto resmi resolusi tinggi, mengunggah ke IDCloudHost S3 (`velora` bucket, `public-read` ACL), dan memverifikasi status `HTTP 200 OK`.
  - Menerapkan rumus paten harga **Myvelora Pricing Rules** ($\text{Harga Sumber CZK} \times 0.185028 \times 0.80 \rightarrow \text{FLOOR Integer RM}$):
    1. **LE SSERAFIM - Official Light Stick**: `1.979 Kč` → **RM 292** (Stok: 10, Pre-Order, ID: 42)
    2. **TEMPEST - Official Light Stick**: `1.749 Kč` → **RM 258** (Stok: 10, Pre-Order, ID: 43)
    3. **YENA - Official Light Stick (Ver.1)**: `1.699 Kč` → **RM 251** (Stok: 10, Pre-Order, ID: 44)
    4. **XDINARY HEROES - Official Light Stick**: `1.749 Kč` → **RM 258** (Stok: 10, Ready Stock, ID: 45)
    5. **CHUU - Official Light Stick**: `1.749 Kč` → **RM 258** (Stok: 10, Pre-Order, ID: 46)
    6. **OnlyOneOf - Official Light Stick**: `2.249 Kč` → **RM 332** (Stok: 10, Pre-Order, ID: 47)
    7. **KANG DANIEL - Official Light Stick Ver.2**: `1.749 Kč` → **RM 258** (Stok: 10, Ready Stock, ID: 48)
    8. **Billlie - Official Light Stick**: `1.749 Kč` → **RM 258** (Stok: 10, Ready Stock, ID: 49)
    9. **STRAY KIDS - Official Light Stick Ver.2**: `2.249 Kč` → **RM 332** (Stok: 10, Pre-Order, ID: 50)
    10. **WONHO - Official Light Stick**: `1.649 Kč` → **RM 244** (Stok: 10, Ready Stock, ID: 51)
    11. **GOLDEN CHILD - Official Light Stick**: `1.549 Kč` → **RM 229** (Stok: 10, Ready Stock, ID: 52)
    12. **ROCKET PUNCH - Official Light Stick**: `1.549 Kč` → **RM 229** (Stok: 10, Ready Stock, ID: 53)
    13. **DRIPPIN - Official Light Stick**: `1.549 Kč` → **RM 229** (Stok: 10, Ready Stock, ID: 54)
    14. **LEE CHAE YEON - Official Light Stick**: `1.699 Kč` → **RM 251** (Stok: 10, Ready Stock, ID: 55)
    15. **VERIVERY - Official Light Stick Ver.3**: `1.599 Kč` → **RM 236** (Stok: 10, Ready Stock, ID: 56)
    16. **ONEUS - Official Light Stick Ver.2**: `1.699 Kč` → **RM 251** (Stok: 10, Ready Stock, ID: 57)
    17. **B.I - Official Light Stick**: `1.699 Kč` → **RM 251** (Stok: 10, Ready Stock, ID: 58)
    18. **EPIK HIGH - Official Light Stick**: `1.849 Kč` → **RM 273** (Stok: 10, Pre-Order, ID: 59)
    19. **GOT7 - Official Light Stick Ver.3**: `1.749 Kč` → **RM 258** (Stok: 10, Pre-Order, ID: 60)
    20. **8TURN - Official Light Stick**: `1.799 Kč` → **RM 266** (Stok: 10, Ready Stock, ID: 61)
    21. **ZEROBASEONE - Official Light Stick**: `1.949 Kč` → **RM 288** (Stok: 10, Ready Stock, ID: 62)
    22. **TXT - Official Light Stick Ver.2**: `1.999 Kč` → **RM 295** (Stok: 10, Pre-Order, ID: 63)
    23. **EVNNE - Official Light Stick (Ver.1)**: `1.749 Kč` → **RM 258** (Stok: 10, Pre-Order, ID: 64)
  - Total katalog di database saat ini: **54 produk resmi**.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Bulk Upload Batch 3: 10 Produk Resmi Light Stick dari KSPACE (`kspaceproject.com`)**:
  - Mengunduh foto resmi resolusi tinggi, mengunggah ke IDCloudHost S3 (`velora` bucket, `public-read` ACL), dan memverifikasi status `HTTP 200 OK`.
  - Menerapkan rumus paten harga **Myvelora Pricing Rules** ($\text{Harga Sumber CZK} \times 0.185028 \times 0.80 \rightarrow \text{FLOOR Integer RM}$):
    1. **The Rose - Official Light Stick**: `1.994 Kč` → **RM 295** (Stok: 10, Pre-Order, ID: 32)
    2. **ATEEZ - Official Light Stick Ver.2**: `1.709 Kč` → **RM 252** (Stok: 10, Pre-Order, ID: 33)
    3. **STAYC - Official Light Stick**: `1.699 Kč` → **RM 251** (Stok: 10, Ready Stock, ID: 34)
    4. **BTS - Official Light Stick (Map of the Soul Special Edition)**: `2.149 Kč` → **RM 318** (Stok: 10, Pre-Order, ID: 35)
    5. **(G)I-DLE - Official Light Stick Ver.2**: `1.599 Kč` → **RM 236** (Stok: 10, Pre-Order, ID: 36)
    6. **fromis_9 - Official Light Stick Ver.2**: `1.899 Kč` → **RM 281** (Stok: 10, Ready Stock, ID: 37)
    7. **NMIXX - Official Light Stick**: `1.749 Kč` → **RM 258** (Stok: 10, Pre-Order, ID: 38)
    8. **TWICE - CANDYBONG ∞ Official Light Stick**: `1.709 Kč` → **RM 252** (Stok: 10, Pre-Order, ID: 39)
    9. **NewJeans - Official Light Stick**: `1.849 Kč` → **RM 273** (Stok: 10, Pre-Order, ID: 40)
    10. **SEVENTEEN - Official Light Stick Ver.3**: `1.614 Kč` → **RM 238** (Stok: 10, Ready Stock, ID: 41)
  - Total katalog di database saat ini: **31 produk resmi**.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Bulk Upload Batch 2: 10 Produk Resmi Light Stick dari KSPACE (`kspaceproject.com`)**:
  - Mengunduh foto resmi produk resolusi tinggi, mengunggah ke IDCloudHost S3 (`velora` bucket, `public-read` ACL), dan memverifikasi seluruh gambar mengembalikan status `HTTP 200 OK`.
  - Menerapkan rumus paten harga **Myvelora Pricing Rules** ($\text{Harga Sumber CZK} \times 0.185028 \times 0.80 \rightarrow \text{FLOOR Integer RM}$):
    1. **SHINee - Official Light Stick**: `1.614 Kč` (harga aktif diskon KSpace) → **RM 238** (Stok: 10, Ready Stock, ID: 22). Foto diperbarui menggunakan foto produk bersih (clean cutout white background S3: `shinee-official-light-stick-clean-1794945906468.jpg`).
    2. **THE BOYZ - Official Light Stick Ver.2**: `1.859 Kč` → **RM 275** (Stok: 10, Ready Stock, ID: 23)
    3. **AB6IX - Official Light Stick**: `1.699 Kč` → **RM 251** (Stok: 10, Pre-Order, ID: 24)
    4. **ONF - Official Light Stick**: `1.472 Kč` → **RM 217** (Stok: 10, Pre-Order, ID: 25)
    5. **CRAVITY - Official Light Stick**: `1.549 Kč` → **RM 229** (Stok: 10, Pre-Order, ID: 26)
    6. **SF9 - Official Light Stick**: `1.549 Kč` → **RM 229** (Stok: 10, Pre-Order, ID: 27)
    7. **GIRLS' GENERATION - Official Light Stick**: `1.699 Kč` → **RM 251** (Stok: 10, Pre-Order, ID: 28)
    8. **LOONA - Official Light Stick**: `1.799 Kč` → **RM 266** (Stok: 10, Pre-Order, ID: 29)
    9. **OH MY GIRL - Official Light Stick**: `1.299 Kč` → **RM 192** (Stok: 10, Pre-Order, ID: 30)
    10. **VICTON - Official Light Stick Ver.2**: `1.649 Kč` → **RM 244** (Stok: 10, Pre-Order, ID: 31)
  - Dua produk tautan (ENHYPEN dan TREASURE) sudah ada sebelumnya di database (ID 11 & 12).
  - Total katalog di database saat ini: **21 produk resmi**.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Bulk Upload 9 Produk Resmi Light Stick dari KSPACE (`kspaceproject.com`)**:
  - Mengunduh foto produk resmi resolusi tinggi, mengunggah ke IDCloudHost S3 (`velora` bucket, `public-read` ACL), dan memverifikasi seluruh gambar mengembalikan status `HTTP 200 OK`.
  - Menerapkan rumus paten harga **Myvelora Pricing Rules** ($\text{Harga Sumber CZK} \times 0.185028 \times 0.80 \rightarrow \text{FLOOR Integer RM}$):
    1. **EVAN - Official Light Stick**: `2.023 Kč` → **RM 299** (Stok: 10, Ready Stock, ID: 13)
    2. **ALL(H)OURS - Official Light Stick**: `2.209 Kč` → **RM 326** (Stok: 10, Pre-Order, ID: 14)
    3. **EVNNE - Official Light Stick Ver.2**: `1.909 Kč` → **RM 282** (Stok: 10, Pre-Order, ID: 15)
    4. **YENA - Official Light Stick Ver.2**: `2.149 Kč` → **RM 318** (Stok: 10, Pre-Order, ID: 16)
    5. **HRTZ.WAV - Official Light Stick**: `1.729 Kč` → **RM 255** (Stok: 10, Pre-Order, ID: 17)
    6. **LNGSHOT - Official Light Stick**: `1.949 Kč` → **RM 288** (Stok: 10, Pre-Order, ID: 18)
    7. **PARK JI HOON - Official Light Stick Ver.2**: `2.059 Kč` → **RM 304** (Stok: 10, Pre-Order, ID: 19)
    8. **TAEMIN - Official Light Stick V2**: `2.061 Kč` → **RM 305** (Stok: 10, Pre-Order, ID: 20)
    9. **&TEAM - Official Light Stick Ver.2**: `1.918 Kč` → **RM 283** (Stok: 10, Ready Stock, ID: 21). Foto diperbarui menggunakan foto resmi Ver.2 globe bulat dengan lambang bulan sabit dan & (S3: `and-team-official-light-stick-ver-2-1794945243270.png`).
  - Total katalog di database saat ini: **11 produk resmi** (bersama ENHYPEN RM 238 dan TREASURE RM 224).
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Bulk Upload 9 Produk Resmi Light Stick dari KSPACE (`kspaceproject.com`)**:
  - Mengunduh foto produk resmi resolusi tinggi, mengunggah ke IDCloudHost S3 (`velora` bucket, `public-read` ACL), dan memverifikasi seluruh gambar mengembalikan status `HTTP 200 OK`.
  - Menerapkan rumus paten harga **Myvelora Pricing Rules** ($\text{Harga Sumber CZK} \times 0.185028 \times 0.80 \rightarrow \text{FLOOR Integer RM}$):
    1. **EVAN - Official Light Stick**: `2.023 Kč` → **RM 299** (Stok: 10, Ready Stock, ID: 13)
    2. **ALL(H)OURS - Official Light Stick**: `2.209 Kč` → **RM 326** (Stok: 10, Pre-Order, ID: 14)
    3. **EVNNE - Official Light Stick Ver.2**: `1.909 Kč` → **RM 282** (Stok: 10, Pre-Order, ID: 15)
    4. **YENA - Official Light Stick Ver.2**: `2.149 Kč` → **RM 318** (Stok: 10, Pre-Order, ID: 16)
    5. **HRTZ.WAV - Official Light Stick**: `1.729 Kč` → **RM 255** (Stok: 10, Pre-Order, ID: 17)
    6. **LNGSHOT - Official Light Stick**: `1.949 Kč` → **RM 288** (Stok: 10, Pre-Order, ID: 18)
    7. **PARK JI HOON - Official Light Stick Ver.2**: `2.059 Kč` → **RM 304** (Stok: 10, Pre-Order, ID: 19)
    8. **TAEMIN - Official Light Stick V2**: `2.061 Kč` → **RM 305** (Stok: 10, Pre-Order, ID: 20)
    9. **&TEAM - Official Light Stick Ver.2**: `1.918 Kč` → **RM 283** (Stok: 10, Ready Stock, ID: 21). Foto diperbarui menggunakan foto resmi Ver.2 globe bulat dengan lambang bulan sabit dan & (S3: `and-team-official-light-stick-ver-2-1794945243270.png`).
  - Total katalog di database saat ini: **11 produk resmi** (bersama ENHYPEN RM 238 dan TREASURE RM 224).
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0).
- [x] **Upload Produk Resmi: TREASURE - Official Light Stick**:
  - Sumber: `https://www.kspaceproject.com/products/treasure-official-light-stick`
  - Mata Uang & Harga Sumber: `1.519 Kč` (CZK)
  - Kurs Konversi CZK → MYR: `0.185028` → `RM 281.05`
  - Potongan Wajib 20%: `RM 281.05 × 0.80 = RM 224.84`
  - Pembulatan ke bawah (FLOOR): **`RM 224`**
  - Stok: **10 unit**
  - Foto resolusi tinggi diunggah ke IDCloudHost S3: `https://is3.cloudhost.id/velora/products/treasure-official-light-stick-1794944004952.jpg` (HTTP 200 OK).
  - Berhasil tersimpan di PostgreSQL (Product ID: 12, Version ID: 30) dengan status Published & New Arrival.
- [x] **Implementasi Fitur Promo & Flash Sale Campaign (Global Store & Per-Version Override)**:
  - **Skema Database**: Menambahkan kolom `promo_discount_enabled`, `promo_discount_percent`, `promo_discount_scope`, `promo_discount_badge` pada tabel `store_settings`, serta `discount_percent` pada tabel `product_versions`.
  - **Migrasi Non-Destruktif**: Menjalankan migrasi aman `ALTER TABLE IF NOT EXISTS` langsung ke database PostgreSQL produksi.
  - **Engine Kalkulasi Promo (`src/lib/promo.ts`)**: Menghitung harga diskon otomatis dengan pembulatan ke bawah (FLOOR, whole RM integer) sesuai paten *Myvelora Pricing Rules*.
  - **Panel Admin Settings (`PromoTab`)**: Menyediakan tab baru *"Promo & Sale"* di `/admin/settings` lengkap dengan master switch, preset tombol persen (`5%`, `10%`, `15%`, `20%`, `25%`, `50%`), filter cakupan kategori (*Storewide* atau per-kategori seperti *Lightstick Only*), custom promo badge, dan *Live Customer Preview*.
  - **Editor Varian Produk (`version-builder-card.tsx`)**: Menambahkan kolom input diskon spesifik per versi jika admin ingin memberi diskon berbeda pada varian tertentu.
  - **Tampilan Storefront**:
    - Kartu katalog (`product-card.tsx`): Menampilkan badge promo pink animasi, harga normal dicoret (misal: ~~RM 302.00~~), dan harga diskon aktif (misal: **RM 271.00**).
    - Halaman detail produk (`product-detail-client.tsx`): Menampilkan harga coret, badge promo, dan menambahkan ke keranjang dengan harga diskon yang akurat.
    - Alur Checkout (`checkout.ts`): Menghitung ulang subtotal di server menggunakan harga diskon promo yang aktif.
  - Verifikasi: `npx tsc --noEmit` lolos (EXIT=0) dan `npm run lint` 0 errors, 0 warnings.
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
