'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Loader2, Star, Search, User } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import ImageUploader from '@/components/admin/image-uploader'
import { api, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import type { Gtk, ApiResponse } from '@/types'

export default function AdminGtkPage() {
  const confirm = useConfirm()
  const [gtkList, setGtkList] = useState<Gtk[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Gtk | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    nip: '',
    position: '',
    subject: '',
    gender: 'L' as 'L' | 'P',
    image_url: '',
    is_featured: false,
    sort_order: 0,
  })

  const fetch = () => {
    api.get<ApiResponse<Gtk[]>>('/api/admin/gtk')
      .then((r) => setGtkList(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({
      name: '',
      nip: '',
      position: '',
      subject: '',
      gender: 'L',
      image_url: '',
      is_featured: false,
      sort_order: 0,
    })
  }

  const startEdit = (item: Gtk) => {
    setEditing(item)
    setForm({
      name: item.name,
      nip: item.nip || '',
      position: item.position,
      subject: item.subject || '',
      gender: item.gender,
      image_url: item.image_url || '',
      is_featured: item.is_featured,
      sort_order: item.sort_order,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async () => {
    if (!form.name.trim() || !form.position.trim()) return toast.error('Nama dan Jabatan wajib diisi.')
    
    try {
      if (editing) {
        await api.put(`/api/admin/gtk/${editing.id}`, {
          ...form,
          nip: form.nip || null,
          subject: form.subject || null,
          image_url: form.image_url || null,
        })
        toast.success('Data GTK berhasil diperbarui.')
      } else {
        await api.post('/api/admin/gtk', {
          ...form,
          nip: form.nip || null,
          subject: form.subject || null,
          image_url: form.image_url || null,
        })
        toast.success('GTK berhasil ditambahkan.')
      }
      resetForm()
      fetch()
    } catch {
      toast.error('Gagal menyimpan data GTK.')
    }
  }

  const toggleFeatured = async (item: Gtk) => {
    const featuredCount = gtkList.filter(g => g.is_featured && g.id !== item.id).length
    if (!item.is_featured && featuredCount >= 6) {
      return toast.error('Maksimal 6 tokoh utama yang bisa ditampilkan di Beranda.')
    }

    try {
      await api.put(`/api/admin/gtk/${item.id}`, { is_featured: !item.is_featured })
      toast.success(item.is_featured ? 'Dihapus dari tokoh utama.' : 'Dijadikan tokoh utama.')
      fetch()
    } catch {
      toast.error('Gagal mengubah status tokoh utama.')
    }
  }

  const remove = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Data GTK',
      message: 'Apakah Anda yakin ingin menghapus data ini?',
      variant: 'danger',
    })
    if (!ok) return

    try {
      await api.delete(`/api/admin/gtk/${id}`)
      toast.success('Data GTK berhasil dihapus.')
      fetch()
    } catch {
      toast.error('Gagal menghapus data.')
    }
  }

  const filtered = gtkList.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    (g.nip?.toLowerCase().includes(search.toLowerCase())) ||
    g.position.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Form */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
            <h3 className="font-heading font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User size={18} className="text-primary-500" />
              {editing ? 'Edit GTK' : 'Tambah GTK'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Drs. H. Ahmad..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">NIP/NPK/PegID</label>
                  <input 
                    type="text" 
                    value={form.nip} 
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Gender</label>
                  <select 
                    value={form.gender} 
                    onChange={(e) => setForm({ ...form, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Jabatan</label>
                <input 
                  type="text" 
                  value={form.position} 
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="Contoh: Guru Madya / Ka. Lab"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mata Pelajaran</label>
                <input 
                  type="text" 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Kosongkan jika bukan guru"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Foto (3:4 Portrait)</label>
                <ImageUploader 
                  value={form.image_url} 
                  onChange={(v) => setForm({ ...form, image_url: v })} 
                  folder="gtk" 
                  className="!h-32"
                />
              </div>

              <div className="pt-6">
                <button 
                  onClick={save} 
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 text-white text-sm font-bold rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  {editing ? 'Perbarui Data' : 'Tambah Data'}
                </button>
                {editing && (
                  <button 
                    onClick={resetForm} 
                    className="w-full mt-3 px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Batalkan Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* Action Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Cari nama, NIP, atau jabatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 shadow-sm"
              />
            </div>

            <Link
              href="/admin/gtk/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md active:scale-95"
            >
              <Plus size={18} />
              Import dari Excel
            </Link>
          </div>

          {/* List Table/Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">GTK Member</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Beranda</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filtered.length > 0 ? (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <User size={20} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-heading font-bold text-slate-900 dark:text-white text-sm truncate">{item.name}</p>
                              <p className="text-[10px] font-medium text-slate-400 tracking-wider">NIP: {item.nip || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.position}</p>
                          <p className="text-[11px] text-slate-400 italic">{item.subject || '-'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => toggleFeatured(item)}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              item.is_featured 
                                ? "bg-amber-50 text-amber-500 dark:bg-amber-900/30" 
                                : "text-slate-300 dark:text-slate-700 hover:text-amber-400"
                            )}
                          >
                            <Star size={18} fill={item.is_featured ? "currentColor" : "none"} />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEdit(item)} 
                              className="px-3 py-1.5 text-xs font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => remove(item.id)} 
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-sm text-slate-400 italic">
                        Belum ada data GTK atau tidak ditemukan hasil pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
