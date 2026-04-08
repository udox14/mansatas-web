import { Hono } from 'hono'
import { eq, desc, and, sql } from 'drizzle-orm'
import { getDB } from '../db'
import { achievements, articles } from '../db/schema'
import type { AppEnv } from '../index'

const achievementsRoute = new Hono<AppEnv>()

// GET /api/achievements/years — Get unique years for the filter
achievementsRoute.get('/years', async (c) => {
  const db = getDB(c.env.DB)
  
  const rows = await db
    .select({ year: achievements.year })
    .from(achievements)
    .groupBy(achievements.year)
    .orderBy(desc(achievements.year))

  return c.json({ success: true, data: rows.map(r => r.year) })
})

// GET /api/achievements — Public list with year filtering
achievementsRoute.get('/', async (c) => {
  const db = getDB(c.env.DB)
  const year = c.req.query('year')
  const limit = c.req.query('limit')
  
  const conditions = []
  if (year) {
    conditions.push(eq(achievements.year, parseInt(year, 10)))
  }

  const where = and(...conditions)

  let query = db
    .select({
      id: achievements.id,
      title: achievements.title,
      rank: achievements.rank,
      organizer: achievements.organizer,
      location: achievements.location,
      date: achievements.date,
      year: achievements.year,
      image_url: achievements.image_url,
      article_slug: articles.slug, // To link to news
    })
    .from(achievements)
    .leftJoin(articles, eq(achievements.article_id, articles.id))
    .where(where)
    .orderBy(desc(achievements.date))

  if (limit) {
    query = query.limit(parseInt(limit, 10)) as any
  }

  const rows = await query

  return c.json({ success: true, data: rows })
})

export default achievementsRoute
