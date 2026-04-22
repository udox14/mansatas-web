import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { categories } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

import { requireAuth, requireRole } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings, Variables: any }>()
app.use('*', requireAuth, requireRole('superadmin', 'admin', 'editor'))

// List all categories
app.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  const data = await db.select().from(categories).orderBy(desc(categories.created_at))
  return c.json({ success: true, data })
})

// Create category
app.post('/', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  if (!body.name || !body.slug) {
    return c.json({ success: false, message: 'Name and Slug are required' }, 400)
  }

  const id = crypto.randomUUID()
  await db.insert(categories).values({
    id,
    name: body.name,
    slug: body.slug,
  })

  return c.json({ success: true, data: { id } })
})

// Delete category
app.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(categories).where(eq(categories.id, id))
  return c.json({ success: true })
})

export default app
