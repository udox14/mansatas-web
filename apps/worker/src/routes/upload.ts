import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../index'

const uploadRoute = new Hono<AppEnv>()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/* ============================================
   POST /api/upload
   Auth required — upload gambar ke R2
   Body: multipart/form-data, field "file"
   Optional query: ?folder=hero|articles|gallery
   ============================================ */
uploadRoute.post('/', requireAuth, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return c.json({ success: false, message: 'File tidak ditemukan.' }, 400)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json(
      { success: false, message: 'Format file harus JPEG, PNG, WebP, atau GIF.' },
      400
    )
  }

  if (file.size > MAX_SIZE) {
    return c.json(
      { success: false, message: 'Ukuran file maksimal 5MB.' },
      400
    )
  }

  // Generate unique filename
  const folder = c.req.query('folder') || 'uploads'
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const random = crypto.randomUUID().slice(0, 8)
  const key = `${folder}/${timestamp}-${random}.${ext}`

  // Upload ke R2
  await c.env.BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  })

  // URL publik R2 — format: https://<custom-domain>/<key>
  // Atau via Workers route /assets/<key>
  const url = `/assets/${key}`

  return c.json({
    success: true,
    data: {
      key,
      url,
      filename: file.name,
      size: file.size,
      type: file.type,
    },
  })
})

export default uploadRoute
