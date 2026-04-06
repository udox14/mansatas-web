import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDB } from '../db'
import { heroSlides, heroSettings } from '../db/schema'
import type { AppEnv } from '../index'

const hero = new Hono<AppEnv>()

/* ============================================
   GET /api/hero
   Public — ambil slides aktif + settings
   ============================================ */
hero.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const [settings] = await db
    .select()
    .from(heroSettings)
    .where(eq(heroSettings.id, 'default'))
    .limit(1)

  const slides = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.is_active, true))
    .orderBy(asc(heroSlides.sort_order))

  return c.json({
    success: true,
    data: {
      settings: settings || null,
      slides,
    },
  })
})

export default hero
