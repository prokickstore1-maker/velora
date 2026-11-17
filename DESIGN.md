# Design System — Myvelora Store (`mv`)

**Version:** 1.0  
**Source of Truth:** [Myvelora_Brand_Identity_PRD.pdf](file:///d:/project%20web/myvelorastore/Myvelora_Brand_Identity_PRD.pdf)  
**Theme Blueprint:** [_build_plan/blueprints/theme-config.css](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/theme-config.css)

---

## 1. Aesthetic Direction & Core Principles

- **Style:** Photo-First Editorial Minimalist (*Modern, Minimal, Premium, Friendly, Professional*).
- **Default Mode:** **Light Mode First** (Ivory `#FBF7F4` canvas, White `#FFFFFF` photo frames, Deep Plum `#47023B` brand anchors).
- **Public Language:** **100% English** — concise, natural, direct copy across storefront, buttons, badges, and empty states.
- **4 Pillar Aturan Layout (PDF Hal. 4):**
  1. **01 Photo-First:** Satu frame foto besar mendominasi setiap kartu katalog, *New Arrival*, dan *Product Details*. Hindari memecah kartu menjadi banyak kotak kecil.
  2. **02 Restrained Decoration:** Gunakan garis tipis (`1px`), *offset border*, siku sudut geometris pink (`#FA3890`), atau lengkung kurva sederhana. Jangan memenuhi layar dengan ornamen berlebihan.
  3. **03 Clear Hierarchy:** Logo ringkas, headline tegas bila diperlukan, dan satu blok informasi utama (`Product Name / Version / Price`). Footer hanya memuat tautan yang fungsional.
  4. **04 Mobile-First Practicality:** Setiap teks, badge, tombol, dan angka harga `RM` wajib terbaca jelas di layar ponsel dengan tap target minimal `44x44px`.

---

## 2. Primary Logo (`mv`) Rules

- **Bentuk Resmi:** Monogram huruf kecil `mv` berwarna **White (`#FFFFFF`)**, bentuk huruf membulat dan miring (*rounded italic*), dengan **satu *sparkle* empat sudut berwarna Accent Pink (`#FA3890`)** di ujung kanan atas huruf `v`, ditempatkan di atas latar **Deep Plum (`#47023B`)**.
- **Aturan Ketat (PDF Hal. 3):**
  - **DILARANG** menggambar ulang bentuk huruf, mengganti font monogram, meregangkan (*stretch*), memutar (*rotate*), mengubah warna monogram/sparkle, atau menambahkan drop shadow/glow/bevel.
  - Wajib menyisakan ruang bebas (*clear space*) minimal setara tinggi *sparkle* di sekeliling logo.
  - Gunakan aset logo master resmi (`SVG`/`PNG` transparan) yang diunggah melalui Admin *Store Settings* begitu tersedia.

---

## 3. Color Palette & Contrast Rules

| Token Name | HEX | Role | Allowed Surface / Usage |
| :--- | :--- | :--- | :--- |
| **Deep Plum** | `#47023B` | Primary Brand & Dark Surface | Top navigation bar, hero/callout banners, primary CTA buttons, footer container, dan **warna teks utama** di atas Ivory/White. |
| **Accent Pink** | `#FA3890` | Brand Sparkle & Highlight | *Sparkle* logo, siku sudut frame foto (*corner brackets*), nomor langkah `01`–`05` (ukuran besar), dan kata penekanan di atas latar Deep Plum `#47023B`. |
| **Soft Blush** | `#F5D5E3` | Secondary Support | Latar belakang kartu langkah *How to Order*, callout alert lembut, hover tint, dan pemisah halus. |
| **Ivory** | `#FBF7F4` | Page Background | Latar belakang kanvas halaman publik untuk menjaga kenyamanan baca dan fokus foto produk. |
| **White** | `#FFFFFF` | Photo Frame & Card Surface | Bingkai foto produk (`4:5`), kartu konten, field input, dan teks kontras tinggi di atas Deep Plum `#47023B`. |

### Aturan Kontras Teks (Wajib)
- **Teks di atas Ivory (`#FBF7F4`) atau White (`#FFFFFF`):** Prioritaskan **Deep Plum (`#47023B`)** untuk heading & isi teks, serta plum netral/muted untuk label sekunder.
- **Teks di atas Deep Plum (`#47023B`):** Gunakan **White (`#FFFFFF`)** untuk teks isi/navigasi, dan **Accent Pink (`#FA3890`)** hanya untuk headline besar/kata kunci penekanan.
- **Larangan Keras:** **DILARANG** menggunakan **Accent Pink (`#FA3890`)** sebagai teks berukuran kecil/body copy di atas latar White (`#FFFFFF`) atau Ivory (`#FBF7F4`) karena rasio kontrasnya rendah di layar ponsel.

---

## 4. Typography Scale

| Role | Font Family | Weight & Style | Example Usage |
| :--- | :--- | :--- | :--- |
| **Display / Section Headline** | `Montserrat` | `800` (*ExtraBold Italic*), `uppercase`, `tracking-tight` | `NEW ARRIVAL`, `PRODUCT DETAILS`, `HOW TO ORDER`, `CUSTOMER REVIEWS` |
| **Product Triad (Name / Version / Price)** | `Montserrat` | `600` (`SemiBold`) / `500` (`Medium`) | `ALBUM TITLE / VER. A / RM 85.00` |
| **Body, UI & Forms** | `Poppins` | `400` (`Regular`) / `500` (`Medium`) | Deskripsi produk, langkah *How to Order*, label checkout, status order |

---

## 5. Signature Components (Mapping dari PDF Hal. 4–6)

### A. Photo-First Product Card
- **Frame Foto:** Rasio tetap `4:5` (`aspect-[4/5]`), background `#FFFFFF`, sudut membulat presisi (`rounded-xl`), dengan aksen siku sudut (*corner bracket*) tipis **Accent Pink (`#FA3890`)** atau border `1px` Soft Blush (`#F5D5E3`).
- **Struktur Informasi (Maksimal 3 Baris Inti):**
  1. `Product Name` (`Montserrat SemiBold`, Deep Plum `#47023B`, 1–2 baris).
  2. `Version` (`Poppins Regular`, ringkas, misal `Ver. A · Ver. B` atau varian aktif).
  3. `Price` (`Montserrat Bold`, format `RM 00.00`, Deep Plum `#47023B`).
- **Status Badge:** Maksimal 1 badge di pojok frame (`NEW ARRIVAL` berlatar `#47023B` teks `#FFFFFF` atau `SOLD OUT` berlatar `#F5D5E3` teks `#47023B`).

### B. Product Details Layout
- **Desktop:** 2 kolom asimetris (`Photo Frame 4:5` dominan di kiri, `Details & Version Selector` di kanan).
- **Mobile:** Frame foto penuh di atas, diikuti `Product Name`, `Price (RM)`, pemilih **Version** (pill/tombol pilihan jelas dengan status stok per versi), pemilih kuantitas, dan tombol penuh `ADD TO CART`.

### C. How to Order (5-Step Module)
- Mengikuti template resmi halaman 6 PDF:
  - Nomor besar `01` s.d. `05` dengan gaya *Montserrat ExtraBold Italic* dan garis penghubung vertikal tipis.
  - Kartu langkah berlatar **Soft Blush (`#F5D5E3`)** / White border dengan ikon Deep Plum `#47023B`.
  - Copy resmi (jangan diubah tanpa izin):
    1. **01 BROWSE PRODUCTS** — *Explore our website and choose your items.*
    2. **02 ADD TO CART** — *Select your preferred options and add items to your cart.*
    3. **03 CHECKOUT** — *Enter your shipping details and review your order.*
    4. **04 COMPLETE PAYMENT** — *Follow the payment instructions to place your order.*
    5. **05 ORDER CONFIRMATION** — *Receive your order confirmation via WhatsApp.*

### D. Customer Reviews Gallery
- Menampilkan screenshot testimoni WhatsApp dalam bingkai rasio `9:16` (`aspect-[9/16]`) atau portrait card dengan header seragam **`CUSTOMER REVIEWS`** (bahasa Inggris penuh — tidak boleh memakai judul *"TESTIMONI PELANGGAN"*).

---

## 6. Mobile-First Architecture & Ergonomics (`360px–430px` & IG In-App Browser)

Mayoritas pembeli merchandise K-Pop datang dari tautan Instagram Story/Bio pada layar ponsel (`360px`–`430px`) dan *in-app browser* (Instagram, TikTok, WhatsApp). Semua komponen wajib dibangun dari viewport ponsel terlebih dahulu sebelum diperluas ke `sm:` (`640px`), `md:` (`768px`), dan `lg:` (`1024px`).

### A. Viewport, Safe Area & Anti-Misclick
- **Dynamic Viewport (`min-h-dvh`):** Gunakan `min-h-dvh` alih-alih `min-h-screen` (`100vh`) agar layout tidak terpotong oleh toolbar dinamis Safari iOS, Chrome Android, maupun *Instagram in-app browser*.
- **Safe Area Inset:** Setiap *sticky bottom bar* dan *drawer* wajib memberi padding bawah `env(safe-area-inset-bottom)` (`.pb-safe`) agar tidak tertumpuk indikator *home bar* ponsel.
- **Tap Target Minimum `44x44px`:** Seluruh tombol aksi, ikon keranjang, filter pill, pemilih *Version*, dan tombol stepper `+/-` wajib memenuhi ukuran sentuh minimal `44x44px` (`.mv-touch-target` / `min-h-11`).
- **Aturan Anti-Misclick:**
  - **DILARANG** memakai `active:scale-95` pada tombol kecil maupun CTA utama agar hit-box tidak menyusut dan menyebabkan tap gagal terbaca di layar sentuh.
  - **DILARANG** membungkus seluruh kartu produk dalam wrapper `<div onClick={...}>` yang rawan terpencet tidak sengaja saat user melakukan scroll vertikal; gunakan `<Link>` semantik pada foto/nama produk dan `<Button>` penuh yang terpisah untuk aksi cepat.

### B. Tata Letak Komponen di Layar Ponsel
- **Catalog Grid:**
  - Layar `< 390px`: 1 kolom *Photo-First* penuh agar foto merchandise `4:5` tetap lega.
  - Layar `>= 390px` s.d. `< 768px`: 2 kolom rapat (`grid-cols-2 gap-3`) dengan triad informasi (`Product Name` maksimal `line-clamp-2`, `Version` ringkas, `RM Price` minimal `14px` Bold) tanpa pemotongan angka harga.
- **Product Details Sticky Action Bar:**
  - Di layar ponsel (`< md`), bar aksi berisi **Harga `RM` versi terpilih + tombol `ADD TO CART`** menempel tetap di bagian bawah layar (`fixed bottom-0 inset-x-0 z-40 pb-safe`) tepat di zona ibu jari (*thumb-zone*), sementara konten di atasnya diberi ruang bawah yang cukup (`pb-24`) agar tidak tertutup.
- **Navigation & Cart Drawer:**
  - Menggunakan `Sheet` full-height / bottom-friendly dengan tombol tutup besar (`44x44px`) di posisi yang mudah dijangkau ibu jari.
- **Checkout & Upload Bukti Bayar (Anti-iOS Auto-Zoom):**
  - Seluruh `<Input>`, `<Select>`, dan `<Textarea>` wajib berukuran minimal **`h-12` (`48px`)** dengan font **`text-base` (`16px`)** agar Safari iOS tidak melakukan zoom paksa saat field diketik.
  - Gunakan atribut keyboard mobile yang tepat: `inputMode="tel"` + `autoComplete="tel"` untuk nomor WhatsApp (`+60`), `inputMode="numeric"` + `autoComplete="postal-code"` untuk Poskod 5 digit, dan `<input type="file" accept="image/*" />` untuk memilih foto bukti bayar dari galeri atau kamera ponsel.
- **Customer Reviews Horizontal Swipe:**
  - Pada layar ponsel, galeri *Customer Reviews* (`9:16`) menggunakan *horizontal scroll-snap carousel* (`.mv-snap-carousel`) sehingga pembeli dapat menggeser screenshot testimoni satu per satu dengan satu ibu jari.

---

## 7. Guardrails Copy & Anti-AI Slop (Inline Mode)

Standar Anti-AI Slop diterapkan **secara langsung (inline)** saat penulisan seluruh kode UI, copywriting, dan tata letak:
1. **Dilarang Placeholder & Klaim Palsu:** Tidak ada kata *"100% Authentic"*, *"Official Guarantee"*, *"Ready Stock Worldwide"*, atau tarif ongkir/metode bayar statis. Semua informasi kebijakan/pembayaran/ongkir berasal dari `storeSettings`.
2. **Dilarang Ornamen "Malaysia":** Tidak ada bendera, badge *"Malaysia No. 1"*, atau slogan dekoratif bertuliskan *"Malaysia"*. Kata *"Malaysia"* hanya tampil pada input alamat & daftar negeri saat checkout.
3. **Copywriting Tajam & Singkat:** Hindari kalimat bertele-tele khas AI (*"Discover the magic of..."*, *"Elevate your K-pop journey..."*). Gunakan copy langsung: *"New arrivals"*, *"Select version"*, *"Add to cart"*, *"Out of stock"*.
4. **Tanpa Dekorasi Gradien Berlebihan:** Hindari mesh gradient pelangi, glow neon berlebihan, atau shadow berlapis yang mengaburkan foto produk.
