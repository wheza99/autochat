# Device Management Setup

## Langkah-langkah Setup Device Management

### 1. Jalankan Migrasi Database

Karena Supabase CLI belum dikonfigurasi, Anda perlu menjalankan migrasi secara manual melalui Supabase Dashboard:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Copy dan paste script SQL berikut:

```sql
-- Create device table with new schema as requested
CREATE TABLE IF NOT EXISTS public.device (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT gen_random_uuid(),
    device_name TEXT NULL,
    device_type TEXT NULL,
    device_id TEXT NULL,
    phone_number TEXT NULL,
    last_active TIMESTAMP WITHOUT TIME ZONE NULL,
    is_active BOOLEAN NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    api_key TEXT NULL,
    CONSTRAINT device_pkey PRIMARY KEY (id)

-- Enable RLS (Row Level Security)
ALTER TABLE public.device ENABLE ROW LEVEL SECURITY;

-- Create policies for device access
CREATE POLICY "Users can view their own devices" ON public.device
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own devices" ON public.device
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own devices" ON public.device
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own devices" ON public.device
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create indexes for faster queries
CREATE INDEX idx_device_user_id ON public.device(user_id);
CREATE INDEX idx_device_device_id ON public.device(device_id);
CREATE INDEX idx_device_last_active ON public.device(last_active);

-- Create user_device_limits table for managing device limits per user
CREATE TABLE IF NOT EXISTS public.user_device_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    max_devices INTEGER DEFAULT 5,
    plan_type VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS for user_device_limits
ALTER TABLE public.user_device_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_device_limits
CREATE POLICY "Users can view their own device limits" ON public.user_device_limits
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own device limits" ON public.user_device_limits
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own device limits" ON public.user_device_limits
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create index for user_device_limits
CREATE INDEX idx_user_device_limits_user_id ON public.user_device_limits(user_id);

-- Insert default device limits for existing users
INSERT INTO public.user_device_limits (user_id, max_devices, plan_type)
SELECT id, 5, 'free'
FROM auth.users
WHERE id::text NOT IN (SELECT user_id::text FROM public.user_device_limits)
ON CONFLICT (user_id) DO NOTHING;
```

5. Klik **Run** untuk menjalankan script

### 2. Fitur Device Management

Setelah migrasi berhasil, fitur device management akan tersedia dengan:

#### Fitur Utama:
- **Real-time Device Management**: Device tracking secara real-time berdasarkan user_id
- **Automatic Device Registration**: Device otomatis terdaftar saat user login
- **Smart Device Fingerprinting**: Menggunakan fingerprint yang stabil untuk identifikasi device
- **Device Limits with Auto-cleanup**: Membatasi jumlah device per user dengan cleanup otomatis
- **Heartbeat System**: Monitoring device aktif dengan heartbeat setiap 5 menit
- **Automatic Deactivation**: Device otomatis dinonaktifkan saat tab/browser ditutup
- **Periodic Cleanup**: Cleanup otomatis untuk device yang tidak aktif
- **Real-time Subscription**: Update real-time menggunakan Supabase realtime
- **Device Management Table**: Tabel untuk melihat dan mengelola device aktif
- **Device Actions**: Activate/deactivate dan remove device

#### Komponen yang Ditambahkan:
1. **useDevice Hook** (`hooks/use-device.ts`)
   - Real-time device management dengan Supabase subscription
   - Smart device fingerprinting untuk identifikasi yang stabil
   - Automatic cleanup untuk device lama dan tidak aktif
   - Heartbeat system untuk monitoring device aktif
   - Event listeners untuk page unload dan visibility change
   - Auto-register device saat login dengan device limit enforcement

2. **DeviceManagement Component** (`components/device-management.tsx`)
   - Dialog dengan tabel device management
   - Device statistics
   - Device actions (activate/deactivate/remove)

3. **DeviceUsageCard Component** (`components/device-usage-card.tsx`)
   - Komponen terpisah untuk device usage display
   - Dynamic device count dan progress bar
   - Integration dengan device management dialog

4. **Updated AppSidebar** (`components/shadcn-blocks/sidebar-08/app-sidebar.tsx`)
   - Menggunakan DeviceUsageCard component
   - Struktur yang lebih modular dan terorganisir

5. **Device Deactivate API** (`app/api/device/deactivate/route.ts`)
   - API endpoint untuk menangani deactivation saat page unload
   - Mendukung sendBeacon untuk reliable delivery

#### Cara Menggunakan:
1. **Real-time Device Tracking**: Device otomatis terdaftar dan dimonitor secara real-time
2. **Melihat Device Usage**: Di sidebar, Anda akan melihat "X / Y Device left" dengan progress bar yang update real-time
3. **Manage Devices**: Klik tombol "Manage Devices" atau icon Settings untuk membuka dialog
4. **Device Table**: Lihat hanya device yang aktif dengan informasi real-time
5. **Device Actions**: 
   - **Activate/Deactivate**: Toggle status device
   - **Remove**: Hapus device dari akun
   - **Refresh**: Update data device terbaru
6. **Automatic Cleanup**: Device yang tidak aktif > 15 menit otomatis dinonaktifkan
7. **Smart Limits**: Saat mencapai batas device, device terlama otomatis dinonaktifkan

#### Database Schema:

**Table: device**
- `id`: UUID primary key
- `user_id`: UUID reference ke auth.users
- `device_name`: Nama device (nullable)
- `device_type`: Tipe device (mobile/desktop/tablet, nullable)
- `device_id`: Unique identifier berdasarkan device fingerprint (nullable)
- `phone_number`: Nomor telepon device (nullable)
- `last_active`: Timestamp terakhir aktif (nullable)
- `is_active`: Status aktif device (nullable)
- `created_at`: Timestamp dibuat (nullable)
- `updated_at`: Timestamp diupdate (nullable)
- `api_key`: API key untuk device (nullable)

**Table: user_device_limits**
- `id`: UUID primary key
- `user_id`: Reference ke auth.users
- `max_devices`: Batas maksimal device
- `plan_type`: Tipe plan (free/pro/enterprise)

### 3. Testing

Setelah setup selesai:
1. Login ke aplikasi
2. Device akan otomatis terdaftar
3. Cek sidebar untuk melihat device usage
4. Klik "Manage Devices" untuk membuka device management table
5. Test activate/deactivate dan remove device

### 4. Real-time Features

#### Automatic Device Management:
- **Device Registration**: Otomatis saat login dengan fingerprint yang stabil
- **Heartbeat Monitoring**: Update setiap 5 menit untuk device aktif
- **Cleanup Schedule**: 
  - Inactive setelah 15 menit tidak ada heartbeat
  - Dihapus setelah 7 hari tidak aktif
  - Cleanup device lama (>30 hari) saat registrasi baru

#### Real-time Updates:
- **Supabase Subscription**: Mendengarkan perubahan database secara real-time
- **Visibility API**: Update heartbeat saat tab menjadi visible
- **Page Unload**: Deactivate device saat browser/tab ditutup
- **Device Limit Enforcement**: Otomatis deactivate device terlama saat mencapai limit

### 5. Troubleshooting

**Error: "Cannot find project ref"**
- Jalankan migrasi manual melalui Supabase Dashboard

**Error: "RLS Policy"**
- Pastikan user sudah login sebelum mengakses device management

**Device terus bertambah/duplikasi**
- ✅ **FIXED**: Menggunakan stable fingerprinting dan cleanup otomatis
- Device yang sama tidak akan terdaftar ulang
- Cleanup otomatis menghapus device lama

- Pastikan tabel user_device_limits sudah dibuat
- Check apakah ada data di tabel untuk user yang login
- Device terlama akan otomatis dinonaktifkan saat mencapai limit