import { Hono } from 'hono'
import { getDB } from '../db'
import { contactMessages } from '../db/schema'
import { rateLimit } from '../middleware/rate-limit'
import type { AppEnv } from '../index'

const contactRoute = new Hono<AppEnv>()

/* ============================================
   POST /api/contact
   Public — kirim pesan kontak (rate limited)
   ============================================ */
contactRoute.post(
  '/',
  rateLimit({ max: 3, windowSec: 300 }), // 3 pesan per 5 menit per IP
  async (c) => {
    const db = getDB(c.env.DB)

    const body = await c.req.json<{
      name: string
      email: string
      subject: string
      message: string
    }>()

    // Validasi
    if (!body.name?.trim()) {
      return c.json({ success: false, message: 'Nama wajib diisi.' }, 400)
    }
    if (!body.email?.trim()) {
      return c.json({ success: false, message: 'Email wajib diisi.' }, 400)
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email.trim())) {
      return c.json({ success: false, message: 'Format email tidak valid.' }, 400)
    }
    if (!body.subject?.trim()) {
      return c.json({ success: false, message: 'Subjek wajib diisi.' }, 400)
    }
    if (!body.message?.trim()) {
      return c.json({ success: false, message: 'Pesan wajib diisi.' }, 400)
    }
    if (body.message.trim().length > 2000) {
      return c.json({ success: false, message: 'Pesan maksimal 2000 karakter.' }, 400)
    }

    const id = crypto.randomUUID()

    await db.insert(contactMessages).values({
      id,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      subject: body.subject.trim(),
      message: body.message.trim(),
    })

    return c.json({
      success: true,
      message: 'Pesan berhasil dikirim. Terima kasih!',
    })
  }
)

export default contactRoute
