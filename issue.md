# Perencanaan Implementasi: Unit Testing API Menggunakan `bun:test`

Dokumen ini berisi perencanaan untuk pembuatan unit test seluruh API yang tersedia pada aplikasi ini dengan menggunakan test runner bawaan Bun (`bun:test`).

---

## 1. Lokasi & Library Pengujian
- **Folder Pengujian**: Buat folder `tests/` di root direktori project.
- **Nama File**: Tempatkan pengujian dalam file `tests/api.test.ts` (atau dipisah per modul sesuai preferensi).
- **Library**: Gunakan modul bawaan `bun:test` (seperti `describe`, `it`, `expect`, `beforeEach`, `afterEach`).

---

## 2. Konsistensi Data Uji (Database Cleanup)
Untuk memastikan pengujian berjalan dengan konsisten dan deterministik, data pada database harus dibersihkan terlebih dahulu sebelum setiap pengujian dijalankan.
- Gunakan hook `beforeEach` atau `beforeAll` untuk menghapus seluruh data pada tabel `sessions` dan `users`.
- *Catatan*: Dikarenakan adanya relasi foreign key, pastikan untuk menghapus data di tabel `sessions` terlebih dahulu sebelum menghapus data di tabel `users`.

---

## 3. Skenario Pengujian Per API

Junior programmer atau model AI implementor harus membuat pengujian untuk skenario-skenario berikut:

### A. Endpoint Health Check (`GET /ping`)
1. **Skenario Sukses**:
   - Memastikan API mengembalikan HTTP status `200`.
   - Memastikan response mengembalikan status "ok", pesan sukses, dan data "ok".

### B. Endpoint Registrasi User (`POST /users`)
1. **Skenario Sukses**:
   - Mendaftarkan user baru dengan payload valid (name, email, password).
   - Memastikan user tersimpan di DB, mengembalikan HTTP status `201`, dan response status "ok".
2. **Skenario Gagal (Validasi Payload)**:
   - Mengirim request dengan field wajib yang kurang (misal tanpa password).
   - Memastikan API menolak request dengan HTTP status `400`.
3. **Skenario Gagal (Email Duplikat)**:
   - Mencoba mendaftarkan email yang sudah pernah terdaftar sebelumnya.
   - Memastikan API mengembalikan HTTP status `400`.

### C. Endpoint Ambil Daftar User (`GET /users`)
1. **Skenario Sukses**:
   - Mengambil seluruh user terdaftar.
   - Memastikan response mengembalikan HTTP status `200`.
   - Memastikan data list user terambil dan field `password` tidak terekspos/tidak ada di response body.

### D. Endpoint Login User (`POST /login`)
1. **Skenario Sukses**:
   - Login dengan email & password yang benar.
   - Memastikan login sukses (HTTP status `200`) dan mengembalikan string token UUID.
   - Memastikan token UUID baru tercatat di tabel `sessions` pada database.
2. **Skenario Gagal (Password Salah)**:
   - Login menggunakan email benar tetapi password salah.
   - Memastikan API menolak dengan HTTP status `401`.
3. **Skenario Gagal (User Tidak Terdaftar)**:
   - Login menggunakan email yang tidak ada di database.
   - Memastikan API menolak dengan HTTP status `401`.

### E. Endpoint User Aktif (`POST /user/current`)
1. **Skenario Sukses**:
   - Mengirimkan token valid melalui header `Authorization: Bearer <token>`.
   - Memastikan API mengembalikan profil user yang aktif dengan HTTP status `200`.
2. **Skenario Gagal (Token Salah/Tidak Dikirim)**:
   - Menguji pemanggilan API dengan token acak yang salah, atau tanpa menyertakan header Authorization sama sekali.
   - Memastikan API menolak akses dengan HTTP status `401` dan body `{ "error": "Unauthorized" }`.

### F. Endpoint Logout User (`DELETE /user/logout`)
1. **Skenario Sukses**:
   - Melakukan logout dengan mengirimkan token valid via header `Authorization`.
   - Memastikan response sukses (HTTP status `200`) dengan data `"OK"`.
   - Memastikan token sesi terkait telah terhapus sepenuhnya dari tabel `sessions` di database.
2. **Skenario Gagal (Token Salah/Tidak Dikirim)**:
   - Melakukan request tanpa token atau dengan token yang salah.
   - Memastikan API menolak request dengan HTTP status `401`.
