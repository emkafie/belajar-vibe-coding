# REST API Authentication (Bun + ElysiaJS + Drizzle ORM + PostgreSQL)

A robust, performant REST API backend skeleton built with **Bun** as the runtime, **ElysiaJS** as the web framework, **Drizzle ORM** for database interaction, and **PostgreSQL** as the database. It handles user registration with Bcrypt encryption, user login, UUID-based session management, profile checking, and session invalidation (logout).

---

## 🚀 Fitur Utama
- **Registrasi User**: Membuat data user baru dengan hashing password otomatis menggunakan `bcrypt`.
- **Autentikasi & Login**: Verifikasi password terenkripsi dan pembuatan token sesi acak (UUID).
- **Manajemen Sesi**: Penyimpanan sesi di database PostgreSQL.
- **Profil User Aktif**: Mengambil detail profil user yang sedang login berdasarkan token Authorization Bearer.
- **Logout (Invalidasi Sesi)**: Menghapus token sesi aktif di database.
- **Koneksi Healthcheck**: Endpoint `/ping` untuk memastikan database terhubung.
- **Unit Testing**: Suite testing komprehensif menggunakan `bun:test` dengan cleanup database otomatis sebelum test.

---

## 📂 Struktur Project
Aplikasi ini dirancang menggunakan arsitektur modular yang memisahkan antara layer database (schema & connection), business logic (service layer), dan route handlers (route layer):

```
belajar-vibe-coding/
├── drizzle/                # Direktori migrasi SQL otomatis oleh Drizzle Kit
├── src/
│   ├── db/
│   │   ├── index.ts        # Inisialisasi client Drizzle ORM
│   │   └── schema.ts       # Definisi schema database (users & sessions)
│   ├── services/
│   │   ├── user-services.ts # Logic bisnis data user & profil
│   │   └── auth-services.ts # Logic bisnis autentikasi & logout
│   ├── routes/
│   │   ├── user-routes.ts  # Routing profil & registrasi
│   │   └── auth-routes.ts  # Routing login & logout
│   └── index.ts            # Entry point aplikasi & registrasi server
├── tests/
│   └── api.test.ts         # Unit testing menggunakan bun:test
├── .env                    # Konfigurasi Environment Variables
├── drizzle.config.ts       # Konfigurasi Drizzle Kit
├── package.json
└── tsconfig.json
```

---

## 🗄️ Schema Database

Aplikasi menggunakan dua tabel berelasi di PostgreSQL:

### 1. Tabel `users`
Menyimpan informasi identitas user.
| Nama Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `serial` | Primary Key (auto-increment) |
| `name` | `varchar(50)` | Nama lengkap user |
| `email` | `varchar(100)` | Alamat email (unique & not null) |
| `password` | `varchar(255)` | Hash password bcrypt |
| `created_at` | `timestamp` | Waktu data dibuat (default: now) |
| `updated_at` | `timestamp` | Waktu data diupdate (default: now) |

### 2. Tabel `sessions`
Menyimpan token sesi aktif user.
| Nama Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `serial` | Primary Key (auto-increment) |
| `token` | `varchar(255)` | Token sesi UUID (unique & not null) |
| `user_id` | `integer` | Foreign Key ke `users.id` (On Delete Cascade) |
| `created_at` | `timestamp` | Waktu sesi dibuat (default: now) |
| `updated_at` | `timestamp` | Waktu sesi diupdate (default: now) |

---

## 🛠️ Cara Setup & Instalasi

### 1. Prasyarat
- Pastikan **Bun** sudah terinstall di sistem Anda ([Instalasi Bun](https://bun.sh)).
- Pastikan database **PostgreSQL** aktif dan berjalan.

### 2. Install Dependensi
Cloning repository ini, masuk ke direktori kerja, lalu jalankan install:
```bash
bun install
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env` di root direktori project dan isi dengan detail koneksi database PostgreSQL Anda:
```env
DATABASE_URL="postgres://username:password@localhost:5432/nama_database"
PORT=3000
```

### 4. Jalankan Migrasi Database
Gunakan Drizzle Kit untuk membuat tabel ke dalam PostgreSQL:
```bash
# Men-generate migration files
bun run db:generate

# Mengaplikasikan migrasi ke database PostgreSQL
bun run db:migrate
```

---

## 🏃 Menjalankan Aplikasi & Unit Test

### Menjalankan Server Development (dengan auto-reload)
```bash
bun run dev
```
Server akan aktif di `http://localhost:3000`.

### Menjalankan Unit Test
```bash
bun run test
```
Test runner bawaan Bun akan menjalankan unit test di file `tests/api.test.ts` dan otomatis membersihkan database sebelum test dijalankan.

---

## 📡 Endpoint API

| Method | Endpoint | Headers | Request Body | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/ping` | - | - | Mengecek koneksi database |
| **POST** | `/users` | - | `name`, `email`, `password` | Mendaftarkan user baru |
| **GET** | `/users` | - | - | Mengambil seluruh data user (tanpa password) |
| **POST** | `/login` | - | `email`, `password` | Login & mengambil token sesi |
| **POST** | `/user/current` | `Authorization: Bearer <token>` | - | Mengambil detail profil user yang sedang login |
| **DELETE** | `/user/logout` | `Authorization: Bearer <token>` | - | Logout & menghapus sesi di database |
