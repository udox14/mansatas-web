'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Save, ChevronLeft, LayoutGrid } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import ImageUploader from '@/components/admin/image-uploader'
import { api, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import Link from 'next/link'
import type { GalleryCategory, ApiResponse } from '@/types'
import { cn } from '@/lib/utils'

export default function AdminGalleryCategoriesPage() {
  const confirm = useConfirm()
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<GalleryCategory | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    sort_order: 0
  })

  const fetch = () => {
    api.get<ApiResponse<GalleryCategory[]>>('/api/admin/gallery/categories')
      .then(r => setCategories(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', thumbnail_url: '', sort_order: 0 })
  }

  const startEdit = (c: GalleryCategory) => {
    setEditing(c)
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      thumbnail_url: c.thumbnail_url || '',
      sort_order: c.sort_order
    })
  }

  const save = async () => {
    if (!form.name || !form.slug) return toast.error('Nama dan Slug wajib diisi.')
    try {
      if (editing) {
        await api.put(`/api/admin/gallery/categories/${editing.id}`, form)
        toast.success('Kategori diperbarui.')
      } else {
        await api.post('/api/admin/gallery/categories', form)
        toast.success('Kategori ditambahkan.')
      }
      resetForm()
      fetch()
    } catch {
      toast.error('Gagal menyimpan kategori.')
    }
  }

  const remove = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Kategori',
      message: 'Menghapus kategori ini TIDAK akan menghapus fotonya, tapi foto tersebut tidak akan memiliki kategori. Lanjutkan?',
      variant: 'danger'
    })
    if (!ok) return
    try {
      await api.delete(`/api/admin/gallery/categories/${id}`)
      toast.success('Kategori dihapus.')
      fetch()
    } catch {
      toast.error('Gagal menghapus kategori.')
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/galeri" className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-primary-500 transition-all">
            <ChevronLeft size={20} />
          </Link>
          <h2 className="text-2xl font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">Kategori Galeri</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-24">
              <h3 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editing ? 'Edit Kategori' : 'Kategori Baru'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nama Folder</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm({ ...form, name: val, slug: val.toLowerCase().replace(/ /g, '-') })
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-4 focus:ring-primary-500/10 transition-all"
                    placeholder="Contoh: Sarana Prasarana"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Deskripsi Singkat</label>
                  <textarea 
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Cover Folder</label>
                  <ImageUploader value={form.thumbnail_url} onChange={(v) => setForm({ ...form, thumbnail_url: v })} folder="gallery/covers" />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={save}
                    className="flex-1 h-11 flex items-center justify-center gap-2 bg-primary-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                  >
                    <Save size={16} /> {editing ? 'Update' : 'Simpan'}
                  </button>
                  {editing && (
                    <button 
                      onClick={resetForm}
                      className="px-4 h-11 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs uppercase"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 hover:shadow-lg transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                  {cat.thumbnail_url ? (
                    <img src={cat.thumbnail_url.startsWith('/') ? `${API_URL}${cat.thumbnail_url}` : cat.thumbnail_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <LayoutGrid size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">/{cat.slug}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{cat.description || 'Tidak ada deskripsi'}</p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                  <button 
                    onClick={() => startEdit(cat)}
                    className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
                  >
                    <Plus size={18} className="rotate-45" /> {/* Edit hack with plus rotate */}
                    <span className="sr-only">Edit</span>
                  </button>
                  <button 
                    onClick={() => remove(cat.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-slate-300 font-bold uppercase tracking-widest">Belum ada kategori</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
