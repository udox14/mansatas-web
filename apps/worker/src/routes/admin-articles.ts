import { Hono } from 'hono'
import { eq, and, desc, like, sql } from 'drizzle-orm'
import { getDB } from '../db'
import { articles, users } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminArticles = new Hono<AppEnv>()

adminArticles.use('*', requireAuth, requireRole('superadmin', 'admin', 'editor'))

/* ============================================
   Helper: generate unique slug
   ============================================ */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/* ============================================
   GET /api/admin/articles
   List semua artikel (termasuk draft & deleted)
   Query: ?page=1&limit=20&search=&status=&deleted=
   ============================================ */
adminArticles.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
  const search = c.req.query('search')?.trim() || ''
  const status = c.req.query('status') || '' // draft | published | ''
  const showDeleted = c.req.query('deleted') === 'true'
  const offset = (page - 1) * limit

  const conditions = []

  if (!showDeleted) {
    conditions.push(eq(articles.is_deleted, false))
  }

  if (status === 'draft' || status === 'published') {
    conditions.push(eq(articles.status, status))
  }

  if (search) {
    conditions.push(like(articles.title, `%${search}%`))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(where)

  const total = countResult?.count || 0

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      thumbnail_url: articles.thumbnail_url,
      status: articles.status,
      is_deleted: articles.is_deleted,
      author_name: users.name,
      created_at: articles.created_at,
      updated_at: articles.updated_at,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author_id, users.id))
    .where(where)
    .orderBy(desc(articles.updated_at))
    .limit(limit)
    .offset(offset)

  return c.json({
    success: true,
    data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

/* ============================================
   GET /api/admin/articles/:id
   Detail artikel by ID (bukan slug, untuk edit)
   ============================================ */
adminArticles.get('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      thumbnail_url: articles.thumbnail_url,
      status: articles.status,
      is_deleted: articles.is_deleted,
      author_id: articles.author_id,
      author_name: users.name,
      created_at: articles.created_at,
      updated_at: articles.updated_at,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author_id, users.id))
    .where(eq(articles.id, id))
    .limit(1)

  if (!article) {
    return c.json({ success: false, message: 'Artikel tidak ditemukan.' }, 404)
  }

  return c.json({ success: true, data: article })
})

/* ============================================
   POST /api/admin/articles
   Buat artikel baru (default: draft)
   ============================================ */
adminArticles.post('/', async (c) => {
  const db = getDB(c.env.DB)
  const user = c.get('user')!

  const body = await c.req.json<{
    title: string
    content: string
    excerpt?: string
    thumbnail_url?: string
    status?: 'draft' | 'published'
  }>()

  if (!body.title?.trim()) {
    return c.json({ success: false, message: 'Judul wajib diisi.' }, 400)
  }

  // Generate unique slug
  let slug = slugify(body.title)
  if (!slug) slug = crypto.randomUUID().slice(0, 8)

  // Cek slug unik
  const [existingSlug] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1)

  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const id = crypto.randomUUID()

  await db.insert(articles).values({
    id,
    title: body.title.trim(),
    slug,
    content: body.content || '',
    excerpt: body.excerpt?.trim() || null,
    thumbnail_url: body.thumbnail_url?.trim() || null,
    status: body.status || 'draft',
    author_id: user.id,
  })

  return c.json({
    success: true,
    message: 'Artikel berhasil dibuat.',
    data: { id, slug },
  })
})

/* ============================================
   PUT /api/admin/articles/:id
   Update artikel
   ============================================ */
adminArticles.put('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1)

  if (!existing) {
    return c.json({ success: false, message: 'Artikel tidak ditemukan.' }, 404)
  }

  const body = await c.req.json<{
    title?: string
    content?: string
    excerpt?: string
    thumbnail_url?: string
    status?: 'draft' | 'published'
  }>()

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.title !== undefined) {
    updates.title = body.title.trim()
    // Update slug juga
    let newSlug = slugify(body.title)
    if (newSlug) {
      const [slugConflict] = await db
        .select({ id: articles.id })
        .from(articles)
        .where(and(eq(articles.slug, newSlug), sql`${articles.id} != ${id}`))
        .limit(1)
      if (slugConflict) newSlug = `${newSlug}-${Date.now().toString(36)}`
      updates.slug = newSlug
    }
  }

  if (body.content !== undefined) updates.content = body.content
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt?.trim() || null
  if (body.thumbnail_url !== undefined) updates.thumbnail_url = body.thumbnail_url?.trim() || null
  if (body.status !== undefined) updates.status = body.status

  await db.update(articles).set(updates).where(eq(articles.id, id))

  return c.json({ success: true, message: 'Artikel berhasil diperbarui.' })
})

/* ============================================
   PATCH /api/admin/articles/:id/status
   Toggle status draft/published
   ============================================ */
adminArticles.patch('/:id/status', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json<{ status: 'draft' | 'published' }>()

  if (!['draft', 'published'].includes(body.status)) {
    return c.json({ success: false, message: 'Status harus "draft" atau "published".' }, 400)
  }

  const [existing] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1)

  if (!existing) {
    return c.json({ success: false, message: 'Artikel tidak ditemukan.' }, 404)
  }

  await db
    .update(articles)
    .set({ status: body.status, updated_at: new Date().toISOString() })
    .where(eq(articles.id, id))

  return c.json({ success: true, message: `Artikel berhasil di-${body.status === 'published' ? 'publish' : 'draft'}.` })
})

/* ============================================
   DELETE /api/admin/articles/:id
   Soft delete (is_deleted = true)
   ============================================ */
adminArticles.delete('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1)

  if (!existing) {
    return c.json({ success: false, message: 'Artikel tidak ditemukan.' }, 404)
  }

  await db
    .update(articles)
    .set({ is_deleted: true, updated_at: new Date().toISOString() })
    .where(eq(articles.id, id))

  return c.json({ success: true, message: 'Artikel berhasil dihapus.' })
})

/* ============================================
   PATCH /api/admin/articles/:id/restore
   Restore soft-deleted article
   ============================================ */
adminArticles.patch('/:id/restore', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  await db
    .update(articles)
    .set({ is_deleted: false, updated_at: new Date().toISOString() })
    .where(eq(articles.id, id))

  return c.json({ success: true, message: 'Artikel berhasil dipulihkan.' })
})

export default adminArticles
