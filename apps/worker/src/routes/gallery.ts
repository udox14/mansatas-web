import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDB } from '../db'
import { gallery, galleryCategories } from '../db/schema'
import type { AppEnv } from '../index'

const galleryRoute = new Hono<AppEnv>()

/* GET /api/gallery — featured photos for marquee */
galleryRoute.get('/', async (c) => {
  const db = getDB(c.env.DB)
  const rows = await db
    .select()
    .from(gallery)
    .where(eq(gallery.is_featured, true))
    .orderBy(asc(gallery.sort_order))
  return c.json({ success: true, data: rows })
})

/* GET /api/gallery/categories — all folders */
galleryRoute.get('/categories', async (c) => {
  const db = getDB(c.env.DB)
  const rows = await db
    .select()
    .from(galleryCategories)
    .orderBy(asc(galleryCategories.sort_order))
  return c.json({ success: true, data: rows })
})

/* GET /api/gallery/photos/:categorySlug — photos in folder */
galleryRoute.get('/photos/:categorySlug', async (c) => {
  const db = getDB(c.env.DB)
  const slug = c.req.param('categorySlug')

  // Get category first
  const [cat] = await db.select().from(galleryCategories).where(eq(galleryCategories.slug, slug)).limit(1)
  if (!cat) return c.json({ success: false, message: 'Kategori tidak ditemukan' }, 404)

  const rows = await db
    .select()
    .from(gallery)
    .where(eq(gallery.category_id, cat.id))
    .orderBy(asc(gallery.sort_order))

  return c.json({ success: true, data: rows, category: cat })
})

export default galleryRoute
