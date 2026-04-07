'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, FolderCog, Star } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import ImageUploader from '@/components/admin/image-uploader'
import { api, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { GalleryImage, GalleryCategory } from '@/types'

export default function AdminGalleryPage() {
  const confirm = useConfirm()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [newUrl, setNewUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [newCatId, setNewCatId] = useState('')
  const [newFeatured, setNewFeatured] = useState(false)

  const fetch = async () => {
    try {
      const [imgRes, catRes] = await Promise.all([
        api.get<{ data: GalleryImage[] }>('/api/admin/gallery'),
        api.get<{ data: GalleryCategory[] }>('/api/admin/gallery/categories')
      ])
      setImages(imgRes.data)
      setCategories(catRes.data)
    } catch {
      toast.error('Gagal mengambil data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const add = async () => {
    if (!newUrl) return toast.error('Upload gambar terlebih dahulu.')
    if (!newCatId) return toast.error('Pilih kategori terlebih dahulu.')
    try {
      await api.post('/api/admin/gallery', { 
        image_url: newUrl, 
        caption: newCaption || null, 
        category_id: newCatId,
        is_featured: newFeatured,
        sort_order: 0 
      })
      setNewUrl('')
      setNewCaption('')
      setNewFeatured(false)
      toast.success('Foto berhasil ditambahkan.')
      fetch()
    } catch { toast.error('Gagal menambah foto.') }
  }

  const remove = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Foto',
      message: 'Apakah Anda yakin ingin menghapus foto ini?',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/api/admin/gallery/${id}`)
      toast.success('Foto berhasil dihapus.')
      fetch()
    } catch {
      toast.error('Gagal menghapus foto.')
    }
  }

  const toggleFeatured = async (img: GalleryImage) => {
    try {
      await api.put(`/api/admin/gallery/${img.id}`, { is_featured: !img.is_featured })
      toast.success('Status unggulan diperbarui.')
      fetch()
    } catch { toast.error('Gagal memperbarui status.') }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white uppercase tracking-tight">Manajemen Galeri</h2>
          <Link 
            href="/admin/galeri/kategori"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-primary-500 hover:text-white transition-all shadow-sm"
          >
            <FolderCog size={18} />
            Kelola Kategori
          </Link>
        </div>

        {/* Upload Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus size={20} className="text-primary-500" /> Tambah Foto Baru
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ImageUploader value={newUrl} onChange={setNewUrl} folder="gallery" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kategori</label>
                <select 
                  value={newCatId} 
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Keterangan Foto</label>
                <textarea 
                  value={newCaption} 
                  onChange={(e) => setNewCaption(e.target.value)} 
                  placeholder="Ceritakan momen dalam foto ini..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex items-center gap-3 py-1">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={newFeatured} 
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-primary-500 border-slate-300 focus:ring-primary-500 pointer-events-auto"
                />
                <label htmlFor="featured" className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                  <Star size={16} className={newFeatured ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
                  Tampilkan di Marquee Beranda
                </label>
              </div>
              <button 
                onClick={add} 
                className="w-full h-11 flex items-center justify-center gap-2 bg-primary-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-500/20"
              >
                Upload Foto
              </button>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {images.map((img) => {
            const src = img.image_url.startsWith('/') ? `${API_URL}${img.image_url}` : img.image_url
            const cat = categories.find(c => c.id === img.category_id)
            return (
              <div key={img.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <img src={src} alt={img.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {img.is_featured && (
                      <div className="px-2 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-1 uppercase tracking-tighter">
                        <Star size={10} className="fill-white" /> Featured
                      </div>
                    )}
                    <div className="px-2 py-1 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-black rounded-lg shadow-sm uppercase tracking-tighter line-clamp-1 max-w-[120px]">
                      {cat?.name || 'No Category'}
                    </div>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 px-4">
                    <button 
                      onClick={() => toggleFeatured(img)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 shadow-lg",
                        img.is_featured ? "bg-amber-500 text-white" : "bg-white text-slate-900 hover:bg-amber-400"
                      )}
                      title={img.is_featured ? "Hapus dari Beranda" : "Jadikan Unggulan Beranda"}
                    >
                      <Star size={20} className={img.is_featured ? "fill-white" : ""} />
                    </button>
                    <button 
                      onClick={() => remove(img.id)}
                      className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-90 shadow-lg"
                      title="Hapus Foto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                {img.caption && (
                  <div className="p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
                      "{img.caption}"
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {images.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-slate-400 font-medium">Belum ada foto yang diunggah.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
