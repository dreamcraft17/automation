# DocuFlow AI - Project Features

DocuFlow AI adalah platform **AI Document Operations** untuk membantu tim operasional mengelola dokumen dari proses upload sampai analisis dan tindak lanjut workflow.

## Tujuan Project

- Mempercepat proses review dokumen dengan bantuan AI.
- Memberikan dashboard internal bergaya enterprise.
- Menyediakan alur kerja dokumen yang terstruktur dan bisa ditindaklanjuti.

## Fitur Utama

### 1. Authentication & User Access

- Login / logout dengan Clerk.
- Proteksi halaman dashboard.
- User otomatis disinkronkan ke database.
- Data dokumen bersifat private per uploader (user hanya melihat dokumen miliknya).

### 2. Document Upload

- Upload file **PDF** dan **DOCX**.
- Penyimpanan file melalui UploadThing.
- Metadata dokumen tersimpan (judul, tipe file, uploader, status, waktu upload).
- Setelah upload selesai, user mendapat modal loading proses analisis.

### 3. AI Document Analysis

- Analisis dokumen otomatis setelah upload.
- Output analisis:
  - Summary
  - Key Insights
  - Document Category
  - Suggested Action
  - Confidence Score
- Integrasi menggunakan Gemini API (dengan fallback handling saat quota/rate limit).

### 4. Document Management

- Halaman daftar dokumen (table view).
- Search berdasarkan judul/kategori.
- Filter berdasarkan kategori dan status.
- Urut berdasarkan dokumen terbaru.
- Halaman detail dokumen berisi:
  - Document Info
  - AI Summary
  - Key Insights
  - Classification & Action
  - Timeline / Activity

### 5. Workflow & Activity

- Halaman workflows untuk melihat rule automation.
- Activity log/audit trail untuk event penting:
  - uploaded
  - processed
  - deleted
- Tombol hapus dokumen tersedia untuk owner dokumen.

### 6. Dashboard Analytics

- Total Documents
- Documents Processed
- Flagged Documents
- Documents by Category
- Recent Activity

## Status Flow Dokumen

Dokumen bergerak melalui status berikut:

`Uploaded -> Processing -> Analyzed -> (InReview/Flagged) -> Archived`

## Stack Teknologi

- **Frontend**: Next.js, TypeScript, Tailwind CSS, UI components style shadcn
- **Backend**: Next.js App Router (server routes)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Clerk
- **Storage**: UploadThing
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Catatan Implementasi

- Dokumen dan hasil analisis di-scope berdasarkan user yang upload (ownership-based access).
- Index database ditambahkan untuk performa query dokumen dan activity log.
- Build pipeline menjalankan `prisma generate` sebelum `next build`.

## Use Case Singkat

1. User login ke dashboard.
2. User upload dokumen.
3. Sistem menyimpan metadata dan memulai analisis AI.
4. User melihat progress loading sampai analisis selesai.
5. Hasil analisis tampil di halaman detail.
6. User dapat memonitor aktivitas dan mengelola dokumen (termasuk hapus dokumen miliknya).
