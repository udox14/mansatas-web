import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { getDB } from '../db'
import { users } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminUsers = new Hono<AppEnv>()

adminUsers.use('*', requireAuth, requireRole('superadmin'))

/* GET — list semua users */
adminUsers.get('/', async (c) => {
  const db = getDB(c.env.DB)
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_active: users.is_active,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(desc(users.created_at))

  return c.json({ success: true, data: rows })
})

/* PATCH /:id/toggle — aktifkan/nonaktifkan user */
adminUsers.patch('/:id/toggle', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const currentUser = c.get('user')!

  if (id === currentUser.id) {
    return c.json({ success: false, message: 'Tidak bisa menonaktifkan diri sendiri.' }, 400)
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) return c.json({ success: false, message: 'User tidak ditemukan.' }, 404)

  await db
    .update(users)
    .set({ is_active: !user.is_active, updated_at: new Date().toISOString() })
    .where(eq(users.id, id))

  return c.json({
    success: true,
    message: `User berhasil di${user.is_active ? 'nonaktifkan' : 'aktifkan'}.`,
  })
})

export default adminUsers
