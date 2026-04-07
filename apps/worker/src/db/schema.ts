import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/* ============================================
   USERS — Admin CMS users with RBAC
   ============================================ */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // crypto.randomUUID()
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role', { enum: ['superadmin', 'admin', 'editor'] })
    .notNull()
    .default('editor'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   HERO SETTINGS — Global hero text mode config
   ============================================ */
export const heroSettings = sqliteTable('hero_settings', {
  id: text('id').primaryKey().default('default'),
  text_mode: text('text_mode', { enum: ['static', 'dynamic'] })
    .notNull()
    .default('static'),
  static_title: text('static_title').default('MAN 1 Tasikmalaya'),
  static_description: text('static_description').default(
    'Madrasah Aliyah Negeri 1 Tasikmalaya — Singaparna'
  ),
  static_button_text: text('static_button_text').default('Portal PPDB'),
  static_button_url: text('static_button_url').default('/ppdb'),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   HERO SLIDES — Slideshow images + per-slide text
   ============================================ */
export const heroSlides = sqliteTable('hero_slides', {
  id: text('id').primaryKey(),
  image_url: text('image_url').notNull(),
  title: text('title'),
  description: text('description'),
  button_text: text('button_text'),
  button_url: text('button_url'),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   CATEGORIES — Dynamic article categories
   ============================================ */
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(), // crypto.randomUUID()
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   ARTICLES — Blog / berita with soft delete
   ============================================ */
export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull().default(''),
  thumbnail_url: text('thumbnail_url'),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  is_deleted: integer('is_deleted', { mode: 'boolean' })
    .notNull()
    .default(false),
  author_id: text('author_id')
    .notNull()
    .references(() => users.id),
  category_id: text('category_id')
    .references(() => categories.id),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   PROGRAMS — Program unggulan & fasilitas
   ============================================ */
export const programs = sqliteTable('programs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull().default('GraduationCap'), // Lucide icon name
  image_url: text('image_url'),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   GALLERY — Foto kegiatan sekolah
   ============================================ */
export const gallery = sqliteTable('gallery', {
  id: text('id').primaryKey(),
  image_url: text('image_url').notNull(),
  caption: text('caption'),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   CONTACT MESSAGES — Pesan dari form kontak
   ============================================ */
export const contactMessages = sqliteTable('contact_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   GTK — Guru & Tenaga Kependidikan
   ============================================ */
export const gtk = sqliteTable('gtk', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nip: text('nip'), // NIP/NPK/PegID
  gender: text('gender', { enum: ['L', 'P'] }).notNull().default('L'),
  position: text('position').notNull(),
  subject: text('subject'),
  image_url: text('image_url'),
  is_featured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   ARTICLE COMMENTS — Komentar publik (unmoderated by default)
   ============================================ */
export const articleComments = sqliteTable('article_comments', {
  id: text('id').primaryKey(),
  article_id: text('article_id')
    .notNull()
    .references(() => articles.id),
  user_name: text('user_name').notNull(),
  user_ig: text('user_ig'), // Profil IG (opsional)
  content: text('content').notNull(),
  is_approved: integer('is_approved', { mode: 'boolean' }).notNull().default(false),
  is_deleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

/* ============================================
   Type exports for use across the app
   ============================================ */
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type HeroSetting = typeof heroSettings.$inferSelect
export type HeroSlide = typeof heroSlides.$inferSelect
export type NewHeroSlide = typeof heroSlides.$inferInsert
export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Program = typeof programs.$inferSelect
export type GalleryImage = typeof gallery.$inferSelect
export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert
export type Gtk = typeof gtk.$inferSelect
export type NewGtk = typeof gtk.$inferInsert
export type ArticleComment = typeof articleComments.$inferSelect
export type NewArticleComment = typeof articleComments.$inferInsert
