import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDB } from '../db'
import { users } from '../db/schema'
import { hashPassword, verifyPassword } from '../lib/password'
import { signToken } from '../lib/jwt'
import { requireAuth, requireRole } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'
import type { AppEnv } from '../index'

const auth = new Hono<AppEnv>()

/* ============================================
   POST /api/auth/setup
   First-time superadmin creation.
   Hanya bisa dipanggil jika belum ada user sama sekali.
   ============================================ */
auth.post('/setup', rateLimit({ max: 3, windowSec: 300 }), async (c) => {
  const db = getDB(c.env.DB)

  // Cek apakah sudah ada user
  const existing = await db.select({ id: users.id }).from(users).limit(1)
  if (existing.length > 0) {
    return c.json(
      { success: false, message: 'Setup sudah dilakukan. Gunakan /login.' },
      400
    )
  }

  const body = await c.req.json<{
    name: string
    email: string
    password: string
  }>()

  // Validasi
  if (!body.name?.trim() || !body.email?.trim() || !body.password) {
    return c.json(
      { success: false, message: 'Nama, email, dan password wajib diisi.' },
      400
    )
  }

  if (body.password.length < 8) {
    return c.json(
      { success: false, message: 'Password minimal 8 karakter.' },
      400
    )
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return c.json({ success: false, message: 'Format email tidak valid.' }, 400)
  }

  const id = crypto.randomUUID()
  const password_hash = await hashPassword(body.password)

  await db.insert(users).values({
    id,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    password_hash,
    role: 'superadmin',
    permissions: [],
    is_active: true,
  })

  const token = await signToken(
    {
      sub: id,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      role: 'superadmin',
      permissions: [],
    },
    c.env.JWT_SECRET
  )

  return c.json({
    success: true,
    message: 'Superadmin berhasil dibuat.',
    data: { token, user: { id, name: body.name.trim(), email: body.email.trim().toLowerCase(), role: 'superadmin', permissions: [] } },
  })
})

/* ============================================
   POST /api/auth/login
   ============================================ */
auth.post('/login', rateLimit({ max: 5, windowSec: 60 }), async (c) => {
  const db = getDB(c.env.DB)

  const body = await c.req.json<{
    email: string
    password: string
  }>()

  if (!body.email || !body.password) {
    return c.json(
      { success: false, message: 'Email dan password wajib diisi.' },
      400
    )
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email.trim().toLowerCase()))
    .limit(1)

  if (!user) {
    return c.json(
      { success: false, message: 'Email atau password salah.' },
      401
    )
  }

  if (!user.is_active) {
    return c.json(
      { success: false, message: 'Akun Anda telah dinonaktifkan.' },
      403
    )
  }

  const valid = await verifyPassword(body.password, user.password_hash)
  if (!valid) {
    return c.json(
      { success: false, message: 'Email atau password salah.' },
      401
    )
  }

  const token = await signToken(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    },
    c.env.JWT_SECRET
  )

  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
      },
    },
  })
})

/* ============================================
   GET /api/auth/me
   Get current user info from token.
   ============================================ */
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user')!
  const db = getDB(c.env.DB)

  // Fetch fresh data dari DB
  const [dbUser] = await db
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
    .where(eq(users.id, user.id))
    .limit(1)

  if (!dbUser || !dbUser.is_active) {
    return c.json(
      { success: false, message: 'User tidak ditemukan atau nonaktif.' },
      401
    )
  }

  return c.json({ success: true, data: dbUser })
})

/* ============================================
   POST /api/auth/register
   Buat user baru — hanya superadmin & admin.
   ============================================ */
auth.post(
  '/register',
  requireAuth,
  requireRole('superadmin', 'admin'),
  async (c) => {
    const db = getDB(c.env.DB)
    const currentUser = c.get('user')!

    const body = await c.req.json<{
      name: string
      email: string
      password: string
      role?: 'admin' | 'editor'
      permissions?: string[]
    }>()

    if (!body.name?.trim() || !body.email?.trim() || !body.password) {
      return c.json(
        { success: false, message: 'Nama, email, dan password wajib diisi.' },
        400
      )
    }

    if (body.password.length < 8) {
      return c.json(
        { success: false, message: 'Password minimal 8 karakter.' },
        400
      )
    }

    // Admin hanya bisa buat editor, superadmin bisa buat admin & editor
    let role: 'admin' | 'editor' = body.role || 'editor'
    if (currentUser.role === 'admin' && role === 'admin') {
      role = 'editor' // downgrade silently
    }

    // Cek email unik
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email.trim().toLowerCase()))
      .limit(1)

    if (existing) {
      return c.json(
        { success: false, message: 'Email sudah terdaftar.' },
        409
      )
    }

    const id = crypto.randomUUID()
    const password_hash = await hashPassword(body.password)

    await db.insert(users).values({
      id,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password_hash,
      role,
      permissions: body.permissions || [],
      is_active: true,
    })

    return c.json({
      success: true,
      message: 'User berhasil dibuat.',
      data: {
        id,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        role,
        permissions: body.permissions || [],
      },
    })
  }
)

/* ============================================
   PATCH /api/auth/password
   Ganti password sendiri.
   ============================================ */
auth.patch('/password', requireAuth, async (c) => {
  const db = getDB(c.env.DB)
  const user = c.get('user')!

  const body = await c.req.json<{
    current_password: string
    new_password: string
  }>()

  if (!body.current_password || !body.new_password) {
    return c.json(
      { success: false, message: 'Password lama dan baru wajib diisi.' },
      400
    )
  }

  if (body.new_password.length < 8) {
    return c.json(
      { success: false, message: 'Password baru minimal 8 karakter.' },
      400
    )
  }

  const [dbUser] = await db
    .select({ password_hash: users.password_hash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!dbUser) {
    return c.json({ success: false, message: 'User tidak ditemukan.' }, 404)
  }

  const valid = await verifyPassword(body.current_password, dbUser.password_hash)
  if (!valid) {
    return c.json({ success: false, message: 'Password lama salah.' }, 401)
  }

  const new_hash = await hashPassword(body.new_password)
  await db
    .update(users)
    .set({ password_hash: new_hash, updated_at: new Date().toISOString() })
    .where(eq(users.id, user.id))

  return c.json({ success: true, message: 'Password berhasil diubah.' })
})

export default auth
