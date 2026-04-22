import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDB } from '../db'
import { programs } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminPrograms = new Hono<AppEnv>()

adminPrograms.use('*', requireAuth, requireRole('superadmin', 'admin', 'editor'))

/* GET — list semua (termasuk nonaktif) */
adminPrograms.get('/', async (c) => {
  const db = getDB(c.env.DB)
  const rows = await db.select().from(programs).orderBy(asc(programs.sort_order))
  return c.json({ success: true, data: rows })
})

/* POST — tambah program */
adminPrograms.post('/', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json<{
    title: string
    description: string
    icon?: string
    image_url?: string
    sort_order?: number
    is_featured?: boolean
  }>()

  if (!body.title?.trim() || !body.description?.trim()) {
    return c.json({ success: false, message: 'Judul dan deskripsi wajib diisi.' }, 400)
  }

  const id = crypto.randomUUID()
  await db.insert(programs).values({
    id,
    title: body.title.trim(),
    description: body.description.trim(),
    icon: body.icon?.trim() || 'GraduationCap',
    image_url: body.image_url?.trim() || null,
    sort_order: body.sort_order ?? 0,
    is_featured: body.is_featured ?? false,
    is_active: true,
  })

  return c.json({ success: true, message: 'Program berhasil ditambahkan.', data: { id } })
})

/* PUT — update program */
adminPrograms.put('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json<{
    title?: string
    description?: string
    icon?: string
    image_url?: string
    sort_order?: number
    is_active?: boolean
    is_featured?: boolean
  }>()

  const [existing] = await db.select({ id: programs.id }).from(programs).where(eq(programs.id, id)).limit(1)
  if (!existing) return c.json({ success: false, message: 'Program tidak ditemukan.' }, 404)

  await db.update(programs).set({
    ...(body.title !== undefined && { title: body.title.trim() }),
    ...(body.description !== undefined && { description: body.description.trim() }),
    ...(body.icon !== undefined && { icon: body.icon.trim() }),
    ...(body.image_url !== undefined && { image_url: body.image_url?.trim() || null }),
    ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
    ...(body.is_active !== undefined && { is_active: body.is_active }),
    ...(body.is_featured !== undefined && { is_featured: body.is_featured }),
  }).where(eq(programs.id, id))

  return c.json({ success: true, message: 'Program berhasil diperbarui.' })
})

/* DELETE — hapus permanen */
adminPrograms.delete('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [existing] = await db.select({ id: programs.id }).from(programs).where(eq(programs.id, id)).limit(1)
  if (!existing) return c.json({ success: false, message: 'Program tidak ditemukan.' }, 404)

  await db.delete(programs).where(eq(programs.id, id))
  return c.json({ success: true, message: 'Program berhasil dihapus.' })
})

export default adminPrograms
