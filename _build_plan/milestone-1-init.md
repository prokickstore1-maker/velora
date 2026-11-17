# Milestone 1: Project Initialization, Theme System & Database Foundation

**Goal:** Menyiapkan fondasi teknis Next.js 16.4, sistem desain visual Myvelora Store (Light Mode First), konfigurasi Drizzle ORM + PostgreSQL, dan utilitas S3/MinIO Object Storage.

**Referensi Wajib:**
- [_build_plan/prd.md](file:///d:/project%20web/myvelorastore/_build_plan/prd.md)
- [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md)
- [_build_plan/blueprints/theme-config.css](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/theme-config.css)
- [_build_plan/blueprints/schema-proposal.ts](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/schema-proposal.ts)
- [_build_plan/blueprints/shadcn-components.txt](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/shadcn-components.txt)

---

## Checklist Pekerjaan

### 1. Inisialisasi Next.js 16.4 & Struktur Folder
- [x] Inisialisasi proyek Next.js 16.4 (TypeScript, App Router, Tailwind CSS v4, ESLint 9 flat config, `src/` directory).
- [x] Pastikan `next.config.ts` mengaktifkan `output: "standalone"` (untuk Coolify Docker) dan `images.remotePatterns` untuk domain S3/MinIO.
- [x] Baca dokumen bawaan `node_modules/next/dist/docs/` sebelum menulis konfigurasi App Router (pastikan tidak menggunakan flag `--turbopack` manual dan pakai `proxy.ts` bila perlu proteksi request).

### 2. Design Tokens & Tipografi (`Montserrat` & `Poppins`)
- [x] Pasang `Montserrat` (`500`, `600`, `700`, `800` normal & italic) dan `Poppins` (`400`, `500`, `600`) via `next/font/google` pada `src/app/layout.tsx` dengan CSS variable `--font-montserrat` dan `--font-poppins`.
- [x] Terapkan isi [_build_plan/blueprints/theme-config.css](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/theme-config.css) ke `src/app/globals.css`.
- [x] Install Shadcn UI CLI dan seluruh komponen di `_build_plan/blueprints/shadcn-components.txt`.
- [x] Siapkan komponen `<BrandLogo />` yang mendukung gambar SVG/PNG master dari `storeSettings` dan fallback SVG sementara monogram `mv` + sparkle `#FA3890` sesuai aturan PDF Hal. 3.

### 3. Konfigurasi Database Drizzle ORM + PostgreSQL
- [x] Install `drizzle-orm`, `postgres`, `drizzle-kit`, dan `zod`.
- [x] Buat `src/db/index.ts` dan `src/db/schema.ts` mengacu pada [_build_plan/blueprints/schema-proposal.ts](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/schema-proposal.ts).
- [x] Buat helper inisialisasi baris default `storeSettings` (`id = 1`, seluruh toggle `shippingEnabled`, `paymentEnabled`, `faqEnabled`, `returnPolicyEnabled` bernilai `false` secara default agar tidak menampilkan klaim belum terkonfirmasi).
- [x] Buat `.env.example` yang mendokumentasikan `DATABASE_URL`, `ADMIN_PASSWORD_HASH` / `ADMIN_SESSION_SECRET`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`.
- [x] **Ingat aturan `AGENTS.md`:** Jangan eksekusi `drizzle-kit push` / `migrate` tanpa izin eksplisit user.

### 4. Utilitas S3/MinIO & Kompresi Gambar Klien
- [x] Install `@aws-sdk/client-s3` dan `@aws-sdk/s3-request-presigner`.
- [x] Buat `src/lib/s3.ts` untuk menerbitkan presigned PUT URL yang aman dengan validasi MIME type dan ukuran file maksimum.
- [x] Buat utilitas kompresi gambar klien (`src/lib/image-compress.ts`) menggunakan HTML5 Canvas (`image/webp` atau `image/jpeg`, max width `1400px`) untuk foto produk dan bukti bayar sebelum upload.

### 5. Verifikasi Milestone 1
- [x] Jalankan `npx tsc --noEmit` (EXIT=0) dan `npm run lint` tanpa error.
- [x] Perbarui `DAILY_TASKS.md` dan `HANDOFF.md`.
