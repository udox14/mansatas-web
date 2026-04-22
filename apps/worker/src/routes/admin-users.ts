import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { getDB } from '../db'
import { users } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import { hashPassword } from '../lib/password'
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
      permissions: users.permissions,
      is_active: users.is_active,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(desc(users.created_at))

  const mappedRows = rows.map((r) => ({
    ...r,
    permissions: r.permissions ? JSON.parse(r.permissions) : []
  }))

  return c.json({ success: true, data: mappedRows })
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

/* PATCH /:id — update user */
adminUsers.patch('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const body = await c.req.json<{
    name: string
    email: string
    password?: string
    role: 'superadmin' | 'admin' | 'editor'
    permissions?: string[]
  }>()

  if (!body.name?.trim() || !body.email?.trim() || !body.role) {
    return c.json({ success: false, message: 'Nama, email, dan role wajib diisi.' }, 400)
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) return c.json({ success: false, message: 'User tidak ditemukan.' }, 404)

  // Cek apakah email sudah dipakai user lain
  if (body.email.trim().toLowerCase() !== user.email) {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email.trim().toLowerCase())).limit(1)
    if (existing) return c.json({ success: false, message: 'Email sudah terdaftar.' }, 409)
  }

  const updateData: any = {
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    role: body.role,
    permissions: JSON.stringify(body.permissions || []),
    updated_at: new Date().toISOString()
  }

  if (body.password) {
    if (body.password.length < 8) return c.json({ success: false, message: 'Password minimal 8 karakter.' }, 400)
    updateData.password_hash = await hashPassword(body.password)
  }

  await db.update(users).set(updateData).where(eq(users.id, id))

  return c.json({ success: true, message: 'Data pengguna berhasil diperbarui.' })
})

export default adminUsers
