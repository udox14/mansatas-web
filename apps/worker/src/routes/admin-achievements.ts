import { Hono } from 'hono'
import { eq, desc, and, sql } from 'drizzle-orm'
import { getDB } from '../db'
import { achievements } from '../db/schema'
import type { AppEnv } from '../index'
import { requireAuth, requireRole } from '../middleware/auth'

const adminAchievements = new Hono<AppEnv>()
adminAchievements.use('*', requireAuth, requireRole('superadmin', 'admin', 'editor'))

function normalizeAchievementDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  const date = String(value).trim()
  if (!date) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const [year, month, day] = date.split('-').map(Number)
  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

function normalizeAchievementYear(value: unknown): number | null {
  const year = parseInt(String(value ?? ''), 10)
  if (!Number.isInteger(year) || year < 1900 || year > 2200) return null
  return year
}

// GET /api/admin/achievements — List all for admin
adminAchievements.get('/', async (c) => {
  const db = getDB(c.env.DB)
  
  const rows = await db
    .select()
    .from(achievements)
    .orderBy(desc(achievements.date))

  return c.json({ success: true, data: rows })
})

// POST /api/admin/achievements — Create
adminAchievements.post('/', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json()

  if (!body.title || !body.year) {
    return c.json({ success: false, message: 'Nama lomba dan tahun wajib diisi.' }, 400)
  }

  const newAchievement = {
    id: crypto.randomUUID(),
    title: body.title,
    rank: body.rank || null,
    organizer: body.organizer || null,
    location: body.location || null,
    date: body.date || null,
    year: parseInt(body.year, 10),
    image_url: body.image_url || null,
    article_id: body.article_id || null,
  }

  await db.insert(achievements).values(newAchievement)

  return c.json({ success: true, data: newAchievement })
})

// PUT /api/admin/achievements/:id — Update
adminAchievements.post('/batch', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json<Array<{
    title: string
    rank?: string
    organizer?: string
    location?: string
    date?: string | null
    year: number | string
    image_url?: string
    article_id?: string
  }>>()

  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ success: false, message: 'Data import kosong atau tidak valid.' }, 400)
  }

  if (body.length > 500) {
    return c.json({ success: false, message: 'Maksimal import 500 prestasi sekali upload.' }, 400)
  }

  const values = []

  for (let i = 0; i < body.length; i++) {
    const item = body[i]
    const title = item.title?.trim()
    const year = normalizeAchievementYear(item.year)
    const date = normalizeAchievementDate(item.date)

    if (!title || !year) {
      return c.json({ success: false, message: `Baris ${i + 1}: nama prestasi dan tahun wajib valid.` }, 400)
    }

    if (item.date && !date) {
      return c.json({ success: false, message: `Baris ${i + 1}: format tanggal harus YYYY-MM-DD.` }, 400)
    }

    values.push({
      id: crypto.randomUUID(),
      title,
      rank: item.rank?.trim() || null,
      organizer: item.organizer?.trim() || null,
      location: item.location?.trim() || null,
      date,
      year,
      image_url: item.image_url?.trim() || null,
      article_id: item.article_id?.trim() || null,
    })
  }

  try {
    const statements = values.map((val) => db.insert(achievements).values(val))
    const chunkSize = 50
    for (let i = 0; i < statements.length; i += chunkSize) {
      await db.batch(statements.slice(i, i + chunkSize) as any)
    }

    return c.json({
      success: true,
      message: `${values.length} data prestasi berhasil diimport.`,
      data: { imported: values.length },
    })
  } catch (err: any) {
    console.error('Achievement batch import error:', err)
    return c.json({ success: false, message: err.message || 'Gagal import data prestasi.' }, 500)
  }
})

adminAchievements.put('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()

  const [existing] = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1)
  if (!existing) {
    return c.json({ success: false, message: 'Data tidak ditemukan.' }, 404)
  }

  const updated = {
    title: body.title ?? existing.title,
    rank: body.rank ?? existing.rank,
    organizer: body.organizer ?? existing.organizer,
    location: body.location ?? existing.location,
    date: body.date ?? existing.date,
    year: body.year ? parseInt(body.year, 10) : existing.year,
    image_url: body.image_url ?? existing.image_url,
    article_id: body.article_id ?? existing.article_id,
  }

  await db.update(achievements).set(updated).where(eq(achievements.id, id))

  return c.json({ success: true, data: { ...existing, ...updated } })
})

// DELETE /api/admin/achievements/:id — Delete
adminAchievements.delete('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [existing] = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1)
  if (!existing) {
    return c.json({ success: false, message: 'Data tidak ditemukan.' }, 404)
  }

  await db.delete(achievements).where(eq(achievements.id, id))

  return c.json({ success: true, message: 'Data berhasil dihapus.' })
})

export default adminAchievements
