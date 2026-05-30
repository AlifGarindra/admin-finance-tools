# SCOPE.md — Project Scope & Milestones
# HR Admin Tool

---

## MVP Scope

Fitur minimum yang harus ada agar adik bisa langsung pakai dan berhenti pakai Excel:

1. ✅ Login admin (email + password)
2. ✅ CRUD karyawan + setting tarif uang makan per orang
3. ✅ Input absensi harian (jam in, jam out, status)
4. ✅ Auto-highlight terlambat
5. ✅ Rekap bulanan absensi (tabel)
6. ✅ Rekap uang makan bulanan (auto-kalkulasi)
7. ✅ Export rekap ke Excel (.xlsx)

---

## Phase Breakdown

### Phase 1 — MVP / Foundation
**Target: Ganti Excel, bisa dipakai adik besok**
**Estimasi: 2–3 minggu (solo developer, part-time)**

| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Project setup (Next.js, Supabase, Auth) | Wajib |
| 2 | Halaman login | Wajib |
| 3 | Manajemen karyawan (CRUD) | Wajib |
| 4 | Setting tarif uang makan per karyawan | Wajib |
| 5 | Setting jam masuk normal & toleransi | Wajib |
| 6 | Input absensi harian (form + tabel) | Wajib |
| 7 | Auto-detect terlambat + highlight | Wajib |
| 8 | Rekap bulanan absensi | Wajib |
| 9 | Rekap uang makan (auto-kalkulasi + potongan) | Wajib |
| 10 | Export Excel (.xlsx) | Wajib |
| 11 | Responsive mobile | Wajib |

---

### Phase 2 — Growth
**Target: Lebih nyaman, lebih informatif**
**Estimasi: 2–3 minggu tambahan**

| # | Fitur |
|---|-------|
| 1 | Dashboard summary (grafik kehadiran, total uang makan per bulan) |
| 2 | Export PDF |
| 3 | Riwayat perubahan / log aktivitas |
| 4 | Multi-user login (owner bisa lihat, tidak bisa edit) |
| 5 | Notifikasi/reminder input absensi (via browser notif) |
| 6 | Dark mode |

---

### Phase 3 — Scale
**Target: Siap dijual ke perusahaan lain / integrasi mesin absen**
**Estimasi: 1–2 bulan**

| # | Fitur |
|---|-------|
| 1 | Integrasi mesin absen ZKTeco/RF588 (sync otomatis) |
| 2 | Multi-tenant (banyak perusahaan dalam satu platform) |
| 3 | Approval workflow (izin butuh persetujuan) |
| 4 | Manajemen lembur |
| 5 | Laporan BPJS & pajak dasar |
| 6 | Mobile app (React Native / PWA enhanced) |

---

## Estimasi Waktu Detail (Phase 1)

```
Minggu 1:
  - Hari 1-2 : Setup project, Supabase, auth, struktur folder
  - Hari 3-4 : Database schema + Prisma migration
  - Hari 5-7 : Halaman login + manajemen karyawan (CRUD)

Minggu 2:
  - Hari 1-2 : Form input absensi harian
  - Hari 3-4 : Rekap absensi bulanan (tabel + filter bulan)
  - Hari 5-7 : Rekap uang makan + kalkulasi otomatis

Minggu 3:
  - Hari 1-2 : Export Excel
  - Hari 3-4 : Polish UI, responsive mobile
  - Hari 5-7 : Testing, bug fix, deploy ke Vercel
```

---

## Dependencies Antar Fitur

```
Login Auth
    └── Semua fitur lain (wajib selesai pertama)

Manajemen Karyawan
    └── Input Absensi
    └── Setting Tarif Uang Makan
        └── Rekap Uang Makan

Input Absensi Harian
    └── Rekap Absensi Bulanan
    └── Rekap Uang Makan
        └── Export Excel
```

---

## Risk Assessment

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Supabase free tier habis | Rendah | Sedang | Monitor usage, 500MB cukup untuk ratusan karyawan |
| Adik tidak adopsi tool | Sedang | Tinggi | UX simpel, mirip Excel, onboarding langsung bareng |
| Data hilang / corrupt | Rendah | Tinggi | Supabase auto-backup, export Excel rutin sebagai backup |
| Perubahan requirement tiba-tiba | Tinggi | Sedang | Bangun modular, mudah tambah fitur |
| Integrasi RF588 kompleks | Tinggi | Rendah | Sudah di-scope ke Phase 3, tidak blocker |
