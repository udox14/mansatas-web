import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDB } from '../db'
import { gallery } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminGallery = new Hono<AppEnv>()

adminGallery.use('*', requireAuth, requireRole('superadmin', 'admin'))

/* GET — list semua */
adminGallery.get('/', async (c) => {
  const db = getDB(c.env.DB)
  const rows = await db.select().from(gallery).orderBy(asc(gallery.sort_order))
  return c.json({ success: true, data: rows })
})

/* POST — tambah foto */
adminGallery.post('/', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json<{
    image_url: string
    caption?: string
    sort_order?: number
  }>()

  if (!body.image_url?.trim()) {
    return c.json({ success: false, message: 'image_url wajib diisi.' }, 400)
  }

  const id = crypto.randomUUID()
  await db.insert(gallery).values({
    id,
    image_url: body.image_url.trim(),
    caption: body.caption?.trim() || null,
    sort_order: body.sort_order ?? 0,
    is_active: true,
  })

  return c.json({ success: true, message: 'Foto berhasil ditambahkan.', data: { id } })
})

/* PUT — update foto */
adminGallery.put('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json<{
    image_url?: string
    caption?: string
    sort_order?: number
    is_active?: boolean
  }>()

  const [existing] = await db.select({ id: gallery.id }).from(gallery).where(eq(gallery.id, id)).limit(1)
  if (!existing) return c.json({ success: false, message: 'Foto tidak ditemukan.' }, 404)

  await db.update(gallery).set({
    ...(body.image_url !== undefined && { image_url: body.image_url.trim() }),
    ...(body.caption !== undefined && { caption: body.caption?.trim() || null }),
    ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
    ...(body.is_active !== undefined && { is_active: body.is_active }),
  }).where(eq(gallery.id, id))

  return c.json({ success: true, message: 'Foto berhasil diperbarui.' })
})

/* DELETE — hapus foto + R2 object */
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
