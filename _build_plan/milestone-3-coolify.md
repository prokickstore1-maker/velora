# Milestone 3: QA Compliance Audit, Anti-AI Slop & Coolify Production Readiness

**Goal:** Memastikan 100% kepatuhan terhadap checklist `Myvelora_Brand_Identity_PRD.pdf` Hal. 7, standar Anti-AI Slop, responsivitas layar ponsel, lolos typecheck/lint/build, dan siap di-deploy ke Coolify.

**Referensi Wajib:**
- [Myvelora_Brand_Identity_PRD.pdf](file:///d:/project%20web/myvelorastore/Myvelora_Brand_Identity_PRD.pdf) (Hal. 7 Acceptance Criteria)
- [DESIGN.md](file:///d:/project%20web/myvelorastore/DESIGN.md)
- [_build_plan/blueprints/Dockerfile](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/Dockerfile)

---

## Checklist Pekerjaan

### 1. Audit Acceptance Criteria PDF (Hal. 7)
- [ ] Logo `mv` konsisten dengan sparkle pink `#FA3890` di kanan atas; tidak terdistorsi/berubah warna/bertambah efek.
- [ ] Palet warna sesuai kunci desain (`#47023B`, `#FA3890`, `#F5D5E3`, `#FBF7F4`, `#FFFFFF`); tidak ada teks kecil berwarna `#FA3890` di atas latar putih/ivory.
- [ ] Seluruh teks publik di storefront **100% Bahasa Inggris**, ringkas, natural, dan bebas typo.
- [ ] Kartu produk & detail produk menampilkan **satu foto dominan** (`4:5`) tanpa elemen kotak-kotak kecil yang ramai.
- [ ] **Zero Unconfirmed Claims:** Saat `storeSettings` masih default/nonaktif, pastikan tidak muncul klaim keaslian, klaim ready stock promosi, kebijakan retur palsu, ongkir/pembayaran statis, atau ornamen kata *"Malaysia"*.

### 2. Audit Anti-AI Slop & Mobile Responsiveness
- [ ] Cek tampilan pada viewport ponsel (`360px`–`430px`): pastikan tidak ada horizontal overflow (`overflow-x`), font harga `RM` dan deskripsi terbaca jelas, dan tap target tombol minimal `44x44px`.
- [ ] Pastikan seluruh form (Checkout, Upload Bukti Bayar, Track Order, Admin CRUD) tervalidasi dengan Zod baik di client maupun server dengan pesan error yang ramah dan jelas.
- [ ] Pastikan gambar menggunakan `next/image` atau tag teroptimasi dengan fallback aman serta aspek rasio tetap agar tidak terjadi *Cumulative Layout Shift* (CLS).

### 3. Persiapan Deployment Coolify
- [ ] Salin / finalisasi [_build_plan/blueprints/Dockerfile](file:///d:/project%20web/myvelorastore/_build_plan/blueprints/Dockerfile) ke root `Dockerfile` serta tambahkan `.dockerignore`.
- [ ] Tambahkan endpoint healthcheck `GET /api/health` yang memverifikasi aplikasi & konektivitas PostgreSQL ringan untuk Coolify health check.
- [ ] Dokumentasikan langkah konfigurasi Environment Variables, S3/MinIO bucket CORS/public read policy, dan migrasi database di Coolify dalam `HANDOFF.md`.

### 4. Verifikasi Akhir
- [ ] Jalankan `npx tsc --noEmit` -> wajib **EXIT=0**.
- [ ] Jalankan `npm run lint` -> wajib bersih tanpa error.
- [ ] (Dengan izin user) Jalankan production build check `npm run build`.
- [ ] Perbarui `DAILY_TASKS.md` dan `HANDOFF.md`.
