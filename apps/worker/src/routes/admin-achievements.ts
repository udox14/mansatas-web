import { Hono } from 'hono'
import { eq, desc, and, sql } from 'drizzle-orm'
import { getDB } from '../db'
import { achievements } from '../db/schema'
import type { AppEnv } from '../index'

const adminAchievements = new Hono<AppEnv>()

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
