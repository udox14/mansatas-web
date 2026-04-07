/* ============================================
   API Response wrapper
   ============================================ */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/* ============================================
   Auth
   ============================================ */
export interface User {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'editor'
  is_active: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

/* ============================================
   Hero Slides
   ============================================ */
export interface HeroSlide {
  id: string
  image_url: string
  title: string | null
  description: string | null
  button_text: string | null
  button_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface HeroSettings {
  id: string
  text_mode: 'static' | 'dynamic'
  static_title: string | null
  static_description: string | null
  static_button_text: string | null
  static_button_url: string | null
  updated_at: string
}

/* ============================================
   Articles
   ============================================ */
export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  thumbnail_url: string | null
  status: 'draft' | 'published'
  is_deleted: boolean
  author_id: string
  author_name?: string
  category_id: string | null
  category_name?: string
  category_slug?: string
  created_at: string
  updated_at: string
}

export interface ArticleListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  thumbnail_url: string | null
  status: 'draft' | 'published'
  author_name: string
  category_name: string | null
  category_slug: string | null
  created_at: string
}

/* ============================================
   Categories
   ============================================ */
export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface NewCategory {
  name: string
  slug: string
}

/* ============================================
   Programs & Facilities (Bento Grid)
   ============================================ */
export interface Program {
  id: string
  title: string
  description: string
  icon: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

/* ============================================
   Gallery
   ============================================ */
export interface GalleryImage {
  id: string
  image_url: string
  caption: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

/* ============================================
   Contact / Inbox
   ============================================ */
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

/* ============================================
   GTK (Teachers & Staff)
   ============================================ */
export interface Gtk {
  id: string
  name: string
  nip: string | null
  gender: 'L' | 'P'
  position: string
  subject: string | null
  image_url: string | null
  is_featured: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}