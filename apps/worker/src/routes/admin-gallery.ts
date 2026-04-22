import { Hono } from 'hono'
import { eq, asc, desc } from 'drizzle-orm'
import { getDB } from '../db'
import { gallery, galleryCategories } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminGallery = new Hono<AppEnv>()

adminGallery.use('*', requireAuth, requireRole('superadmin', 'admin', 'editor'))

/* ============================================
   GALLERY CATEGORIES
   ============================================ */
adminGallery.get('/categories', async (c) => {
  const db = getDB(c.env.DB)
  const rows = await db.select().from(galleryCategories).orderBy(asc(galleryCategories.sort_order))
  return c.json({ success: true, data: rows })
})

adminGallery.post('/categories', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json()
  const id = crypto.randomUUID()
  await db.insert(galleryCategories).values({ ...body, id })
  return c.json({ success: true, message: 'Kategori berhasil ditambahkan' })
})

adminGallery.put('/categories/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  await db.update(galleryCategories).set(body).where(eq(galleryCategories.id, id))
  return c.json({ success: true, message: 'Kategori berhasil diperbarui' })
})

adminGallery.delete('/categories/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  await db.delete(galleryCategories).where(eq(galleryCategories.id, id))
  return c.json({ success: true, message: 'Kategori berhasil dihapus' })
})

/* ============================================
   GALLERY PHOTOS
   ============================================ */
adminGallery.get('/', async (c) => {
  const db = getDB(c.env.DB)
  const rows = await db.select().from(gallery).orderBy(desc(gallery.created_at))
  return c.json({ success: true, data: rows })
})

adminGallery.post('/', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json()
  const id = crypto.randomUUID()
  await db.insert(gallery).values({
    ...body,
    id,
    is_active: true,
    is_featured: body.is_featured ?? false
  })
  return c.json({ success: true, message: 'Foto berhasil ditambahkan', data: { id } })
})

adminGallery.put('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  await db.update(gallery).set({
    ...body,
  }).where(eq(gallery.id, id))
  return c.json({ success: true, message: 'Foto berhasil diperbarui' })
})

adminGallery.delete('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [photo] = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1)
  if (!photo) return c.json({ success: false, message: 'Foto tidak ditemukan.' }, 404)

  if (photo.image_url.startsWith('/assets/')) {
    const key = photo.image_url.replace('/assets/', '')
    await c.env.BUCKET.delete(key)
  }

  await db.delete(gallery).where(eq(gallery.id, id))
  return c.json({ success: true, message: 'Foto berhasil dihapus.' })
})

export default adminGallery
