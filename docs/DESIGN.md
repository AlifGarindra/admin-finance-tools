# DESIGN.md — Panduan Desain UI/UX
# HR Admin Tool

---

## Brand & Visual Identity

### Nama & Tone
- **Nama App**: HR Admin Tool (atau bisa diganti nama internal perusahaan)
- **Tone**: Profesional tapi hangat, efisien, tidak intimidating untuk non-tech user
- **Feel**: Seperti Excel yang lebih cantik dan tidak bisa salah

### Color Palette

| Token | Nama | Hex | Penggunaan |
|-------|------|-----|------------|
| `--color-primary` | Biru Indigo | `#4F46E5` | CTA button, link aktif, header |
| `--color-primary-light` | Indigo Muda | `#EEF2FF` | Background highlight, badge |
| `--color-secondary` | Slate | `#475569` | Text sekunder, label |
| `--color-accent` | Emerald | `#10B981` | Success state, hadir, badge positif |
| `--color-warning` | Amber | `#F59E0B` | Terlambat, perhatian |
| `--color-danger` | Red | `#EF4444` | Error, alpha, hapus |
| `--color-neutral-50` | Background | `#F8FAFC` | Background halaman |
| `--color-neutral-100` | Card bg | `#F1F5F9` | Background card, row alternating |
| `--color-neutral-200` | Border | `#E2E8F0` | Border, divider, tabel border |
| `--color-neutral-600` | Text body | `#475569` | Teks biasa |
| `--color-neutral-900` | Text heading | `#0F172A` | Judul, heading |
| `--color-white` | Putih | `#FFFFFF` | Card, modal, input background |

### Status Colors (Attendance)
```
Hadir       : #22c55e (green-500)
Terlambat   : #f97316 (orange-500)
WFH         : #3b82f6 (blue-500)
Izin        : #a855f7 (purple-500)
Sakit       : #ef4444 (red-500)
Cuti        : #06b6d4 (cyan-500)
Dinas Luar  : #eab308 (yellow-500)
Sidang      : #8b5cf6 (violet-500)
Pendampingan: #0ea5e9 (sky-500)
Alpha       : #dc2626 (red-600) + bold
```

### Typography

**Font**: Inter (Google Fonts) — clean, mudah dibaca di layar kecil

| Token | Size | Weight | Line Height | Penggunaan |
|-------|------|--------|-------------|------------|
| `text-xs` | 12px | 400 | 1.5 | Badge, label kecil |
| `text-sm` | 14px | 400 | 1.5 | Body text, tabel cell |
| `text-base` | 16px | 400 | 1.6 | Input, deskripsi |
| `text-lg` | 18px | 500 | 1.4 | Subheading, card title |
| `text-xl` | 20px | 600 | 1.3 | Section heading |
| `text-2xl` | 24px | 700 | 1.2 | Page title |
| `text-3xl` | 30px | 700 | 1.1 | Summary number besar |

### Spacing Scale (Tailwind default)
```
4px (1) → 8px (2) → 12px (3) → 16px (4) → 24px (6) → 32px (8) → 48px (12) → 64px (16)
```

### Border & Shadow
```
Border radius:
  - Input, Badge : rounded-md (6px)
  - Card         : rounded-xl (12px)
  - Modal        : rounded-2xl (16px)
  - Button       : rounded-lg (8px)

Shadow:
  - Card         : shadow-sm (0 1px 2px rgba(0,0,0,0.05))
  - Modal        : shadow-xl
  - Dropdown     : shadow-lg
```

---

## Component Guidelines

### Komponen UI Utama yang Dibutuhkan

1. **AttendanceTable** — Tabel rekap utama, sticky header, horizontal scroll di mobile
2. **StatusBadge** — Badge berwarna untuk setiap status (Hadir, Izin, dll)
3. **AttendanceInputRow** — Row inline edit untuk input jam in/out + status
4. **MonthPicker** — Selector bulan/tahun untuk filter rekap
5. **EmployeeCard** — Card karyawan di halaman manajemen
6. **MealAllowanceSummary** — Card summary uang makan per karyawan
7. **ExportButton** — Button dengan loading state + dropdown (Excel/PDF)
8. **TimeInput** — Input jam dengan format HH:mm, validasi otomatis
9. **ConfirmDialog** — Modal konfirmasi untuk aksi hapus/nonaktifkan
10. **EmptyState** — Ilustrasi + teks saat belum ada data

### State Specifications

**Button Primary**
```
default  : bg-indigo-600 text-white
hover    : bg-indigo-700
active   : bg-indigo-800 scale-95
disabled : bg-indigo-300 cursor-not-allowed
loading  : bg-indigo-600 + spinner icon
```

**Input Field**
```
default  : border-slate-200 bg-white
focus    : border-indigo-500 ring-2 ring-indigo-100
error    : border-red-400 bg-red-50
disabled : bg-slate-100 text-slate-400
```

**Table Row**
```
default  : bg-white
hover    : bg-slate-50
selected : bg-indigo-50
weekend  : bg-slate-50/50
holiday  : bg-amber-50
```

### Pola Interaksi Konsisten

- **Form validation**: Real-time, tampil di bawah field (bukan alert popup)
- **Loading state**: Skeleton loader untuk tabel, spinner untuk button
- **Empty state**: Ilustrasi + pesan ramah + tombol aksi utama
- **Error state**: Toast notification pojok kanan bawah, warna merah, auto-dismiss 5 detik
- **Success state**: Toast notification hijau, auto-dismiss 3 detik
- **Konfirmasi hapus**: Modal dialog, bukan browser confirm()

---

## Layout & Navigation

### Struktur Navigasi

**Desktop**: Sidebar kiri (240px) + konten kanan
**Mobile**: Bottom navigation bar (4 item)

```
Sidebar / Bottom Nav:
  🏠 Dashboard
  📋 Absensi
  🍱 Uang Makan
  👥 Karyawan
  ⚙️  Pengaturan (desktop only: di bawah sidebar)
```

### Layout Per Halaman

**Dashboard**
- Summary cards: Total hadir hari ini, Total karyawan aktif, Rekap uang makan bulan ini
- Tabel absensi hari ini (ringkasan)
- Shortcut tombol: "Input Absensi Hari Ini"

**Absensi (Halaman Utama)**
- Filter: Month picker + tombol export
- **Action bar di atas tabel** (muncul saat tanggal = hari ini atau tanggal dipilih):
  - Tombol `🏠 Set WFH Semua` → 1 klik, konfirmasi → semua karyawan yang belum ada data hari itu langsung jadi WFH
  - Tombol `☑ Set WFH Sebagian` → masuk ke "mode pilih": checkbox muncul di tiap baris karyawan → pilih yang WFH → klik "Terapkan WFH" → selesai
- Tabel: kolom = DATE, per karyawan (nama di header), cell = jam in/jam out + status badge
- Cell WFH: tampil badge biru "WFH" tanpa jam in/out (field jam otomatis kosong & disabled)
- Klik cell non-WFH → modal input (jam in, jam out, status)
- Klik cell WFH → modal dengan opsi ganti status saja (tanpa field jam)

**WFH Bulk Set — Detail Flow**
```
[Set WFH Semua]
  → Konfirmasi dialog: "Set WFH untuk semua X karyawan pada [tanggal]?
     Karyawan yang sudah ada data tidak akan tertimpa."
  → Klik "Ya, Set WFH" → API bulk create/skip → toast sukses → tabel refresh

[Set WFH Sebagian]
  → Mode pilih aktif: checkbox muncul di nama karyawan di header tabel kolom
  → Admin centang karyawan yang WFH
  → Floating action bar muncul di bawah: "3 karyawan dipilih → [Terapkan WFH] [Batal]"
  → Klik Terapkan → API bulk create → toast sukses → mode pilih nonaktif
```

**Uang Makan**
- Filter: Month picker
- Tabel per karyawan: Nama | Tarif/hari | Hari Hadir | Potongan | Total
- Total keseluruhan di bagian bawah (sticky footer tabel)
- Tombol export Excel

**Karyawan**
- Grid card karyawan: foto/avatar + nama + jabatan + tarif makan + status aktif
- Tombol + Tambah Karyawan
- Klik card → drawer/modal detail + edit

**Pengaturan**
- Jam masuk normal + toleransi
- Hari kerja (checkbox hari)
- Aturan potongan uang makan per status

### Breakpoints Responsif

```
Mobile  : < 768px  → Bottom nav, tabel scroll horizontal, card stack
Tablet  : 768–1024px → Sidebar collapsed (icon only), tabel dengan scroll
Desktop : > 1024px → Sidebar full (240px), tabel full visible
```

---

## UX Principles

1. **Zero training required**: Admin bisa pakai tanpa baca manual
2. **Input cepat**: Input absensi satu baris harus < 10 detik
3. **Data selalu aman**: Tidak ada aksi destruktif tanpa konfirmasi
4. **Mobile-first thinking**: Semua fitur utama harus bisa diakses di HP
5. **Excel-familiar**: Layout tabel mirip Excel agar tidak ada learning curve

### Micro-interactions

- Row hover: subtle highlight + tampilkan tombol edit inline
- Status badge: hover tooltip dengan deskripsi status
- Export button: loading animation + "Mengunduh..." text
- Check-in time: auto-format "0800" → "08:00" saat user ketik
- Month navigation: swipe gesture di mobile untuk ganti bulan

### Accessibility (Target: WCAG 2.1 AA)

- Contrast ratio minimum 4.5:1 untuk semua teks
- Focus visible pada semua interactive element
- Semua status badge tidak hanya mengandalkan warna (tambah text/icon)
- Form error tidak hanya merah, ada teks pesan jelas
- Keyboard navigable untuk semua aksi utama

---

## Screen Inventory

| # | Screen | Prioritas | Catatan |
|---|--------|-----------|---------|
| 1 | Login | P0 | Simple, email + password |
| 2 | Dashboard | P0 | Summary + absensi hari ini |
| 3 | Absensi — Tabel Bulanan | P0 | Halaman terpenting |
| 4 | Absensi — Input/Edit | P0 | Modal atau inline |
| 5 | Uang Makan — Rekap Bulanan | P0 | Tabel + total |
| 6 | Karyawan — Daftar | P1 | Grid card |
| 7 | Karyawan — Form Tambah/Edit | P1 | Drawer/modal |
| 8 | Pengaturan | P1 | Form setting perusahaan |
| 9 | Export Preview | P2 | Optional, langsung download saja |
| 10 | 404 / Error Page | P2 | Simple error state |
