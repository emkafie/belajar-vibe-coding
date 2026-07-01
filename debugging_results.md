# Laporan Debugging: Alur Registrasi, Login, dan Logout

Dokumen ini mendokumentasikan serangkaian pengujian dan hasil debugging yang dilakukan pada endpoint Registrasi User, Login, dan Logout.

---

## 1. Uji Coba Registrasi User (`POST /users`)

### Skenario A: Registrasi dengan Field Tidak Lengkap (Tanpa Password)
- **Request HTTP**:
  - Method: `POST`
  - URL: `http://localhost:3000/users`
  - Body:
    ```json
    {
      "name": "Debug User",
      "email": "debuguser@example.com"
    }
    ```
- **Hasil/Response (HTTP 400)**:
  ```json
  {
    "status": "error",
    "message": "User created failed",
    "data": null
  }
  ```
- **Analisis**: Sesuai ekspektasi. API menolak pembuatan user karena field `password` tidak disediakan.

### Skenario B: Registrasi User Valid
- **Request HTTP**:
  - Method: `POST`
  - URL: `http://localhost:3000/users`
  - Body:
    ```json
    {
      "name": "Debug User",
      "email": "debuguser@example.com",
      "password": "debugpassword"
    }
    ```
- **Hasil/Response (HTTP 201)**:
  ```json
  {
    "status": "ok",
    "message": "User created successfully",
    "data": "ok"
  }
  ```
- **Analisis**: Sukses. User berhasil didaftarkan ke PostgreSQL dan password terenkripsi dengan aman menggunakan Bcrypt.

### Skenario C: Registrasi dengan Email Duplikat
- **Request HTTP**:
  - Method: `POST`
  - URL: `http://localhost:3000/users`
  - Body:
    ```json
    {
      "name": "Debug User 2",
      "email": "debuguser@example.com",
      "password": "debugpassword2"
    }
    ```
- **Hasil/Response (HTTP 400)**:
  ```json
  {
    "status": "error",
    "message": "User created failed",
    "data": null
  }
  ```
- **Analisis**: Sesuai ekspektasi. Database menolak karena pelanggaran unique constraint pada field `email`.

---

## 2. Uji Coba Login User (`POST /login`)

### Skenario A: Login dengan Password Salah
- **Request HTTP**:
  - Method: `POST`
  - URL: `http://localhost:3000/login`
  - Body:
    ```json
    {
      "email": "debuguser@example.com",
      "password": "wrongpassword"
    }
    ```
- **Hasil/Response (HTTP 401)**:
  ```json
  {
    "status": "error",
    "message": "Login failed",
    "data": null
  }
  ```
- **Analisis**: Sesuai ekspektasi. Pencocokan password Bcrypt gagal sehingga akses ditolak.

### Skenario B: Login dengan Kredensial Valid
- **Request HTTP**:
  - Method: `POST`
  - URL: `http://localhost:3000/login`
  - Body:
    ```json
    {
      "email": "debuguser@example.com",
      "password": "debugpassword"
    }
    ```
- **Hasil/Response (HTTP 200)**:
  ```json
  {
    "status": "ok",
    "message": "Login successfully",
    "data": "0c2ce018-514d-424e-9c6f-fccb3b0a2e4c"
  }
  ```
- **Analisis**: Sukses. Token UUID berhasil dihasilkan dan tercatat di database PostgreSQL pada tabel `sessions`.

---

## 3. Uji Coba Logout User (`DELETE /user/logout`)

### Skenario A: Logout dengan Token Tidak Valid
- **Request HTTP**:
  - Method: `DELETE`
  - URL: `http://localhost:3000/user/logout`
  - Headers:
    - `Authorization`: `Bearer invalid-token`
- **Hasil/Response (HTTP 401)**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- **Analisis**: Sesuai ekspektasi. Token tidak ditemukan di database sehingga response mengembalikan error `Unauthorized`.

### Skenario B: Logout dengan Token Valid
- **Request HTTP**:
  - Method: `DELETE`
  - URL: `http://localhost:3000/user/logout`
  - Headers:
    - `Authorization`: `Bearer 0c2ce018-514d-424e-9c6f-fccb3b0a2e4c`
- **Hasil/Response (HTTP 200)**:
  ```json
  {
    "data": "OK"
  }
  ```
- **Analisis**: Sukses. Data sesi terkait token `0c2ce018-514d-424e-9c6f-fccb3b0a2e4c` berhasil dihapus dari tabel `sessions` di database.

---

## 4. Temuan Error / Bugs
Selama sesi debugging penuh (registrasi -> login -> logout), **tidak ditemukan error runtime atau bug logic pada aplikasi**. Semua endpoint dan logic database (select, insert, delete, Bcrypt hashing & comparison) berjalan 100% stabil sesuai spesifikasi fungsional yang diinginkan.
