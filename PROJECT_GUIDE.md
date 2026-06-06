# Project Guide — Lunare

## Struktur Project Lunare

Root: lunare-_web/

- backend/
  - main.py
    - FastAPI app entrypoint
    - `app.include_router(...)` mendaftarkan `auth`, `periods`, `symptoms`
    - mount static uploads di `/uploads`
  - database.py
    - inisialisasi SQLAlchemy engine
    - baca env `DATABASE_URL`
    - handle `postgres://` -> `postgresql://`
  - models.py
    - `User`: data akun, profil, relasi `periods` dan `symptoms`
    - `Period`: data periode dengan `start_date`, `end_date`, `mood`
    - `Symptom`: catatan gejala harian, termasuk fisik & mental
  - routes/
    - auth.py
      - `POST /register` -> register user
      - `POST /login` -> login dan generate JWT
      - `GET /profile` -> ambil profil user
      - `PUT /profile` -> update profil (username/email/password/fitur medis)
      - `POST /profile/upload-photo` -> upload foto profil ke base64
      - `DELETE /profile/delete-photo` -> hapus foto profil
    - periods.py
      - `POST /periods` -> tambah data periode
      - `GET /periods` -> list periode user
      - `PUT /periods/{id}` -> update data periode
      - `DELETE /periods/{id}` -> hapus data periode
      - `GET /periods/prediction` -> hitung rata-rata siklus, masa subur, ovulasi, prediksi 12 siklus
    - symptoms.py
      - `POST /symptoms` -> simpan atau update catatan gejala harian
      - `GET /symptoms` -> list semua gejala user
      - `GET /symptoms/date/{date}` -> ambil data gejala per tanggal
  - schemas/
    - `user_schema.py` -> request/response model untuk auth/profile
    - `period_schema.py` -> request/response model untuk periode
    - `symptom_schema.py` -> request/response model untuk gejala
  - utils/
    - auth_middleware.py -> JWT decode, `get_current_user` dependency
    - jwt_handler.py -> create access token
    - hashing.py -> bcrypt password hash/verify
  - uploads/
    - menyimpan file upload profile picture

- frontend/
  - src/
    - `main.jsx`
      - entry point React, render `<App />`
    - `App.jsx`
      - router aplikasi
      - `ProtectedRoute` untuk halaman yang memerlukan login
      - `PublicRoute` untuk halaman login/register ketika belum login
    - pages/
      - `LandingPage.jsx`
        - halaman awal publik, hero, fitur, link login/register
      - `Login.jsx`
        - halaman autentikasi user
      - `Register.jsx`
        - halaman pembuatan akun baru
      - `Dashboard.jsx`
        - container utama setelah login
        - menggabungkan sidebar dan section yang aktif
      - `Profile.jsx`
        - edit profil, umur, tinggi, berat, foto profil
      - `Edukasi.jsx`
        - daftar artikel edukasi yang dapat like/bookmark dan quiz
    - components/
      - layout/
        - `Sidebar.jsx`
          - kontrol navigasi internal dashboard
      - dashboard/
        - `DashboardOverview.jsx`
          - ringkasan siklus, kalender, statistik, insights
        - `PhaseCard.jsx`
          - visualisasi fase siklus saat ini
        - `Insights.jsx`
          - kartu tips/insights ringan
      - periods/
        - `CycleTracker.jsx`
          - wrapper tracker periode
        - `AddPeriodForm.jsx`
          - form log data periode baru
        - `PeriodHistory.jsx`
          - list periode, edit inline, delete
      - symptoms/
        - `SymptomJournal.jsx`
          - catat gejala fisik/mental harian berdasarkan tanggal
      - reports/
        - `HealthReport.jsx`
          - tombol unduh PDF dan preview laporan
        - `ReportPreview.jsx`
          - layout detail laporan untuk ekspor
      - common/
        - `AlertModal.jsx`
          - modal untuk notifikasi dan konfirmasi
    - hooks/
      - `usePeriods.js`
        - ambil data periode + prediksi
        - helper logic: current phase, fertile day, ovulation day, predicted day
      - `useSymptoms.js`
        - ambil gejala dan simpan catatan baru
    - services/
      - `api.js`
        - instance axios dengan baseURL dan Authorization header
      - `authService.js`
        - panggilan API login/register/profile
      - `periodService.js`
        - panggilan API /periods dan /periods/prediction
      - `symptomService.js`
        - panggilan API /symptoms
      - `reportService.js`
        - generate PDF dari konten HTML
    - utils/
      - `calendarHelpers.js`
        - helper phase info dan kalender tile class
      - `reportFormatter.js`
        - helper laporan, BMI, mood summary, symptom distribution

## Database

Tabel utama dan relasi (models.py):

- `users` (User)
  - kolom: `id`, `username`, `email`, `password`, `full_name`, `birth_date`, `height`, `weight`, `profile_picture`, `created_at`
  - relasi: `periods` (User -> Period), `symptoms` (User -> Symptom)
  - catatan: password disimpan dalam hash, foto profil disimpan sebagai base64 string

- `periods` (Period)
  - kolom: `id`, `user_id`, `start_date`, `end_date`, `mood`
  - relasi: `user` (Period -> User)
  - catatan: `mood` disimpan sebagai teks opsional untuk ringkasan siklus

- `symptoms` (Symptom)
  - kolom: `id`, `user_id`, `date`, `cramps`, `headache`, `bloating`, `fatigue`, `acne`, `breast_tenderness`, `insomnia`, `mood_swings`, `anxiety`, `depressed`, `note`
  - catatan: setiap tanggal hanya satu entry per user, update akan meng-overwrite data yang ada

## Alur Aplikasi

### 1. Autentikasi dan session
- User membuka `LandingPage.jsx`.
- Jika user mengklik login/register, frontend mengarah ke `Login.jsx` atau `Register.jsx`.
- `AuthContext.jsx` menyimpan token JWT di `localStorage`.
- Setelah login, `AuthContext` memanggil `authService.getProfile()` untuk mengisi `user`.
- Semua request API kemudian dikirim dengan header `Authorization: Bearer <token>` dari `api.js`.

### 2. Dashboard dan navigation
- `App.jsx` mengatur routing utama dan membantu menampilkan `Dashboard.jsx` hanya untuk user yang sudah login.
- `Dashboard.jsx` memuat `Sidebar.jsx` dan konten seção yang aktif.
- Profil, tracker, report, dan edukasi berada dalam satu halaman dashboard yang di-switch berdasarkan `activeSection`.

### 3. Data periode dan prediksi siklus
- `usePeriods.js` memanggil `periodService.getPeriods()` dan `periodService.getPrediction()`.
- `periods.js` di backend menyimpan periode dan menghitung prediksi:
  - hitung rata-rata panjang siklus dari periode sebelumnya
  - hitung durasi menstruasi rata-rata
  - prediksi tanggal menstruasi berikutnya, ovulasi, dan fertile window
  - buat daftar prediksi 12 siklus ke depan untuk kalender
- `DashboardOverview.jsx` menampilkan hasil prediksi dengan `PhaseCard`, `CycleCalendar`, dan `StatsCard`.

### 4. Pencatatan gejala harian
- `SymptomJournal.jsx` menampilkan gejala fisik/mental yang bisa dipilih severity-nya.
- Komponen ini memanggil `symptomService.getSymptomByDate()` untuk mengambil data per tanggal.
- Menyimpan data ke backend dengan `symptomService.saveSymptom()`.
- Data yang tersimpan muncul kembali ketika user memilih tanggal yang sama.

### 5. Laporan kesehatan dan ekspor PDF
- `HealthReport.jsx` menampilkan tombol unduh PDF.
- `ReportPreview.jsx` membuat layout laporan yang digunakan oleh `reportService.generatePDFReport()`.
- Laporan mencakup ringkasan periode, mood, gejala, BMI, dan prediksi 12 siklus.

## Workflow Frontend – Fitur ke File

- login/register: `pages/Login.jsx`, `pages/Register.jsx`, `services/authService.js`, `context/AuthContext.jsx`
- dashboard utama: `pages/Dashboard.jsx`, `components/layout/Sidebar.jsx`, `components/dashboard/DashboardOverview.jsx`
- kalender siklus: `components/calendar/CycleCalendar.jsx`, `utils/calendarHelpers.js`
- tracker periode: `components/periods/AddPeriodForm.jsx`, `components/periods/PeriodHistory.jsx`
- catat gejala: `components/symptoms/SymptomJournal.jsx`, `services/symptomService.js`
- laporan PDF: `components/reports/HealthReport.jsx`, `components/reports/ReportPreview.jsx`, `services/reportService.js`

## Workflow Backend – Fitur ke File

- autentikasi & profil: `routes/auth.py`, `schemas/user_schema.py`, `utils/jwt_handler.py`, `utils/hashing.py`, `utils/auth_middleware.py`
- data periode: `routes/periods.py`, `schemas/period_schema.py`, `models.py`
- data gejala: `routes/symptoms.py`, `schemas/symptom_schema.py`, `models.py`
- database init: `database.py`, `models.py`

## Jika Ingin Mengubah UI

- Fokus di `frontend/src/components/*` dan `frontend/src/pages/*`.
- Jika ingin mengubah warna, layout, atau teks: cari file komponen terkait di `components/`.
- Untuk perubahan halaman baru, tambahkan route baru di `App.jsx` dan komponen baru di `pages/`.

## Jika Ingin Mengubah Logic Backend

- Endpoint baru: tambah route baru di `backend/routes/` dan schema di `backend/schemas/` jika perlu.
- Database model: ubah `backend/models.py`, lalu jalankan ulang `backend/main.py` dengan DB migration manual/`create_all`.
- Periksa `backend/database.py` jika ingin mengganti engine atau host DB.

## Troubleshooting Cepat

- Request 401 saat login valid: periksa token disimpan di `localStorage` (`token`) dan interceptor `api.js`.
- Data tidak muncul di Dashboard: periksa `usePeriods.js` dan response dari `/periods/prediction`.
- Upload foto gagal: periksa jenis file dan limit di `routes/auth.py` plus implementasi `Profile.jsx`.

## Cara Menjalankan (Lebih Detail)

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Pastikan file backend/.env ada dan berisi:
# DATABASE_URL=sqlite:///./lunare.db
# JWT_SECRET_KEY=your_secret_key
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Akses frontend kemudian di browser, biasanya `http://localhost:5173`.

## Tambahan untuk Presentasi

- Buka `PROJECT_GUIDE.md` sebagai peta jalan.
- Tunjukkan `App.jsx` untuk menjelaskan routing.
- Jelaskan data flow: `AuthContext` -> `usePeriods` / `useSymptoms` -> `components`.
- Tunjukkan backend `routes/periods.py` sebagai implementasi logika prediksi siklus.
- Jika diminta ubah UI di depan dosen, buka `components/dashboard/DashboardOverview.jsx` atau `components/periods/AddPeriodForm.jsx`.

---
File ini dibuat otomatis oleh asisten dokumentasi. Jika Anda ingin lebih lanjut, saya bisa menambahkan diagram alur atau merinci baris kode di file tertentu.