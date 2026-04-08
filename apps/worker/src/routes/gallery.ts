import { Hono } from 'hono'
import { eq, asc, desc } from 'drizzle-orm'
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
  
  // Get categories
  const categoriesList = await db
    .select()
    .from(galleryCategories)
    .orderBy(asc(galleryCategories.sort_order))

  // For each category, if thumbnail_url is missing, get the latest photo
  const categoriesWithThumb = await Promise.all(
    categoriesList.map(async (cat) => {
      if (cat.thumbnail_url) return { ...cat, fallback_url: null }

      const [latestPhoto] = await db
        .select({ url: gallery.image_url })
        .from(gallery)
        .where(eq(gallery.category_id, cat.id))
        .orderBy(desc(gallery.created_at))
        .limit(1)

      return { ...cat, fallback_url: latestPhoto?.url || null }
    })
  )

  return c.json({ success: true, data: categoriesWithThumb })
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
