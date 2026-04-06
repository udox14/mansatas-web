# MAN 1 Tasikmalaya — Website + CMS

Website company profile & CMS untuk Madrasah Aliyah Negeri 1 Tasikmalaya.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16 (static export), Tailwind CSS v4, Framer Motion |
| Backend | Hono.js di Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Storage | Cloudflare R2 (gambar) |
| Auth | Custom JWT (PBKDF2 + jose) |
| Editor | TipTap (rich text + table) |

## Struktur Monorepo

```
man1tasik/
├── apps/
│   ├── web/              ← Next.js 16 frontend
│   │   ├── app/          ← Pages (public + admin)
│   │   ├── components/   ← UI components
│   │   ├── hooks/        ← Custom hooks
│   │   ├── lib/          ← API client, utilities
│   │   └── types/        ← TypeScript types
│   └── worker/           ← Hono.js backend
│       ├── src/
│       │   ├── db/       ← Drizzle schema
│       │   ├── routes/   ← API endpoints
│       │   ├── middleware/← Auth, rate limit
│       │   └── lib/      ← JWT, password helpers
│       └── migrations/   ← D1 SQL migrations
└── package.json          ← npm workspaces
```

---

## SETUP (Development)

### Prasyarat

- Node.js 18+
- npm 9+
- Wrangler CLI: `npm i -g wrangler`
- Login Cloudflare: `wrangler login`

### 1. Clone & Install

```powershell
cd C:\DATA
# Extract ZIP ke folder man1tasik, lalu:
cd man1tasik
npm install
```

### 2. Buat D1 Database

```powershell
cd apps/worker
npx wrangler d1 create man1tasik
```

Output:
```
✅ Successfully created DB 'man1tasik'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy `database_id` ke `apps/worker/wrangler.toml`:**

```toml
[[d1_databases]]
binding = "DB"
database_name = "man1tasik"
database_id = "PASTE_ID_DI_SINI"
```

### 3. Jalankan Migration

```powershell
# Dari root project
npm run db:migrate:local
```

### 4. Seed Data Awal

```powershell
cd apps/worker
npx wrangler d1 execute man1tasik --local --file=migrations/seed.sql
```

### 5. Buat R2 Bucket

```powershell
npx wrangler r2 bucket create man1tasik-assets
```

### 6. Setup Environment

```powershell
# apps/web/.env.local
cp apps/web/.env.local.example apps/web/.env.local
```

Isi:
```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### 7. Jalankan Development

Buka **2 terminal** terpisah:

```powershell
# Terminal 1 — Backend (port 8787)
npm run dev:worker

# Terminal 2 — Frontend (port 3000)
npm run dev:web
```

### 8. Buat Superadmin

```powershell
curl -X POST http://localhost:8787/api/auth/setup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"email\":\"admin@man1tasik.sch.id\",\"password\":\"admin123456\"}"
```

Akses admin panel: `http://localhost:3000/admin/login`

---

## DEPLOYMENT KE CLOUDFLARE

### A. Deploy Worker (Backend API)

#### 1. Set environment variables production

Edit `wrangler.toml` — ganti JWT_SECRET dan CORS_ORIGIN:

```toml
[vars]
JWT_SECRET = "GANTI_DENGAN_STRING_RANDOM_32_KARAKTER"
CORS_ORIGIN = "https://man1tasik.sch.id"
```

**Generate random secret:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Migrate database production

```powershell
npm run db:migrate:prod
```

#### 3. Seed production

```powershell
cd apps/worker
npx wrangler d1 execute man1tasik --remote --file=migrations/seed.sql
```

#### 4. Deploy worker

```powershell
npm run deploy:worker
```

Output: `https://man1tasik-api.<subdomain>.workers.dev`

**Catat URL ini** — akan dipakai di frontend.

### B. Deploy Frontend (Cloudflare Pages)

#### 1. Update API URL

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://man1tasik-api.<subdomain>.workers.dev
```

#### 2. Build

```powershell
npm run build:web
```

Output ada di `apps/web/out/`.

#### 3. Deploy ke Pages (via Wrangler)

```powershell
cd apps/web
npx wrangler pages deploy out --project-name=man1tasik
```

Atau via **GitHub auto-deploy**:

1. Push ke GitHub
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create Project
3. Connect repository
4. Settings:
   - **Build command:** `cd apps/web && npm run build`
   - **Build output directory:** `apps/web/out`
   - **Root directory:** `/`
   - **Environment variable:** `NEXT_PUBLIC_API_URL` = URL Worker dari langkah A.4

### C. Custom Domain

#### Frontend (Cloudflare Pages)

1. Dashboard → Pages → man1tasik → Custom domains
2. Tambah: `man1tasik.sch.id` (atau domain lain)
3. Cloudflare otomatis buat DNS record + SSL

#### Backend API (Workers)

1. Dashboard → Workers → man1tasik-api → Settings → Triggers
2. Tambah Custom Domain: `api.man1tasik.sch.id`
3. Update `CORS_ORIGIN` di wrangler.toml:
   ```toml
   CORS_ORIGIN = "https://man1tasik.sch.id"
   ```
4. Redeploy: `npm run deploy:worker`

#### Update Frontend API URL

Setelah custom domain aktif, update env:
```env
NEXT_PUBLIC_API_URL=https://api.man1tasik.sch.id
```

Rebuild & redeploy frontend.

### D. Buat Superadmin di Production

```powershell
curl -X POST https://api.man1tasik.sch.id/api/auth/setup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"email\":\"admin@man1tasik.sch.id\",\"password\":\"PASSWORD_KUAT_DI_SINI\"}"
```

---

## API Endpoints

### Public
| Method | Path | Fungsi |
|--------|------|--------|
| GET | /api/hero | Slides + settings hero |
| GET | /api/articles | List artikel (search, pagination) |
| GET | /api/articles/:slug | Detail artikel |
| GET | /api/programs | Program unggulan |
| GET | /api/gallery | Galeri foto |
| POST | /api/contact | Kirim pesan kontak |
| GET | /assets/* | Serve gambar R2 |

### Auth
| Method | Path | Fungsi |
|--------|------|--------|
| POST | /api/auth/setup | Buat superadmin pertama |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Info user |
| POST | /api/auth/register | Buat user (admin+) |
| PATCH | /api/auth/password | Ganti password |

### Admin (auth required)
| Method | Path | Fungsi |
|--------|------|--------|
| GET/PUT | /api/admin/hero/settings | Settings hero |
| CRUD | /api/admin/hero/slides | Slides hero |
| CRUD | /api/admin/articles | Artikel (draft/publish/soft-delete) |
| CRUD | /api/admin/programs | Program |
| CRUD | /api/admin/gallery | Galeri |
| GET/DELETE | /api/admin/inbox | Pesan kontak |
| GET/PATCH | /api/admin/users | Manajemen user (superadmin) |

---

## Halaman

### Public
- `/` — Beranda (hero, program, galeri, kontak)
- `/artikel` — Daftar artikel (search + pagination)
- `/artikel/:slug` — Detail artikel

### Admin
- `/admin/login` — Login
- `/admin` — Dashboard overview
- `/admin/hero` — Kelola hero slider
- `/admin/artikel` — Kelola artikel (TipTap editor)
- `/admin/program` — Kelola program
- `/admin/galeri` — Kelola galeri
- `/admin/inbox` — Baca pesan kontak
- `/admin/users` — Manajemen pengguna (superadmin)
