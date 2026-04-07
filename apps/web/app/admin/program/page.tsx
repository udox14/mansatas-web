'use client'

import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, Loader2, Star, Settings } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import ImageUploader from '@/components/admin/image-uploader'
import { api, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import type { Program } from '@/types'

const ICONS = ['BookOpen', 'FlaskConical', 'Globe', 'Trophy', 'GraduationCap', 'Microscope', 'Palette', 'Users', 'Star', 'Laptop']

export default function AdminProgramPage() {
  const confirm = useConfirm()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState({ title: '', description: '', icon: 'GraduationCap', image_url: '', sort_order: 0, is_featured: false, is_active: true })

  const fetch = () => {
    api.get<{ data: Program[] }>('/api/admin/programs')
      .then((r) => setPrograms(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ title: '', description: '', icon: 'GraduationCap', image_url: '', sort_order: 0, is_featured: false, is_active: true })
  }

  const startEdit = (p: Program) => {
    setEditing(p)
    setForm({ 
      title: p.title, 
      description: p.description, 
      icon: p.icon, 
      image_url: p.image_url || '', 
      sort_order: p.sort_order,
      is_featured: p.is_featured,
      is_active: p.is_active
    })
  }

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error('Judul dan deskripsi wajib diisi.')
    try {
      if (editing) {
        await api.put(`/api/admin/programs/${editing.id}`, { ...form, image_url: form.image_url || null })
        toast.success('Program berhasil diperbarui.')
      } else {
        await api.post('/api/admin/programs', { ...form, image_url: form.image_url || null })
        toast.success('Program berhasil ditambahkan.')
      }
      resetForm()
      fetch()
    } catch { toast.error('Gagal menyimpan program.') }
  }

  const remove = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Program',
      message: 'Apakah Anda yakin ingin menghapus program ini?',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/api/admin/programs/${id}`)
      toast.success('Program berhasil dihapus.')
      fetch()
    } catch {
      toast.error('Gagal menghapus program.')
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editing ? 'Edit Program' : 'Tambah Program'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Judul</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ikon</label>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
             <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_featured"
                checked={form.is_featured} 
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 pointer-events-auto"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Tampilkan di Beranda</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_active"
                checked={form.is_active} 
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 pointer-events-auto"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Status Aktif</label>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Urutan</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Gambar (Bila ada)</label>
            <ImageUploader value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} folder="programs" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-all active:scale-95 shadow-md shadow-primary-500/20">
              <Save size={16} /> {editing ? 'Simpan Perubahan' : 'Buat Program Baru'}
            </button>
            {editing && <button onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Batal</button>}
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((p) => (
            <div key={p.id} className={cn(
              "group bg-white dark:bg-slate-900 rounded-2xl border p-5 flex items-start gap-4 transition-all hover:shadow-lg",
              p.is_active ? "border-slate-200 dark:border-slate-800" : "border-slate-100 dark:border-slate-900 opacity-60"
            )}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</span>
                  {p.is_featured && <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-full">Featured</span>}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{p.description}</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => startEdit(p)} className="text-xs font-bold text-primary-600 hover:underline">Edit Detail</button>
                  <button onClick={() => remove(p.id)} className="text-xs font-bold text-red-500 hover:underline">Hapus</button>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url.startsWith('/') ? `${API_URL}${p.image_url}` : p.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                    <Star size={24} strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
