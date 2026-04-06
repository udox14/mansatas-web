'use client'

import { useState, useRef, useEffect } from 'react'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/admin-layout'
import TiptapEditor from '@/components/admin/tiptap-editor'
import ImageUploader from '@/components/admin/image-uploader'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { Category } from '@/types'

export default function NewArticlePage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingCats, setLoadingCats] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<{ data: Category[] }>('/api/admin/categories')
      .then((res) => {
        setCategories(res.data)
        if (res.data.length > 0) setCategoryId(res.data[0].id)
      })
      .finally(() => setLoadingCats(false))
  }, [])

  const handleUploadImage = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return resolve(null)
        try {
          const fd = new FormData()
          fd.append('file', file)
          const res = await api.upload<{ data: { url: string } }>('/api/upload?folder=articles', fd)
          resolve(res.data.url)
        } catch { resolve(null) }
      }
      input.click()
    })
  }

  const save = async () => {
    if (!title.trim()) return toast.error('Judul wajib diisi.')
    setSaving(true)
    try {
      const res = await api.post<{ data: { id: string; slug: string } }>('/api/admin/articles', {
        title, excerpt, content, thumbnail_url: thumbnail || null, status, category_id: categoryId,
      })
      toast.success('Artikel berhasil disimpan!')
      window.location.href = `/admin/artikel/edit?id=${res.data.id}`
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan artikel.')
    } finally { setSaving(false) }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/artikel" className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Tulis Artikel Baru</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Judul</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              placeholder="Judul artikel..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ringkasan</label>
            <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
              placeholder="Ringkasan singkat (opsional)..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Thumbnail</label>
            <ImageUploader value={thumbnail} onChange={setThumbnail} folder="articles" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">Tanpa Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
              Kategori bisa dikelola di menu <Link href="/admin/kategori" className="text-primary-500 hover:underline">Manajemen Kategori</Link>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Konten</label>
            <TiptapEditor content={content} onChange={setContent} onUploadImage={handleUploadImage} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
              <option value="draft">Simpan sebagai Draft</option>
              <option value="published">Publish Langsung</option>
            </select>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
