import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDB } from '../db'
import { programs } from '../db/schema'
import type { AppEnv } from '../index'

const programsRoute = new Hono<AppEnv>()

/* ============================================
   GET /api/programs
   Public — list active programs (bento grid)
   ============================================ */
programsRoute.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const rows = await db
    .select()
    .from(programs)
    .where(eq(programs.is_active, true))
    .orderBy(asc(programs.sort_order))

  return c.json({ success: true, data: rows })
})

export default programsRoute
