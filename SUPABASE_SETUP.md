# Setup Supabase untuk Urbana Dashboard

## Langkah-langkah Setup

### 1. Buat Proyek Supabase
1. Kunjungi [https://supabase.com](https://supabase.com)
2. Buat akun atau login
3. Klik "New Project"
4. Isi nama proyek dan password database
5. Pilih region terdekat
6. Klik "Create new project"

### 2. Dapatkan Kredensial API
1. Setelah proyek dibuat, pergi ke **Settings** > **API**
2. Copy **Project URL** dan **anon public key**

### 3. Konfigurasi Environment Variables
1. Buka file `.env.local` di root proyek
2. Ganti nilai berikut dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Authentication Providers (Opsional)

#### Google OAuth
1. Pergi ke **Authentication** > **Providers** di dashboard Supabase
2. Enable Google provider
3. Masukkan Google Client ID dan Client Secret
4. Tambahkan redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

#### Apple OAuth
1. Pergi ke **Authentication** > **Providers** di dashboard Supabase
2. Enable Apple provider
3. Masukkan Apple Client ID dan Client Secret
4. Tambahkan redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

### 5. Konfigurasi Site URL
1. Pergi ke **Authentication** > **URL Configuration**
2. Tambahkan URL berikut:
   - Site URL: `http://localhost:3000` (untuk development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 6. Test Login
1. Jalankan aplikasi: `pnpm dev`
2. Buka `http://localhost:3000/login`
3. Coba login dengan email/password atau OAuth providers

## Fitur yang Tersedia

- ✅ Email/Password Authentication
- ✅ Google OAuth Login
- ✅ Apple OAuth Login
- ✅ Auto redirect setelah login
- ✅ Protected routes
- ✅ Toast notifications
- ✅ Loading states

## Troubleshooting

### Error: "Invalid login credentials"
- Pastikan email dan password benar
- Pastikan user sudah terdaftar di Supabase

### Error: "OAuth provider not configured"
- Pastikan provider OAuth sudah diaktifkan di Supabase dashboard
- Pastikan Client ID dan Secret sudah diisi dengan benar

### Error: "Redirect URL mismatch"
- Pastikan redirect URL di Supabase sesuai dengan URL aplikasi
- Untuk development: `http://localhost:3000/auth/callback`
- Untuk production: `https://yourdomain.com/auth/callback`