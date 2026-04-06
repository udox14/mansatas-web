import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { categories } from '../db/schema'
import { desc } from 'drizzle-orm'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// List all categories for public filter
app.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  const data = await db.select().from(categories).orderBy(desc(categories.created_at))
  return c.json({ success: true, data })
})

export default app
