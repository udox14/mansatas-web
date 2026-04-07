import { Hono } from 'hono'
import { eq, and, asc, desc, sql, or, like } from 'drizzle-orm'
import { getDB } from '../db'
import { gtk } from '../db/schema'
import type { AppEnv } from '../index'

const gtkRoute = new Hono<AppEnv>()

/* ============================================
   GET /api/gtk
   Public — list all active GTK members
   Query params: ?search=...&gender=...&subject=...&position=...
   ============================================ */
gtkRoute.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const search = c.req.query('search')?.trim() || ''
  const gender = c.req.query('gender') || ''
  const subject = c.req.query('subject') || ''
  const position = c.req.query('position') || ''

  const conditions = [eq(gtk.is_active, true)]

  if (search) {
    conditions.push(or(
      like(gtk.name, `%${search}%`),
      like(gtk.nip, `%${search}%`)
    ) as any)
  }

  if (gender) {
    conditions.push(eq(gtk.gender, gender as 'L' | 'P'))
  }

  if (subject) {
    conditions.push(like(gtk.subject, `%${subject}%`))
  }

  if (position) {
    conditions.push(like(gtk.position, `%${position}%`))
  }

  const where = and(...conditions)

  const rows = await db
    .select()
    .from(gtk)
    .where(where)
    .orderBy(asc(gtk.sort_order), asc(gtk.name))

  return c.json({
    success: true,
    data: rows,
  })
})

/* ============================================
   GET /api/gtk/featured
   Public — list featured GTK members (for home page)
   ============================================ */
gtkRoute.get('/featured', async (c) => {
  const db = getDB(c.env.DB)

  const rows = await db
    .select()
    .from(gtk)
    .where(and(eq(gtk.is_featured, true), eq(gtk.is_active, true)))
    .orderBy(asc(gtk.sort_order), asc(gtk.name))
    .limit(6)

  return c.json({
    success: true,
    data: rows,
  })
})

export default gtkRoute
