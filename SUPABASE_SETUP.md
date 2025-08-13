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

### 6. Setup Storage Bucket
1. Pergi ke **Storage** di dashboard Supabase
2. Klik "Create a new bucket"
3. Nama bucket: `documents`
4. Set sebagai **Private bucket**
5. Klik "Create bucket"

### 7. Setup Row Level Security (RLS) Policies untuk Storage
1. Pergi ke **Storage** > **Policies**
2. Klik "New Policy" pada tabel `storage.objects`
3. Buat policy untuk INSERT:
   ```sql
   CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'documents');
   ```
4. Buat policy untuk SELECT:
   ```sql
   CREATE POLICY "Allow authenticated users to view documents" ON storage.objects
   FOR SELECT TO authenticated
   USING (bucket_id = 'documents');
   ```
5. Buat policy untuk DELETE:
   ```sql
   CREATE POLICY "Allow authenticated users to delete documents" ON storage.objects
   FOR DELETE TO authenticated
   USING (bucket_id = 'documents');
   ```

### 8. Setup Database Tables (Migrasi)
1. Pergi ke **SQL Editor** di dashboard Supabase
2. Copy dan paste script SQL berikut untuk membuat tabel billing_info:

```sql
-- Create billing_info table
CREATE TABLE IF NOT EXISTS public.billing_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_holder_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(19) NOT NULL, -- Formatted with spaces
    expiry_month VARCHAR(2) NOT NULL,
    expiry_year VARCHAR(4) NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    billing_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.billing_info ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own billing info
CREATE POLICY "Users can view their own billing info" ON public.billing_info
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing info" ON public.billing_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing info" ON public.billing_info
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billing info" ON public.billing_info
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_info_updated_at
    BEFORE UPDATE ON public.billing_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

3. Klik "Run" untuk menjalankan script
4. Pastikan tidak ada error yang muncul

### 9. Test Login
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

### Error: "StorageApiError: new row violates row-level security policy"
- Pastikan bucket 'documents' sudah dibuat
- Pastikan RLS policies untuk storage.objects sudah dibuat (lihat langkah 7)
- Pastikan user sudah login/authenticated sebelum upload file