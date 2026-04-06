import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDB } from '../db'
import { gallery } from '../db/schema'
import type { AppEnv } from '../index'

const galleryRoute = new Hono<AppEnv>()

/* ============================================
   GET /api/gallery
   Public — list active gallery images (marquee)
   ============================================ */
galleryRoute.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const rows = await db
    .select()
    .from(gallery)
    .where(eq(gallery.is_active, true))
    .orderBy(asc(gallery.sort_order))

  return c.json({ success: true, data: rows })
})

export default galleryRoute
