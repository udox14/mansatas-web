import { Hono } from 'hono'
import { eq, and, asc, desc, sql } from 'drizzle-orm'
import { getDB } from '../db'
import { gtk } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminGtk = new Hono<AppEnv>()

adminGtk.use('*', requireAuth, requireRole('superadmin', 'admin'))

/* ============================================
   GET /api/admin/gtk
   List all GTK members for management
   ============================================ */
adminGtk.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const rows = await db
    .select()
    .from(gtk)
    .orderBy(asc(gtk.sort_order), asc(gtk.name))

  return c.json({
    success: true,
    data: rows,
  })
})

/* ============================================
   POST /api/admin/gtk
   Create single GTK member
   ============================================ */
adminGtk.post('/', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json<{
    name: string
    nip?: string
    gender: 'L' | 'P'
    position: string
    subject?: string
    image_url?: string
    is_featured?: boolean
    sort_order?: number
  }>()

  if (!body.name || !body.position) {
    return c.json({ success: false, message: 'Nama dan Jabatan wajib diisi.' }, 400)
  }

  const id = crypto.randomUUID()
  await db.insert(gtk).values({
    id,
    name: body.name,
    nip: body.nip || null,
    gender: body.gender || 'L',
    position: body.position,
    subject: body.subject || null,
    image_url: body.image_url || null,
    is_featured: body.is_featured || false,
    sort_order: body.sort_order || 0,
    is_active: true,
  })

  return c.json({ success: true, message: 'Data GTK berhasil ditambahkan.', data: { id } })
})

/* ============================================
   POST /api/admin/gtk/batch
   Batch create GTK members (from Excel/Paste)
   ============================================ */
adminGtk.post('/batch', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json<Array<{
    name: string
    nip?: string
    gender: 'L' | 'P'
    position: string
    subject?: string
  }>>()

  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ success: false, message: 'Data tidak valid atau kosong.' }, 400)
  }

  const values = body.map(item => ({
    id: crypto.randomUUID(),
    name: item.name,
    nip: item.nip || null,
    gender: item.gender || 'L',
    position: item.position,
    subject: item.subject || null,
    is_active: true,
    is_featured: false,
    sort_order: 0,
  }))

  // Batch insert
  await db.insert(gtk).values(values)

  return c.json({ success: true, message: `${body.length} data GTK berhasil diimport secara batch.` })
})

/* ============================================
   PUT /api/admin/gtk/:id
   Update GTK member
   ============================================ */
adminGtk.put('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json<Partial<{
    name: string
    nip: string
    gender: 'L' | 'P'
    position: string
    subject: string
    image_url: string
    is_featured: boolean
    is_active: boolean
    sort_order: number
  }>>()

  await db.update(gtk)
    .set({
      ...body,
      updated_at: new Date().toISOString()
    })
    .where(eq(gtk.id, id))

  return c.json({ success: true, message: 'Data GTK berhasil diperbarui.' })
})

/* ============================================
   DELETE /api/admin/gtk/:id
   Delete GTK member
   ============================================ */
adminGtk.delete('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  await db.delete(gtk).where(eq(gtk.id, id))

  return c.json({ success: true, message: 'Data GTK berhasil dihapus.' })
})

export default adminGtk
