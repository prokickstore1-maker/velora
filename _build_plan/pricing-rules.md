# MYVELORA STORE — PRICING RULES

Dokumen ini adalah aturan paten perhitungan harga produk untuk **Myvelora Store** (Mata Uang Penjualan: **Ringgit Malaysia / MYR / RM**).
Website: `www.myvelorastore1.com`

---

## 1. Mata Uang Sumber
Harga produk dapat berasal dari berbagai mata uang:
- **USD** — Dolar Amerika
- **SGD** — Dolar Singapura
- **KRW** — Won Korea Selatan
- **JPY** — Yen Jepang
- **IDR** — Rupiah Indonesia
- **THB** — Baht Thailand
- **CNY** — Yuan China
- **AUD** — Dolar Australia
- **EUR** — Euro
- **GBP** — Pound Sterling
- **MYR** — Ringgit Malaysia

Seluruh harga jual akhir wajib menggunakan **Ringgit Malaysia (RM)** bulat tanpa desimal.

---

## 2. Aturan Kurs Konversi
- Identifikasi mata uang asli produk dengan teliti (jangan berasumsi simbol `$` selalu USD).
- **Khusus USD**: Wajib gunakan kurs acuan tetap: **`1 USD = RM 4.086165`** (sampai ada instruksi pembaruan dari user).
- **Mata uang lainnya**: Gunakan kurs terkini yang terverifikasi dan konsisten dalam 1 batch.
- **Jika sudah MYR**: Tidak perlu konversi kurs (langsung terapkan potongan 20%).

---

## 3. Aturan Potongan Harga & Pembulatan (Rumus Wajib)
Setelah dikonversi ke MYR, wajib dipotong 20% dan dibulatkan ke bawah (**FLOOR**):

$$\text{Harga Akhir (RM)} = \lfloor \text{Harga Sumber} \times \text{Kurs MYR} \times 0.80 \rfloor$$

### Ketentuan Pembulatan:
- **Wajib pembulatan ke bawah (FLOOR)** setelah potongan 20%.
- Dilarang membulatkan ke atas (`CEIL` / `ROUND`).
- Dilarang membulatkan harga sebelum potongan 20% diterapkan.
- Contoh:
  - RM 189.96 → **RM 189**
  - RM 167.82 → **RM 167**
  - RM 158.25 → **RM 158**
  - RM 200.99 → **RM 200**

---

## 4. Contoh Verifikasi Lengkap
- **Harga Sumber**: USD 54.67
- **Konversi**: `54.67 × 4.086165 = 223.39064055`
- **Potongan 20%**: `223.39064055 × 0.80 = 178.71251244`
- **Hasil Akhir (FLOOR)**: **RM 178**

---

## 5. Aturan Variasi Produk
- Jika satu produk memiliki beberapa versi/varian dengan harga sumber berbeda, hitung masing-masing versi secara independen menggunakan rumus di atas.
- Dilarang menyamakan harga seluruh variasi jika harga aslinya berbeda.

---

## 6. Standar Output & Larangan (Status: HARGA FIX TOKO)
- **Status Harga**: Seluruh harga yang dihitung dari rumus ini adalah **HARGA JUAL FIX RESMI MYVELORA STORE** (Fixed Store Retail Price). Tidak boleh diubah, dimarkup, atau dipotong ulang.
- **Tampilkan hanya harga jual akhir dalam RM bulat**.
- **Dilarang** menampilkan desimal (`.00`, `.50`).
- **Dilarang** menampilkan teks "20% OFF", harga coret, atau harga sebelum diskon.
- **Dilarang** menambahkan markup, pajak, atau ongkir tanpa instruksi.
- **Dilarang** menerapkan potongan berulang pada harga yang sudah dihitung.
- Format standar:
  ```text
  Product Name: [Nama lengkap produk]
  Price: RM[Harga akhir]
  ```
