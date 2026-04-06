import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

/* ============================================
   Type Bindings
   ============================================ */
export type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
  CORS_ORIGIN: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'editor'
}

export type Variables = {
  user: AuthUser | null
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}

/* ============================================
   App Instance
   ============================================ */
const app = new Hono<AppEnv>()

// Logger
app.use('*', logger())

// CORS — origin dari env, support multiple origins dengan koma
app.use('*', async (c, next) => {
  const origins = c.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  const middleware = cors({
    origin: origins,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
  })
  return middleware(c, next)
})

// Health check
app.get('/', (c) =>
  c.json({
    status: 'ok',
    service: 'MAN 1 Tasikmalaya API',
    version: '1.0.0',
  })
)

/* ============================================
   Routes
   ============================================ */
import authRoutes from './routes/auth'
import heroRoutes from './routes/hero'
import articlesRoutes from './routes/articles'
import programsRoutes from './routes/programs'
import galleryRoutes from './routes/gallery'
import contactRoutes from './routes/contact'
import uploadRoutes from './routes/upload'
import assetsRoutes from './routes/assets'
import categoriesRoutes from './routes/categories'

app.route('/api/auth', authRoutes)
app.route('/api/hero', heroRoutes)
app.route('/api/articles', articlesRoutes)
app.route('/api/programs', programsRoutes)
app.route('/api/gallery', galleryRoutes)
app.route('/api/contact', contactRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/categories', categoriesRoutes)
app.route('/assets', assetsRoutes)

import adminHeroRoutes from './routes/admin-hero'
import adminArticlesRoutes from './routes/admin-articles'
import adminProgramsRoutes from './routes/admin-programs'
import adminGalleryRoutes from './routes/admin-gallery'
import adminInboxRoutes from './routes/admin-inbox'
import adminCategoriesRoutes from './routes/admin-categories'

app.route('/api/admin/hero', adminHeroRoutes)
app.route('/api/admin/articles', adminArticlesRoutes)
app.route('/api/admin/programs', adminProgramsRoutes)
app.route('/api/admin/gallery', adminGalleryRoutes)
app.route('/api/admin/inbox', adminInboxRoutes)
app.route('/api/admin/categories', adminCategoriesRoutes)

import adminUsersRoutes from './routes/admin-users'
app.route('/api/admin/users', adminUsersRoutes)

// 404 fallback
app.notFound((c) =>
  c.json({ success: false, message: 'Endpoint tidak ditemukan' }, 404)
)

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json(
    { success: false, message: 'Terjadi kesalahan pada server' },
    500
  )
})

export default app
