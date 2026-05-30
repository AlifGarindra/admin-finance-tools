# PRD.md — Product Requirements Document
# HR Admin Tool — Rekap Absensi & Uang Makan

> **Asumsi yang dibuat:**
> - Jumlah karyawan: ~10–20 orang (skala UKM/kantor kecil)
> - Admin hanya 1 orang (adik pengguna) yang input data harian
> - Tidak ada integrasi mesin absen di Phase 1 (manual input dulu)
> - Tidak ada multi-tenant/multi-perusahaan di Phase 1
> - Tidak ada kebutuhan payroll penuh, hanya rekap uang makan

---

## Overview

HR Admin Tool adalah web app ringan yang membantu admin/finance perusahaan kecil mengelola absensi harian karyawan dan rekap tunjangan uang makan secara otomatis — menggantikan spreadsheet Excel yang rawan error dan memakan waktu.

---

## Problem Statement

Admin HR di perusahaan kecil menghabiskan waktu berjam-jam setiap bulan untuk:
- Input manual jam masuk/keluar karyawan ke Excel
- Menghitung total uang makan per karyawan dengan mempertimbangkan izin/potongan
- Membuat rekap bulanan yang harus diformat ulang setiap bulan
- Mengecek mesin absen secara fisik satu per satu untuk tahu siapa yang hadir

Akibatnya: data sering salah, rekap terlambat, dan admin kelelahan dengan pekerjaan repetitif.

---

## Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Kurangi waktu rekap bulanan | Waktu buat rekap | < 30 menit (dari ~3-4 jam) |
| Eliminasi error kalkulasi | Error rate rekap uang makan | 0% |
| Adopsi tool oleh admin | Penggunaan harian | Input absensi setiap hari kerja |
| Akses fleksibel | Device yang dipakai | Bisa di laptop & HP |

---

## Target Users / Persona

### Primary: Admin & Finance (Adik)
- Wanita, ~20–30 tahun
- Bekerja di kantor, punya laptop dan HP
- Familiar dengan Excel tapi bukan programmer
- Butuh tool yang **simpel, cepat, dan tidak perlu training lama**
- Pain point utama: input manual berulang dan kalkulasi error

### Secondary: Owner/Manager
- Sesekali melihat rekap, tidak input data
- Butuh laporan yang bisa diexport

---

## User Stories

1. Sebagai admin, saya ingin input jam masuk & keluar karyawan per hari, agar data absensi tercatat dengan cepat tanpa buka Excel.
2. Sebagai admin, saya ingin menandai status karyawan (Hadir, Izin, Sakit, WFH, Cuti), agar rekap uang makan otomatis terhitung sesuai kehadiran.
3. Sebagai admin, saya ingin melihat rekap bulanan absensi semua karyawan dalam satu tabel, agar saya bisa langsung export tanpa rekap ulang.
4. Sebagai admin, saya ingin rekap uang makan per karyawan dihitung otomatis, agar saya tidak perlu kalkulasi manual lagi.
5. Sebagai admin, saya ingin mengatur tarif uang makan per karyawan, agar nominal yang berbeda antar karyawan bisa ditangani.
6. Sebagai admin, saya ingin export rekap ke Excel/PDF, agar bisa dikirim ke owner atau disimpan sebagai arsip.
7. Sebagai admin, saya ingin tambah/edit/nonaktifkan data karyawan, agar data selalu up-to-date tanpa perlu hapus history lama.
8. Sebagai admin, saya ingin highlight otomatis karyawan yang terlambat, agar saya bisa identifikasi tanpa cek satu-satu.
9. Sebagai admin, saya ingin set status WFH untuk semua karyawan sekaligus dalam satu klik, agar tidak perlu input satu-satu saat seluruh tim WFH.
10. Sebagai admin, saya ingin set status WFH hanya untuk karyawan tertentu (sebagian), agar bisa handle situasi di mana sebagian masuk kantor dan sebagian WFH di hari yang sama.
11. Sebagai admin, saya ingin karyawan WFH tidak perlu input jam in/out, agar proses input lebih cepat dan tidak ada data kosong yang membingungkan.

---

## Functional Requirements

### Must-Have (MVP)
- [ ] Manajemen karyawan (tambah, edit, nonaktifkan)
- [ ] Input absensi harian: jam in, jam out, status
- [ ] Status kehadiran: Hadir, Izin, Sakit, WFH, Cuti, Dinas Luar
- [ ] **WFH Bulk Set — set WFH untuk semua karyawan sekaligus (1 klik)**
- [ ] **WFH Partial Set — pilih karyawan tertentu lalu set WFH bersama**
- [ ] **WFH tidak wajib input jam in/out** (field jam otomatis disabled saat status WFH)
- [ ] Setting tarif uang makan per karyawan
- [ ] Setting jam toleransi keterlambatan
- [ ] Auto-highlight terlambat
- [ ] Rekap bulanan absensi (tabel per bulan)
- [ ] Rekap uang makan bulanan (total + potongan)
- [ ] Export rekap ke Excel (.xlsx)

### Nice-to-Have (Phase 2)
- [ ] Export ke PDF
- [ ] Notifikasi/reminder input absensi
- [ ] Dashboard summary (grafik kehadiran, total uang makan)
- [ ] Log aktivitas admin
- [ ] Integrasi mesin absen ZKTeco/RF588
- [ ] Multi-user login (admin + owner view)

---

## Non-Functional Requirements

| Aspek | Requirement |
|-------|-------------|
| **Performa** | Load halaman < 2 detik, input absensi responsif |
| **Responsif** | Berfungsi baik di mobile (min 375px) dan desktop |
| **Keamanan** | Login dengan password, data tidak bisa diakses tanpa auth |
| **Reliabilitas** | Data tidak hilang, ada backup/persistent storage |
| **Usability** | Admin bisa pakai tanpa training, UI intuitif |
| **Browser** | Support Chrome, Safari, Firefox versi terbaru |

---

## Out of Scope (Phase 1)

- Payroll / penggajian penuh
- Integrasi mesin absen RF588
- Multi-perusahaan / multi-tenant
- Approval workflow (izin disetujui manager)
- Manajemen lembur
- Mobile app native (iOS/Android)
- Laporan pajak / BPJS

---

## Assumptions & Constraints

- Admin adalah satu-satunya user yang input data (single user phase 1)
- Koneksi internet tersedia saat input (online-first)
- Data karyawan maksimal ~50 orang untuk fase awal
- Hari kerja: Senin–Jumat (Sabtu/Minggu otomatis libur, bisa dikonfigurasi)
- Jam masuk normal dapat dikonfigurasi per perusahaan
- Uang makan tidak diberikan jika status Izin/Sakit (konfigurasi default, bisa diubah)
- **WFH tidak memerlukan input jam in/out — status WFH saja sudah cukup**
- **WFH bisa berlaku untuk semua karyawan atau hanya sebagian di hari yang sama**
- Saat WFH bulk set dilakukan, data karyawan yang sudah diinput hari itu tidak ikut tertimpa (hanya yang belum ada data)

---

## Monetization Strategy

Phase 1: **Gratis sepenuhnya** (untuk penggunaan adik/internal)

Potensi ke depan jika dijual ke perusahaan lain:
- **One-time purchase**: bayar sekali, self-hosted
- **SaaS Freemium**: gratis s/d 10 karyawan, berbayar untuk lebih
- Estimasi harga: Rp 150.000–300.000/bulan untuk 10–50 karyawan
