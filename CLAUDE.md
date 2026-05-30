# CLAUDE.md — Instruksi Pengembangan untuk AI Developer
# HR Admin Tool

---

## Project Overview

Web app untuk admin HR perusahaan kecil mengelola absensi harian dan tunjangan uang makan karyawan. Menggantikan spreadsheet Excel manual. Single-user (1 admin), ~10–20 karyawan.

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js Route Handlers (API)
- **Database**: Supabase (PostgreSQL) via Supabase JS client
- **Auth**: Supabase Auth (email + password)
- **Export**: SheetJS (xlsx)
- **Hosting**: Vercel (frontend) + Supabase (DB)

### Struktur Folder

```
hr-admin-tool/
├── .env.example
├── .env.local
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── supabase/
│   ├── schema.sql              ← DDL — jalankan di Supabase SQL Editor
│   └── seed.sql                ← Data awal employees + settings
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          ← Sidebar + nav layout
│   │   │   ├── page.tsx            ← Dashboard
│   │   │   ├── absensi/
│   │   │   │   └── page.tsx
│   │   │   ├── uang-makan/
│   │   │   │   └── page.tsx
│   │   │   ├── karyawan/
│   │   │   │   └── page.tsx
│   │   │   └── pengaturan/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── employees/
│   │       │   ├── route.ts        ← GET list, POST create
│   │       │   └── [id]/
│   │       │       └── route.ts    ← GET, PUT, DELETE
│   │       ├── attendance/
│   │       │   ├── route.ts        ← GET list (filter bulan), POST create
│   │       │   ├── wfh-all/
│   │       │   │   └── route.ts    ← POST set WFH semua karyawan
│   │       │   ├── wfh-partial/
│   │       │   │   └── route.ts    ← POST set WFH karyawan terpilih
│   │       │   └── [id]/
│   │       │       └── route.ts    ← PUT, DELETE
│   │       ├── meal-allowance/
│   │       │   └── route.ts        ← GET rekap (kalkulasi)
│   │       └── export/
│   │           └── route.ts        ← POST generate Excel
│   ├── components/
│   │   ├── ui/                     ← shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── attendance/
│   │   │   ├── AttendanceTable.tsx
│   │   │   ├── AttendanceInputModal.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── meal-allowance/
│   │   │   └── MealAllowanceTable.tsx
│   │   ├── employee/
│   │   │   ├── EmployeeCard.tsx
│   │   │   └── EmployeeForm.tsx
│   │   └── shared/
│   │       ├── MonthPicker.tsx
│   │       ├── ExportButton.tsx
│   │       ├── TimeInput.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── supabase.ts             ← Supabase client (browser + server)
│   │   ├── db.ts                   ← Row mappers: snake_case DB → camelCase TS
│   │   ├── utils.ts                ← cn(), formatRupiah(), formatTime()
│   │   ├── attendance-utils.ts     ← isLate(), getMealAllowance()
│   │   └── export-utils.ts         ← generateExcel()
│   ├── hooks/
│   │   ├── useAttendance.ts
│   │   ├── useEmployees.ts
│   │   └── useMealAllowance.ts
│   ├── stores/
│   │   └── appStore.ts             ← Zustand: active month, user session
│   └── types/
│       └── index.ts                ← Global TypeScript types
└── data/                           ← Static seed data
    ├── employees.json
    ├── attendance_statuses.json
    ├── config.json
    └── error_messages.json
```

---

## Development Rules — WAJIB DIIKUTI

### 1. Environment Variables

Buat `.env.local` dengan variables berikut. JANGAN commit file ini.

```env
# .env.local (JANGAN COMMIT)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
NEXTAUTH_URL="http://localhost:3000"
```

```env
# .env.example (COMMIT ini)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
NEXTAUTH_URL="http://localhost:3000"
```

### 2. .gitignore Wajib

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Environment
.env
.env.local
.env.development.local
.env.staging
.env.production

# Build output
.next/
out/
dist/
build/

# Cache
.cache/
*.cache
.turbo/

# IDE
.vscode/settings.json
.idea/
*.suo
*.swp

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/
npm-debug.log*

# Coverage
coverage/
.nyc_output/

# Secrets
*.pem
*.key
*.p12
*.pfx

# Temp
*.tmp
*.temp
```

### 3. Code Quality

- Selalu gunakan **TypeScript strict mode**
- Gunakan `zod` untuk validasi semua input API
- Komponen: functional components + hooks saja, no class components
- Naming: `camelCase` untuk variabel/fungsi, `PascalCase` untuk komponen/types, `SCREAMING_SNAKE` untuk konstanta
- Setiap API route handler wajib ada try-catch dan return error yang proper

---

## Step-by-Step Development Guide

### Step 0 — Project Setup

**Tujuan**: Repo siap, semua tool terkonfigurasi, bisa jalankan `npm run dev`

```bash
# Init project
npx create-next-app@latest hr-admin-tool \
  --typescript --tailwind --eslint --app \
  --src-dir --import-alias "@/*"

cd hr-admin-tool

# Install dependencies
npm install @supabase/supabase-js \
  zustand react-hook-form @hookform/resolvers zod \
  xlsx date-fns lucide-react

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input label card table dialog \
  badge select toast dropdown-menu
```

**File yang dibuat/dimodifikasi:**
- `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
- `.env.local`, `.env.example`, `.gitignore`
- `supabase/schema.sql`, `supabase/seed.sql`
- `src/lib/supabase.ts`, `src/lib/db.ts`, `src/lib/utils.ts`

**Checklist selesai:**
- [ ] `npm run dev` jalan tanpa error
- [ ] Supabase project dibuat dan URL/key tersedia
- [ ] `.gitignore` sudah include semua file sensitif
- [ ] shadcn/ui komponen bisa diimport

---

### Step 1 — Database Schema & Auth

**Tujuan**: Schema DB final, auth login bisa jalan

**Setup database (jalankan di Supabase Dashboard → SQL Editor):**

```sql
-- Lihat file supabase/schema.sql untuk DDL lengkap

CREATE TABLE employees (
  id                     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                   TEXT NOT NULL,
  position               TEXT,
  department             TEXT,
  join_date              DATE NOT NULL,
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  meal_allowance         INTEGER NOT NULL DEFAULT 40000,
  normal_check_in        TEXT NOT NULL DEFAULT '08:00',
  late_tolerance_minutes INTEGER NOT NULL DEFAULT 15,
  work_days              TEXT[] NOT NULL DEFAULT ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'],
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendances (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  check_in    TEXT,
  check_out   TEXT,
  status      TEXT NOT NULL,
  is_late     BOOLEAN NOT NULL DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE TABLE app_settings (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Setelah schema, jalankan `supabase/seed.sql` untuk data awal.

**Checklist selesai:**
- [ ] Tabel terbuat di Supabase
- [ ] Seed data employees berhasil masuk
- [ ] Login page render dengan benar
- [ ] Login dengan email/password berhasil (Supabase Auth)
- [ ] Redirect ke dashboard setelah login
- [ ] Middleware protect semua route kecuali /login

---

### Step 2 — Core Features

**Urutan pengerjaan (ikuti dependency):**

#### 2a. API Employees CRUD
```
GET    /api/employees          → list semua karyawan aktif
POST   /api/employees          → tambah karyawan baru
GET    /api/employees/[id]     → detail karyawan
PUT    /api/employees/[id]     → update karyawan
DELETE /api/employees/[id]     → nonaktifkan (soft delete)
```

#### 2b. Halaman Karyawan
- Grid card semua karyawan
- Modal/drawer form tambah & edit
- Konfirmasi nonaktifkan

#### 2c. API Attendance
```
GET    /api/attendance?month=2026-05           → list absensi bulan tertentu
POST   /api/attendance                          → input absensi 1 karyawan
PUT    /api/attendance/[id]                     → edit absensi
DELETE /api/attendance/[id]                     → hapus absensi

# WFH endpoints baru:
POST   /api/attendance/wfh-all                  → set WFH semua karyawan (bulk)
POST   /api/attendance/wfh-partial              → set WFH karyawan terpilih
```

**Logika WFH — field jam in/out:**
```typescript
// WFH tidak butuh checkIn & checkOut — validasi di backend:
const CreateAttendanceSchema = z.object({
  employeeId: z.string(),
  date: z.string(),
  status: z.enum(['HADIR','TERLAMBAT','WFH','IZIN','SAKIT','CUTI',
                  'DINAS_LUAR','SIDANG','PENDAMPINGAN','ALPHA']),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  const requiresTime = ['HADIR', 'TERLAMBAT'];
  if (requiresTime.includes(data.status) && !data.checkIn) return false;
  return true;
}, { message: "Jam masuk wajib diisi untuk status Hadir/Terlambat" });
```

**API: POST /api/attendance/wfh-all**
```typescript
// Request body: { date: "2026-05-23" }
// Logic: ambil semua karyawan aktif → filter yang belum ada absensi → insert WFH

const supabase = createServerClient();
const { data: employees } = await supabase.from('employees').select('id').eq('is_active', true);
const { data: existing } = await supabase.from('attendances').select('employee_id').eq('date', date);
const existingIds = new Set(existing.map(a => a.employee_id));

const toCreate = employees
  .filter(e => !existingIds.has(e.id))
  .map(e => ({ employee_id: e.id, date, status: 'WFH', is_late: false }));

await supabase.from('attendances').insert(toCreate);
return Response.json({ created: toCreate.length, skipped: existingIds.size });
```

**Logika isLate:**
```typescript
// src/lib/attendance-utils.ts
export function checkIsLate(checkInTime: string, normalCheckIn: string, toleranceMinutes: number): boolean {
  const [checkInH, checkInM] = checkInTime.split(':').map(Number);
  const [normalH, normalM] = normalCheckIn.split(':').map(Number);
  return (checkInH * 60 + checkInM) > (normalH * 60 + normalM + toleranceMinutes);
}

export function shouldCheckLate(status: AttendanceStatus): boolean {
  return ['HADIR', 'TERLAMBAT'].includes(status);
}
```

#### 2d. Tabel Absensi Bulanan
- Tabel: baris = tanggal, kolom = karyawan
- Setiap cell: jam in / jam out + StatusBadge
- Cell WFH: badge biru "WFH" tanpa jam
- Klik cell → modal edit; modal deteksi status → hide field jam jika WFH/IZIN/dll
- Highlight merah/orange untuk terlambat/alpha
- **Action bar di atas tabel:**
  - `[🏠 WFH Semua]` → trigger API wfh-all untuk tanggal yang dipilih
  - `[☑ WFH Sebagian]` → aktifkan mode pilih, checkbox di header kolom karyawan

**Component: AttendanceInputModal**
```typescript
const STATUS_REQUIRES_TIME = ['HADIR', 'TERLAMBAT'];
const showTimeFields = STATUS_REQUIRES_TIME.includes(selectedStatus);

{showTimeFields && (
  <div className="grid grid-cols-2 gap-3">
    <TimeInput label="Jam Masuk" name="checkIn" />
    <TimeInput label="Jam Keluar" name="checkOut" />
  </div>
)}
```

#### 2e. Rekap Uang Makan
```
GET /api/meal-allowance?month=2026-05
```

---

### Step 3 — UI Polish

- Responsive: pastikan semua halaman berfungsi di mobile (375px)
- Loading skeletons untuk semua tabel
- Empty states yang informatif
- Toast notifications untuk semua aksi
- MonthPicker component untuk filter

---

### Step 4 — Export Excel

```typescript
// src/lib/export-utils.ts
import * as XLSX from 'xlsx';

export function exportAttendanceToExcel(data: AttendanceRecap, month: string) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildAttendanceSheet(data)), 'Rekap Absensi');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildMealSheet(data)), 'Uang Makan');
  XLSX.writeFile(wb, `Rekap_HR_${month}.xlsx`);
}
```

---

### Step 5 — Testing & Deploy

```bash
# Deploy ke Vercel
npx vercel

# Set environment variables di Vercel dashboard
# atau via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

**Pre-deploy checklist:**
- [ ] Semua env vars tersetting di Vercel
- [ ] Build `npm run build` sukses tanpa error
- [ ] Test login di production
- [ ] Test input absensi & export
- [ ] Test di mobile browser

---

## API & Data Contracts

### Request/Response Types

```typescript
// src/types/index.ts

export type AttendanceStatus = 
  'HADIR' | 'TERLAMBAT' | 'WFH' | 'IZIN' | 'SAKIT' | 
  'CUTI' | 'DINAS_LUAR' | 'SIDANG' | 'PENDAMPINGAN' | 'ALPHA';

export interface Employee {
  id: string;
  name: string;
  position?: string;
  department?: string;
  joinDate: string;
  isActive: boolean;
  mealAllowance: number;
  normalCheckIn: string;
  lateToleranceMinutes: number;
  workDays: string[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string; // "YYYY-MM-DD"
  checkIn?: string; // "HH:mm"
  checkOut?: string; // "HH:mm"
  status: AttendanceStatus;
  isLate: boolean;
  notes?: string;
}

export interface MealAllowanceSummary {
  employee: Employee;
  workingDays: number;
  presentDays: number;
  deductionDays: number;
  totalAmount: number;
}

// POST /api/attendance - Request Body
export interface CreateAttendanceInput {
  employeeId: string;
  date: string;         // "YYYY-MM-DD"
  checkIn?: string;     // "HH:mm"
  checkOut?: string;    // "HH:mm"
  status: AttendanceStatus;
  notes?: string;
}
```

---

## Common Pitfalls

### ⚠️ Timezone
- Selalu gunakan `Asia/Jakarta` (WIB) saat format/parse tanggal
- Jangan pakai `new Date()` langsung untuk tanggal — pakai `date-fns` dengan timezone

```typescript
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const jakartaDate = toZonedTime(new Date(), 'Asia/Jakarta');
```

### ⚠️ camelCase vs snake_case
- Supabase DB columns: `snake_case` (e.g. `employee_id`, `check_in`, `is_late`, `join_date`)
- TypeScript types: `camelCase` (e.g. `employeeId`, `checkIn`, `isLate`, `joinDate`)
- Selalu pakai mapper dari `src/lib/db.ts` saat membaca data dari Supabase
- Selalu konversi ke snake_case saat menulis ke Supabase

```typescript
// src/lib/db.ts
export function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    joinDate: row.join_date,
    isActive: row.is_active,
    mealAllowance: row.meal_allowance,
    normalCheckIn: row.normal_check_in,
    lateToleranceMinutes: row.late_tolerance_minutes,
    workDays: row.work_days,
  };
}
```

### ⚠️ Supabase Service Role Key
- `SUPABASE_SERVICE_ROLE_KEY` dipakai di server (API routes) untuk bypass RLS
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk browser — hanya baca data publik + auth
- Jangan pernah expose `SUPABASE_SERVICE_ROLE_KEY` ke client

### ⚠️ Supabase join syntax
- Saat SELECT dengan join: `supabase.from('attendances').select('*, employees(*)')`
- Hasil nested object di bawah key nama tabel: `row.employees.normal_check_in`

### ⚠️ Security Minimum
- [ ] Semua API route cek auth token sebelum proses
- [ ] Validasi semua input dengan Zod sebelum masuk DB
- [ ] Query Supabase sudah parameterized secara otomatis
- [ ] Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke client

### ⚠️ Mobile Table
- Tabel absensi bulanan sangat lebar — wajib `overflow-x-auto` + sticky first column (kolom tanggal)
- Test di iPhone SE (375px) dan Samsung Galaxy A series
