import { Hono } from 'hono'
import { eq, and, like, desc, sql } from 'drizzle-orm'
import { getDB } from '../db'
import { articles, users, categories, articleComments } from '../db/schema'
import type { AppEnv } from '../index'

const articlesRoute = new Hono<AppEnv>()

/* ============================================
   GET /api/articles
   Public — list published articles
   Query params: ?page=1&limit=9&search=keyword
   ============================================ */
articlesRoute.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '9', 10)))
  const search = c.req.query('search')?.trim() || ''
  const categorySlug = c.req.query('category') || ''
  const offset = (page - 1) * limit

  // Base conditions: published + not deleted
  const conditions = [
    eq(articles.status, 'published'),
    eq(articles.is_deleted, false),
  ]

  // Search by title
  if (search) {
    conditions.push(like(articles.title, `%${search}%`))
  }

  // Filter by category slug
  if (categorySlug) {
    conditions.push(eq(categories.slug, categorySlug))
  }

  const where = and(...conditions)

  // Count total
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(where)

  const total = countResult?.count || 0

  // Fetch articles with author name
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      thumbnail_url: articles.thumbnail_url,
      status: articles.status,
      author_name: users.name,
      category_name: categories.name,
      category_slug: categories.slug,
      created_at: articles.created_at,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author_id, users.id))
    .leftJoin(categories, eq(articles.category_id, categories.id))
    .where(where)
    .orderBy(desc(articles.created_at))
    .limit(limit)
    .offset(offset)

  return c.json({
    success: true,
    data: rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

/* ============================================
   GET /api/articles/:slug
   Public — article detail by slug
   ============================================ */
articlesRoute.get('/:slug', async (c) => {
  const db = getDB(c.env.DB)
  const slug = c.req.param('slug')

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      thumbnail_url: articles.thumbnail_url,
      status: articles.status,
      author_name: users.name,
      category_name: categories.name,
      category_slug: categories.slug,
      created_at: articles.created_at,
      updated_at: articles.updated_at,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author_id, users.id))
    .leftJoin(categories, eq(articles.category_id, categories.id))
    .where(
      and(
        eq(articles.slug, slug),
        eq(articles.status, 'published'),
        eq(articles.is_deleted, false)
      )
    )
    .limit(1)

  if (!article) {
    return c.json(
      { success: false, message: 'Artikel tidak ditemukan.' },
      404
    )
  }

  return c.json({ success: true, data: article })
})

/* ============================================
   GET /api/articles/:id/comments
   Public — list approved comments for an article
   ============================================ */
articlesRoute.get('/:id/comments', async (c) => {
  const db = getDB(c.env.DB)
  const articleId = c.req.param('id')

  const rows = await db
    .select()
    .from(articleComments)
    .where(
      and(
        eq(articleComments.article_id, articleId),
        eq(articleComments.is_approved, true),
        eq(articleComments.is_deleted, false)
      )
    )
    .orderBy(desc(articleComments.created_at))

  return c.json({ success: true, data: rows })
})

/* ============================================
   POST /api/articles/:id/comments
   Public — submit a new comment
   ============================================ */
articlesRoute.post('/:id/comments', async (c) => {
  const db = getDB(c.env.DB)
  const articleId = c.req.param('id')
  const body = await c.req.json()

  if (!body.user_name || !body.content) {
    return c.json({ success: false, message: 'Nama dan komentar wajib diisi.' }, 400)
  }

  const newComment = {
    id: crypto.randomUUID(),
    article_id: articleId,
    user_name: body.user_name,
    user_ig: body.user_ig || null,
    content: body.content,
    is_approved: false, // Default: need moderation
    is_deleted: false,
  }

  await db.insert(articleComments).values(newComment)

  return c.json({
    success: true,
    message: 'Komentar berhasil dikirim dan menunggu moderasi.',
    data: newComment,
  })
})

export default articlesRoute
