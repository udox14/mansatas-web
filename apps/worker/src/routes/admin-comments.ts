import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'
import { getDB } from '../db'
import { articleComments, articles } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminCommentsRoute = new Hono<AppEnv>()

// Protect all admin routes
adminCommentsRoute.use('*', requireAuth)

/**
 * GET /api/admin/comments
 * List all comments for moderation
 */
adminCommentsRoute.get('/', async (c) => {
  const db = getDB(c.env.DB)
  
  const rows = await db
    .select({
      id: articleComments.id,
      article_title: articles.title,
      user_name: articleComments.user_name,
      user_ig: articleComments.user_ig,
      content: articleComments.content,
      is_approved: articleComments.is_approved,
      is_deleted: articleComments.is_deleted,
      created_at: articleComments.created_at,
    })
    .from(articleComments)
    .leftJoin(articles, eq(articleComments.article_id, articles.id))
    .where(eq(articleComments.is_deleted, false))
    .orderBy(desc(articleComments.created_at))

  return c.json({ success: true, data: rows })
})

/**
 * PATCH /api/admin/comments/:id/approve
 * Approve a comment
 */
adminCommentsRoute.patch('/:id/approve', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  await db
    .update(articleComments)
    .set({ is_approved: true })
    .where(eq(articleComments.id, id))

  return c.json({ success: true, message: 'Komentar disetujui.' })
})

/**
 * DELETE /api/admin/comments/:id
 * Soft delete a comment
 */
adminCommentsRoute.delete('/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  await db
    .update(articleComments)
    .set({ is_deleted: true })
    .where(eq(articleComments.id, id))

  return c.json({ success: true, message: 'Komentar dihapus.' })
})

export default adminCommentsRoute
