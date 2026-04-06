'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import ImageUploader from '@/components/admin/image-uploader'
import { api, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import type { GalleryImage } from '@/types'

export default function AdminGalleryPage() {
  const confirm = useConfirm()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')

  const fetch = () => {
    api.get<{ data: GalleryImage[] }>('/api/admin/gallery')
      .then((r) => setImages(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const add = async () => {
    if (!newUrl) return toast.error('Upload gambar terlebih dahulu.')
    try {
      await api.post('/api/admin/gallery', { image_url: newUrl, caption: newCaption || null, sort_order: images.length })
      setNewUrl('')
      setNewCaption('')
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

  const toggle = async (img: GalleryImage) => {
    await api.put(`/api/admin/gallery/${img.id}`, { is_active: !img.is_active })
    fetch()
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        {/* Upload */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white">Tambah Foto</h3>
          <ImageUploader value={newUrl} onChange={setNewUrl} folder="gallery" />
          <input type="text" value={newCaption} onChange={(e) => setNewCaption(e.target.value)} placeholder="Keterangan (opsional)"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
          <button onClick={add} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600">
            <Plus size={16} /> Tambah
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => {
            const src = img.image_url.startsWith('/') ? `${API_URL}${img.image_url}` : img.image_url
            return (
              <div key={img.id} className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group ${!img.is_active ? 'opacity-50' : ''}`}>
                <img src={src} alt={img.caption || ''} className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => toggle(img)} className="px-2 py-1 bg-white/90 text-xs rounded-lg font-medium">
                    {img.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => remove(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
                {img.caption && <p className="px-2 py-1.5 text-xs text-slate-500 truncate">{img.caption}</p>}
              </div>
            )
          })}
        </div>
        {images.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Belum ada foto di galeri.</p>}
      </div>
    </AdminLayout>
  )
}
