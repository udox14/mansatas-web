'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Tag as TagIcon } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

export default function AdminCategoriesPage() {
  const confirm = useConfirm()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCategories = () => {
    api.get<{ data: Category[] }>('/api/admin/categories')
      .then((res) => setCategories(res.data))
      .catch(() => toast.error('Gagal memuat kategori.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleNameChange = (name: string) => {
    setNewName(name)
    setNewSlug(slugify(name))
  }

  const handleAdd = async () => {
    if (!newName.trim() || !newSlug.trim()) {
      return toast.error('Nama dan Slug wajib diisi.')
    }
    setSaving(true)
    try {
      await api.post('/api/admin/categories', { name: newName.trim(), slug: newSlug.trim() })
      setNewName('')
      setNewSlug('')
      toast.success('Kategori berhasil ditambahkan.')
      fetchCategories()
    } catch {
      toast.error('Gagal menambah kategori.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Hapus Kategori',
      message: `Apakah Anda yakin ingin menghapus kategori "${name}"? Kategori pada artikel yang menggunakan ini akan menjadi kosong.`,
      variant: 'danger',
    })
    if (!ok) return

    try {
      await api.delete(`/api/admin/categories/${id}`)
      toast.success('Kategori berhasil dihapus.')
      fetchCategories()
    } catch {
      toast.error('Gagal menghapus kategori.')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Manajemen Kategori</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kategori dinamis untuk artikel dan berita sekolah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Create */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm sticky top-24">
              <h3 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-primary-500" />
                Tambah Baru
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nama Kategori</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Prestasi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Slug (URL)</label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="prestasi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm italic"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Simpan Kategori
              </button>
            </div>
          </div>

          {/* List Categories */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-heading font-bold text-slate-900 dark:text-white">Daftar Kategori</h3>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-full">
                  {categories.length} Total
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-primary-500" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                  <TagIcon size={32} className="opacity-20" />
                  <p className="text-sm">Belum ada kategori.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {categories.map((cat) => (
                    <div key={cat.id} className="px-5 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <TagIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">/{cat.slug}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
