# TECH_STACK.md — Rekomendasi Teknologi
# HR Admin Tool

---

## Frontend

### Framework: **Next.js 14 (App Router)**
- **Alasan**: Full-stack dalam satu repo, file-based routing, SSR/SSG fleksibel, deploy gratis di Vercel
- React sebagai UI library — kamu sudah familiar sebagai frontend dev
- Built-in API Routes menggantikan backend terpisah untuk scale kecil

### UI Library: **Tailwind CSS + shadcn/ui**
- Tailwind: utility-first, cepat develop, tidak ada CSS conflict
- shadcn/ui: komponen siap pakai (Table, Dialog, Form, DatePicker) — tidak perlu build dari nol
- **Alternatif**: Chakra UI atau MUI jika lebih familiar

### State Management: **Zustand**
- Ringan, tidak boilerplate seperti Redux
- Cocok untuk state global (user session, filter bulan aktif)

### Form & Validasi: **React Hook Form + Zod**
- RHF: performa terbaik untuk form kompleks
- Zod: type-safe validation, bisa share schema antara frontend & backend

### Tabel & Export: **TanStack Table + xlsx**
- TanStack Table: powerful untuk rekap tabel dengan sorting/filter
- xlsx (SheetJS): export langsung ke .xlsx dari browser

---

## Backend

### Runtime: **Next.js API Routes / Route Handlers**
- Tidak perlu server terpisah untuk Phase 1
- Cukup untuk ~50 karyawan, request volume rendah

### ORM: **Prisma**
- Type-safe, auto-generate types dari schema
- Migration mudah
- Cocok dengan Supabase PostgreSQL

### Arsitektur: **REST** (via Next.js Route Handlers)
- Simple, mudah di-debug
- Alternatif: tRPC jika mau end-to-end type safety lebih ketat

---

## Database

### **Supabase (PostgreSQL)**
- **Alasan**: Free tier generous (500MB, unlimited API calls), hosted PostgreSQL, built-in auth, realtime (untuk nanti), dashboard visual
- Prisma connects langsung ke Supabase PostgreSQL
- **Alternatif**: PlanetScale (MySQL) atau Railway PostgreSQL

---

## Authentication

### **Supabase Auth**
- Built-in dengan Supabase, gratis
- Email + password untuk admin login
- Session management otomatis
- **Alternatif**: NextAuth.js jika ingin lebih custom

---

## Storage

### **Supabase Storage** (jika nanti butuh upload foto karyawan)
- Free tier: 1GB
- Untuk Phase 1 belum diperlukan

---

## Hosting & Infrastructure

### **Vercel** (Frontend + API)
- Free tier: unlimited personal projects, 100GB bandwidth
- Auto-deploy dari GitHub
- Edge functions support

### **Supabase** (Database + Auth)
- Free tier: 2 projects, 500MB DB, 50MB file storage

**Total biaya Phase 1: Rp 0**

---

## Third-party Services

| Service | Kegunaan | Tier |
|---------|----------|------|
| Supabase | DB + Auth | Free |
| Vercel | Hosting | Free |
| SheetJS (xlsx) | Export Excel | Open source |

---

## Development Tools

```
- TypeScript         : type safety, wajib
- ESLint             : linting (Next.js built-in config)
- Prettier           : formatting
- Husky + lint-staged: pre-commit hook
- VS Code            : editor (recommended extensions: Prisma, Tailwind CSS IntelliSense)
```

---

## Monitoring & Logging

### Phase 1 (Gratis)
- **Vercel Analytics**: basic page views, gratis
- **Supabase Dashboard**: query logs, DB monitoring
- `console.error` + Vercel log drain untuk error tracking

### Phase 2 (Jika scale)
- Sentry (free tier: 5K errors/bulan) untuk error tracking
- Axiom atau Logtail untuk structured logging

---

## Alternatif Stack (jika ingin lebih simpel)

Jika tidak mau Next.js dan prefer SPA murni:
```
Frontend : React + Vite
Backend  : Express.js / Hono (Node.js)
Database : Supabase
Hosting  : Netlify (frontend) + Railway (backend)
```
Trade-off: 2 repo, deployment lebih kompleks, tapi lebih familiar jika sudah pakai Express.
