# Pengaduan Fasilitas Sekolah (Frontend)

Frontend website untuk melaporkan dan memantau kerusakan fasilitas sekolah (toilet, kelas, lab, lapangan, listrik/AC). Aplikasi ini hanya sisi tampilan dan terhubung ke **API Laravel yang sudah ada**. Tidak ada backend atau database baru di proyek ini.

> **Status:** sintaks JavaScript sudah diperiksa, tetapi integrasi dengan backend Laravel asli **belum diuji**. Lihat bagian [Asumsi dan hal yang perlu disesuaikan](#asumsi-dan-hal-yang-perlu-disesuaikan) sebelum mencoba.

## Fitur

| Peran | Yang bisa dilakukan |
|---|---|
| **Siswa** | Login dengan NISN, buat laporan (maks. 2 foto), lihat riwayat dengan filter status, detail dan tracking, percakapan, notifikasi |
| **Admin / Petugas** | Dashboard statistik, daftar semua laporan dengan filter dan pencarian, tugaskan teknisi, perbarui status dengan catatan, unggah foto hasil perbaikan |
| **Teknisi** | Daftar tugas, detail laporan, perbarui status, percakapan |
| **Semua** | Login/logout, dashboard sesuai peran, notifikasi dengan penanda belum dibaca, profil |

Selain itu: tampilan responsif (sidebar di desktop, navigasi bawah di HP), loading/empty/error state, validasi form, dan pesan error API 401/403/404/422 dalam bahasa Indonesia.

**Role guru:** belum didukung. Backend hanya punya role `siswa`, `admin`, dan `teknisi`. Kode sudah memperlakukan `guru` seperti siswa jika backend suatu saat mengirim role itu.

## Teknologi

- HTML, CSS, JavaScript murni (tanpa build tool)
- Bootstrap 5.3 via CDN (reset gaya, notifikasi sukses/error, indikator loading)
- Font Manrope via Google Fonts
- Ikon SVG inline (tanpa dependensi)

## Struktur folder

```
pengaduan/
├── index.html        # Titik masuk, memuat CSS dan JS
├── css/
│   └── style.css     # Seluruh gaya: bento grid, glass, animasi, responsif
├── js/
│   └── app.js        # Konfigurasi, klien API, router, semua halaman
└── README.md
```

## Cara menjalankan

1. Pastikan backend Laravel berjalan, misalnya di `http://localhost:8000`.
2. Buka `js/app.js` dan ubah konfigurasi di bagian paling atas:

   ```js
   const API_BASE_URL = 'http://localhost:8000';   // alamat Laravel
   const FILE_FIELD = 'attachments[]';             // nama field upload foto
   const STORAGE_URL = API_BASE_URL + '/storage/'; // dasar URL foto
   ```
3. Jalankan lewat server statis (jangan buka file langsung dengan `file://`):

   ```bash
   php -S localhost:5500        # atau: npx serve   /   Live Server di VS Code
   ```
4. Buka `http://localhost:5500`.
5. Pastikan **CORS** di Laravel mengizinkan origin frontend (lihat [Pemecahan masalah](#pemecahan-masalah)).

## Alur login

- **Siswa:** `POST /api/login` dengan `{ "nisn": "..." }` (tanpa password).
- **Petugas dan Teknisi:** `POST /api/login` dengan `{ "email": "...", "password": "..." }`.
- Token disimpan di `localStorage` (`token` dan `user`) dan dikirim sebagai `Authorization: Bearer <token>`.
- Jika API membalas 401, sesi dihapus dan pengguna diarahkan ke halaman login.

## Halaman

Routing memakai hash (`#/halaman`) dan dilindungi berdasarkan sesi dan peran.

| Hash | Halaman | Peran |
|---|---|---|
| `#/login` | Login (tab Siswa / Petugas dan Teknisi) | Publik |
| `#/dashboard` | Dashboard (isi menyesuaikan peran) | Semua |
| `#/reports` | Riwayat (siswa), Semua Laporan (admin), Tugas Saya (teknisi) | Semua |
| `#/create` | Buat laporan | Siswa (dan guru bila didukung) |
| `#/report/{id}` | Detail, tracking, percakapan, panel admin/teknisi | Semua |
| `#/notifications` | Notifikasi | Semua |
| `#/profile` | Profil dan logout | Semua |

## Endpoint API yang dipakai

Hanya endpoint yang ada di spesifikasi. Tidak ada endpoint tambahan.

| Kegunaan | Endpoint |
|---|---|
| Login / logout / profil | `POST /api/login`, `POST /api/logout`, `GET /api/me` |
| Laporan (siswa, teknisi) | `GET /api/reports`, `POST /api/reports`, `GET /api/reports/{id}` |
| Percakapan | `GET /api/reports/{id}/comments`, `POST /api/reports/{id}/comments` (`{ pesan }`) |
| Notifikasi | `GET /api/notifications`, `PATCH /api/notifications/{id}/read` |
| Dashboard admin | `GET /api/admin/dashboard` |
| Daftar laporan admin | `GET /api/admin/reports` |
| Tugaskan teknisi | `POST /api/admin/reports/{id}/assign` (`{ assigned_to }`) |
| Perbarui status | `PATCH /api/admin/reports/{id}/status` (`{ status, catatan }`) |
| Hasil perbaikan | `POST /api/admin/reports/{id}/resolution` (form-data: foto + `catatan`) |

Nilai enum yang dipakai: kategori `toilet | kelas | lab | lapangan | listrik_ac`, urgensi `rendah | sedang | mendesak`, status `pending | diproses | selesai | ditolak`.

## Asumsi dan hal yang perlu disesuaikan

Format respons JSON belum diketahui, jadi beberapa hal dibuat fleksibel dan **perlu Anda cocokkan dengan backend**:

- **Token login:** dibaca dari `token`, `access_token`, `data.token`, atau `data.access_token`. User dibaca dari `user` atau `data.user`, jika tidak ada diambil dari `GET /api/me`.
- **Daftar laporan:** dibaca dari array langsung, `data`, `data.data` (paginasi Laravel), atau `reports`. Fungsi `list()` di `js/app.js` mudah diubah. Paginasi belum ditangani, hanya halaman pertama yang tampil.
- **Nama field laporan:** `id`, `kategori`, `lokasi`, `deskripsi`, `urgensi`, `status`, `assigned_to`, `created_at`, `attachments[].path`, `user.nama` (atau `user.name`).
- **Statistik admin:** diambil dari `/api/admin/dashboard` jika kuncinya cocok (`pending`, `diproses`, `selesai`, `ditolak`, atau `by_status`), jika tidak dihitung dari daftar laporan. Grafik per kategori selalu dihitung dari daftar laporan.
- **Upload foto:** nama field di `FILE_FIELD` (`attachments[]`) hanyalah tebakan. Sesuaikan dengan validasi di controller Laravel. Batas ukuran sisi klien: 2 MB per foto.
- **URL foto:** dibentuk dari `STORAGE_URL + path` (butuh `php artisan storage:link`). Ubah jika backend mengirim URL lengkap atau pola lain.
- **Notifikasi:** teks dibaca dari `data.message`, `data.pesan`, atau `data.title`. Tautan ke laporan memakai `data.report_id` jika ada.

## Keterbatasan yang diketahui

- **Daftar teknisi:** tidak ada endpoint untuk daftar teknisi, jadi admin mengisi **ID teknisi** secara manual di panel penugasan.
- **Teknisi memperbarui status:** memakai endpoint `PATCH /api/admin/reports/{id}/status`. Jika backend membatasinya hanya untuk admin, teknisi akan menerima pesan 403 dan fitur ini perlu endpoint khusus dari backend.
- **Tandai semua dibaca:** memanggil `PATCH /api/notifications/{id}/read` satu per satu karena tidak ada endpoint massal.
- **Data dummy:** tidak disertakan. Aplikasi baru berfungsi setelah backend berjalan.
- **Paginasi, edit/hapus laporan, dan registrasi akun:** belum ada. Akun dibuat oleh petugas sarpras di sisi backend.

## Desain

Gaya: **Minimalism** sebagai dasar, **Bento Grid** untuk ringkasan dashboard, dan **Glassmorphism** hanya sebagai aksen kecil.

- Warna: biru gelap `#0b1f3a`, putih, abu-abu netral, aksen biru `#2f64c4`.
- Kartu kaca transparan hanya muncul di kartu pelacakan pada kartu sapaan, ringkasan form, chip akun di sidebar, dan navigasi bawah HP.
- Animasi halus: kartu muncul bertahap, terangkat sedikit saat disentuh, bar progres terisi pelan, titik status "Diproses" berdenyut. Animasi otomatis mati jika perangkat memakai pengaturan *reduced motion*.
- Variabel warna dan semua gaya ada di `css/style.css` (bagian `:root`).

## Pemecahan masalah

| Gejala | Kemungkinan penyebab dan solusi |
|---|---|
| "Tidak dapat terhubung ke server" | `API_BASE_URL` salah atau backend belum jalan |
| Error CORS di konsol browser | Izinkan origin frontend di `config/cors.php` Laravel (misalnya `http://localhost:5500`) dan pastikan `paths` mencakup `api/*` |
| Login berhasil tetapi kembali ke halaman login | Token tidak terbaca. Periksa bentuk respons login dan sesuaikan bagian login di `js/app.js` |
| Daftar laporan kosong padahal data ada | Bentuk respons berbeda. Sesuaikan fungsi `list()` |
| Foto tidak tampil | Jalankan `php artisan storage:link` dan sesuaikan `STORAGE_URL` |
| Upload foto ditolak (422) | Sesuaikan `FILE_FIELD` dengan nama field di validasi Laravel |
| Pesan 403 saat teknisi mengubah status | Backend membatasi endpoint status untuk admin |

## Daftar periksa pengujian dengan backend

- [ ] Login siswa (NISN) dan login petugas/teknisi (email + password)
- [ ] Logout dan akses halaman tanpa sesi (harus kembali ke login)
- [ ] Buat laporan tanpa foto, dengan 1 foto, dan dengan 2 foto
- [ ] Validasi form (lokasi/deskripsi kosong) dan error 422 dari server
- [ ] Riwayat dan filter status, detail laporan, percakapan
- [ ] Notifikasi: penanda belum dibaca dan tandai dibaca
- [ ] Admin: filter, tugaskan teknisi, ubah status dengan catatan, unggah hasil perbaikan
- [ ] Teknisi: daftar tugas dan akses detail
- [ ] Tampilan di HP (lebar sekitar 390 px) dan desktop
