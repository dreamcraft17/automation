# DocuFlow AI — AI Document Operations Platform

DocuFlow AI adalah platform berbasis AI untuk membantu tim operasional memproses dokumen secara lebih cepat dan terstruktur: upload, ringkasan otomatis, klasifikasi, pencarian, dan workflow automation.

**Stack:** Next.js 16, TypeScript, Tailwind CSS, Prisma 7 (PostgreSQL), Clerk, UploadThing, Gemini API, shadcn-style UI.

---

## Setup

### 1. Environment

```bash
cp .env.example .env
```

Isi `.env`:

- **DATABASE_URL** — PostgreSQL. Bisa pakai **Railway** (tanpa Supabase), Supabase, atau Neon.  
  - **Railway:** buat project → New → Database → PostgreSQL → di tab Variables copy **Postgres Connection URL** (bentuk `postgresql://...`).  
  Contoh: `postgresql://user:pass@host:5432/db?sslmode=require`
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** & **CLERK_SECRET_KEY** — dari [Clerk Dashboard](https://dashboard.clerk.com)
- **UPLOADTHING_TOKEN** — dari [UploadThing](https://uploadthing.com) (API Keys → V7 Token)
- **GEMINI_API_KEY** — untuk ringkasan & klasifikasi (opsional; tanpa ini dipakai placeholder)

### 2. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed   # dummy documents & workflow rules
```

### 3. Run

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Sign up/sign in via Clerk, lalu akses Dashboard.

---

## Fitur

- **Auth & roles** — Clerk; role Admin / Analyst / Reviewer (simpan di DB)
- **Upload** — PDF & DOCX via UploadThing; metadata & status (Uploaded → Processing → Analyzed)
- **AI analysis** — ringkasan, key insights, kategori, suggested action (OpenAI; fallback placeholder)
- **Documents** — tabel dengan search (judul/kategori), filter kategori & status, sort terbaru
- **Document detail** — metadata, AI summary, key insights, classification, timeline/activity
- **Workflows** — daftar rules (trigger, condition, action)
- **Dashboard** — total docs, processed, flagged, by category, recent activity
- **Settings** — info user & role
- **Activity log** — uploaded, processed, dll.

---

## Scripts

| Script        | Deskripsi              |
|---------------|------------------------|
| `npm run dev` | Dev server             |
| `npm run build` | Production build     |
| `npm run start` | Jalankan production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema ke DB   |
| `npm run db:seed` | Seed data dummy    |
| `npm run db:studio` | Prisma Studio     |

---

## Deploy (Vercel)

1. Import repo, set env (DATABASE_URL, Clerk, UploadThing, OpenAI).
2. Deploy. Pastikan database sudah di-push (`db:push` atau migrations) dan seed jika perlu.

---

*AI-powered document operations platform for automating document review, classification, search, and workflow routing in enterprise teams.*
