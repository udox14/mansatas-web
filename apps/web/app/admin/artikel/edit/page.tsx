'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/admin-layout'
import TiptapEditor from '@/components/admin/tiptap-editor'
import ImageUploader from '@/components/admin/image-uploader'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function EditArticlePage() {
  return (
    <Suspense fallback={<AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>}>
      <EditArticleContent />
    </Suspense>
  )
}

function EditArticleContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get<{ data: any }>(`/api/admin/articles/${id}`)
      .then((res) => {
        const a = res.data
        setTitle(a.title)
        setExcerpt(a.excerpt || '')
        setContent(a.content)
        setThumbnail(a.thumbnail_url || '')
        setStatus(a.status)
      })
      .catch(() => toast.error('Artikel tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [id])

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
      await api.put(`/api/admin/articles/${id}`, {
        title, excerpt, content, thumbnail_url: thumbnail || null, status,
      })
      toast.success('Artikel berhasil diperbarui!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan artikel.')
    } finally { setSaving(false) }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/artikel" className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Edit Artikel</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Judul</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ringkasan</label>
            <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Thumbnail</label>
            <ImageUploader value={thumbnail} onChange={setThumbnail} folder="articles" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Konten</label>
            <TiptapEditor content={content} onChange={setContent} onUploadImage={handleUploadImage} />
          </div>
          <div className="flex items-center justify-between pt-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
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
