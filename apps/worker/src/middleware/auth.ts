import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../lib/jwt'
import type { AppEnv } from '../index'

/**
 * Auth middleware — opsional.
 * Set c.var.user jika token valid, null jika tidak ada token.
 * Tidak menolak request tanpa token (untuk public routes).
 */
export const optionalAuth = createMiddleware<AppEnv>(async (c, next) => {
  c.set('user', null)

  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token, c.env.JWT_SECRET)

  if (payload) {
    c.set('user', {
      id: payload.sub!,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    })
  }

  return next()
})

/**
 * Auth middleware — wajib.
 * Tolak request tanpa token atau token invalid.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Token tidak ditemukan' }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token, c.env.JWT_SECRET)

  if (!payload) {
    return c.json({ success: false, message: 'Token tidak valid atau kedaluwarsa' }, 401)
  }

  c.set('user', {
    id: payload.sub!,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions,
  })

  return next()
})

/**
 * RBAC middleware — cek role user.
 * Harus dipakai setelah requireAuth.
 */
export function requireRole(...allowedRoles: Array<'superadmin' | 'admin' | 'editor'>) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ success: false, message: 'Tidak terautentikasi' }, 401)
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        { success: false, message: 'Anda tidak memiliki akses untuk operasi ini' },
        403
      )
    }

    return next()
  })
}
