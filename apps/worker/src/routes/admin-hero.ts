import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { getDB } from '../db'
import { heroSlides, heroSettings } from '../db/schema'
import { requireAuth, requireRole } from '../middleware/auth'
import type { AppEnv } from '../index'

const adminHero = new Hono<AppEnv>()

// Semua route butuh auth admin+
adminHero.use('*', requireAuth, requireRole('superadmin', 'admin'))

/* ============================================
   GET /api/admin/hero
   Ambil semua slides (termasuk nonaktif) + settings
   ============================================ */
adminHero.get('/', async (c) => {
  const db = getDB(c.env.DB)

  const [settings] = await db
    .select()
    .from(heroSettings)
    .where(eq(heroSettings.id, 'default'))
    .limit(1)

  const slides = await db
    .select()
    .from(heroSlides)
    .orderBy(asc(heroSlides.sort_order))

  return c.json({ success: true, data: { settings, slides } })
})

/* ============================================
   PUT /api/admin/hero/settings
   Update hero text mode + static texts
   ============================================ */
adminHero.put('/settings', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json<{
    text_mode: 'static' | 'dynamic'
    static_title?: string
    static_description?: string
    static_button_text?: string
    static_button_url?: string
  }>()

  if (!body.text_mode || !['static', 'dynamic'].includes(body.text_mode)) {
    return c.json({ success: false, message: 'text_mode harus "static" atau "dynamic".' }, 400)
  }

  // Upsert — insert jika belum ada, update jika sudah
  const [existing] = await db
    .select({ id: heroSettings.id })
    .from(heroSettings)
    .where(eq(heroSettings.id, 'default'))
    .limit(1)

  if (existing) {
    await db
      .update(heroSettings)
      .set({
        text_mode: body.text_mode,
        static_title: body.static_title ?? null,
        static_description: body.static_description ?? null,
        static_button_text: body.static_button_text ?? null,
        static_button_url: body.static_button_url ?? null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(heroSettings.id, 'default'))
  } else {
    await db.insert(heroSettings).values({
      id: 'default',
      text_mode: body.text_mode,
      static_title: body.static_title ?? null,
      static_description: body.static_description ?? null,
      static_button_text: body.static_button_text ?? null,
      static_button_url: body.static_button_url ?? null,
    })
  }

  return c.json({ success: true, message: 'Pengaturan hero berhasil disimpan.' })
})

/* ============================================
   POST /api/admin/hero/slides
   Tambah slide baru
   ============================================ */
adminHero.post('/slides', async (c) => {
  const db = getDB(c.env.DB)
  const body = await c.req.json<{
    image_url: string
    title?: string
    description?: string
    button_text?: string
    button_url?: string
    sort_order?: number
  }>()

  if (body.image_url === undefined) {
    return c.json({ success: false, message: 'image_url wajib dikirim (walau kosong).' }, 400)
  }

  const id = crypto.randomUUID()

  await db.insert(heroSlides).values({
    id,
    image_url: body.image_url.trim(),
    title: body.title?.trim() || null,
    description: body.description?.trim() || null,
    button_text: body.button_text?.trim() || null,
    button_url: body.button_url?.trim() || null,
    sort_order: body.sort_order ?? 0,
    is_active: true,
  })

  return c.json({ success: true, message: 'Slide berhasil ditambahkan.', data: { id } })
})

/* ============================================
   PUT /api/admin/hero/slides/:id
   Update slide
   ============================================ */
adminHero.put('/slides/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json<{
    image_url?: string
    title?: string
    description?: string
    button_text?: string
    button_url?: string
    sort_order?: number
    is_active?: boolean
  }>()

  const [existing] = await db
    .select({ id: heroSlides.id })
    .from(heroSlides)
    .where(eq(heroSlides.id, id))
    .limit(1)

  if (!existing) {
    return c.json({ success: false, message: 'Slide tidak ditemukan.' }, 404)
  }

  await db
    .update(heroSlides)
    .set({
      ...(body.image_url !== undefined && { image_url: body.image_url.trim() }),
      ...(body.title !== undefined && { title: body.title?.trim() || null }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.button_text !== undefined && { button_text: body.button_text?.trim() || null }),
      ...(body.button_url !== undefined && { button_url: body.button_url?.trim() || null }),
      ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
    })
    .where(eq(heroSlides.id, id))

  return c.json({ success: true, message: 'Slide berhasil diperbarui.' })
})

/* ============================================
   DELETE /api/admin/hero/slides/:id
   Hapus slide + R2 object
   ============================================ */
adminHero.delete('/slides/:id', async (c) => {
  const db = getDB(c.env.DB)
  const id = c.req.param('id')

  const [slide] = await db
    .select({ id: heroSlides.id, image_url: heroSlides.image_url })
    .from(heroSlides)
    .where(eq(heroSlides.id, id))
    .limit(1)

  if (!slide) {
    return c.json({ success: false, message: 'Slide tidak ditemukan.' }, 404)
  }

  // Hapus dari R2 jika path internal
  if (slide.image_url.startsWith('/assets/')) {
    const key = slide.image_url.replace('/assets/', '')
    await c.env.BUCKET.delete(key)
  }

  await db.delete(heroSlides).where(eq(heroSlides.id, id))

  return c.json({ success: true, message: 'Slide berhasil dihapus.' })
})

export default adminHero
