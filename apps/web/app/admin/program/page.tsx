'use client'

import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import ImageUploader from '@/components/admin/image-uploader'
import { api } from '@/lib/api'
import type { Program } from '@/types'

const ICONS = ['BookOpen', 'FlaskConical', 'Globe', 'Trophy', 'GraduationCap', 'Microscope', 'Palette', 'Users', 'Star', 'Laptop']

export default function AdminProgramPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState({ title: '', description: '', icon: 'GraduationCap', image_url: '', sort_order: 0 })

  const fetch = () => {
    api.get<{ data: Program[] }>('/api/admin/programs')
      .then((r) => setPrograms(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ title: '', description: '', icon: 'GraduationCap', image_url: '', sort_order: 0 })
  }

  const startEdit = (p: Program) => {
    setEditing(p)
    setForm({ title: p.title, description: p.description, icon: p.icon, image_url: p.image_url || '', sort_order: p.sort_order })
  }

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) return alert('Judul dan deskripsi wajib.')
    try {
      if (editing) {
        await api.put(`/api/admin/programs/${editing.id}`, { ...form, image_url: form.image_url || null })
      } else {
        await api.post('/api/admin/programs', { ...form, image_url: form.image_url || null })
      }
      resetForm()
      fetch()
    } catch { alert('Gagal menyimpan.') }
  }

  const remove = async (id: string) => {
    if (!confirm('Hapus program ini?')) return
    await api.delete(`/api/admin/programs/${id}`)
    fetch()
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white">
            {editing ? 'Edit Program' : 'Tambah Program'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Judul</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
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
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Gambar (opsional)</label>
            <ImageUploader value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} folder="programs" />
          </div>
          <div className="flex gap-3">
            <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600">
              <Save size={16} /> {editing ? 'Perbarui' : 'Tambah'}
            </button>
            {editing && <button onClick={resetForm} className="px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Batal</button>}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {programs.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white text-sm">{p.title}</p>
                <p className="text-xs text-slate-400 line-clamp-1">{p.description}</p>
              </div>
              <button onClick={() => startEdit(p)} className="text-xs text-blue-500 hover:underline">Edit</button>
              <button onClick={() => remove(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
