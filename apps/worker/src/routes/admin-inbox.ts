import { Hono } from 'hono'
import { eq, desc, sql } from 'drizzle-orm'
import { getDB } from '../db'
import { contactMessages } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminInbox = new Hono<AppEnv>()

adminInbox.use('*', requireAuth, requireRole('superadmin', 'admin'))

/* ============================================
   GET /api/admin/inbox
   List pesan, terbaru duluan
   Query: ?page=1&limit=20&unread=true
   ============================================ */
adminInbox.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
  const unreadOnly = c.req.query('unread') === 'true'
  const offset = (page - 1) * limit

  const where = unreadOnly ? eq(contactMessages.is_read, false) : undefined

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactMessages)
    .where(where)

  const total = countResult?.count || 0

  // Unread count (selalu)
  const [unreadResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactMessages)
    .where(eq(contactMessages.is_read, false))

  const unreadCount = unreadResult?.count || 0

  const rows = await db
    .select()
    .from(contactMessages)
    .where(where)
    .orderBy(desc(contactMessages.created_at))
    .limit(limit)
    .offset(offset)

  return c.json({
    success: true,
    data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount },
  })
})

/* ============================================
   GET /api/admin/inbox/:id
   Detail pesan — otomatis mark as read
   ============================================ */
adminInbox.get('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [msg] = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, id))
    .limit(1)

  if (!msg) {
    return c.json({ success: false, message: 'Pesan tidak ditemukan.' }, 404)
  }

  // Auto mark as read
  if (!msg.is_read) {
    await db
      .update(contactMessages)
      .set({ is_read: true })
      .where(eq(contactMessages.id, id))
  }

  return c.json({ success: true, data: { ...msg, is_read: true } })
})

/* ============================================
   DELETE /api/admin/inbox/:id
   Hapus pesan permanen
   ============================================ */
adminInbox.delete('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(eq(contactMessages.id, id))
    .limit(1)

  if (!existing) {
    return c.json({ success: false, message: 'Pesan tidak ditemukan.' }, 404)
  }

  await db.delete(contactMessages).where(eq(contactMessages.id, id))
  return c.json({ success: true, message: 'Pesan berhasil dihapus.' })
})

export default adminInbox
