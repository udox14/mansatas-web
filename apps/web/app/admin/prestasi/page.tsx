'use client'

import { useEffect, useState } from 'react'
import { 
  Trophy, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  Calendar, 
  MapPin, 
  Building2, 
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin/admin-layout'
import { api, API_URL } from '@/lib/api'
import type { Achievement, ApiResponse, ArticleListItem, PaginatedResponse } from '@/types'
import ImageUploader from '@/components/admin/image-uploader'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [search, setSearch] = useState('')
  const confirm = useConfirm()

  const [form, setForm] = useState({
    title: '',
    rank: '',
    organizer: '',
    location: '',
    date: '',
    year: new Date().getFullYear(),
    image_url: '',
    article_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [achRes, artRes] = await Promise.all([
        api.get<ApiResponse<Achievement[]>>('/api/admin/achievements'),
        api.get<PaginatedResponse<ArticleListItem>>('/api/articles?limit=100')
      ])
      setAchievements(achRes.data)
      setArticles(artRes.data)
    } catch (err) {
      toast.error('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/api/admin/achievements/${editing.id}`, form)
        toast.success('Prestasi berhasil diperbarui')
      } else {
        await api.post('/api/admin/achievements', form)
        toast.success('Prestasi berhasil ditambahkan')
      }
      setIsModalOpen(false)
      setEditing(null)
      setForm({
        title: '',
        rank: '',
        organizer: '',
        location: '',
        date: '',
        year: new Date().getFullYear(),
        image_url: '',
        article_id: ''
      })
      fetchData()
    } catch (err) {
      toast.error('Gagal menyimpan data')
    }
  }

  const handleEdit = (item: Achievement) => {
    setEditing(item)
    setForm({
      title: item.title,
      rank: item.rank || '',
      organizer: item.organizer || '',
      location: item.location || '',
      date: item.date || '',
      year: item.year,
      image_url: item.image_url || '',
      article_id: item.article_id || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (await confirm({ 
      title: 'Hapus prestasi ini?', 
      message: 'Tindakan ini tidak dapat dibatalkan.',
      variant: 'danger' 
    })) {
      try {
        await api.delete(`/api/admin/achievements/${id}`)
        toast.success('Prestasi berhasil dihapus')
        fetchData()
      } catch (err) {
        toast.error('Gagal menghapus data')
      }
    }
  }

  const filtered = achievements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.organizer?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari prestasi atau penyelenggara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setForm({
                title: '',
                rank: '',
                organizer: '',
                location: '',
                date: '',
                year: new Date().getFullYear(),
                image_url: '',
                article_id: ''
              })
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            Tambah Prestasi
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Prestasi</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Tahun</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Detail</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">Data prestasi belum ada or tidak ditemukan.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <Trophy size={18} className="text-primary-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</div>
                          <div className="text-xs text-primary-600 font-black uppercase tracking-wider">{item.rank || 'Prestasi'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded-lg">
                        {item.year}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                           <Building2 size={12} /> {item.organizer || '-'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                           <MapPin size={12} /> {item.location || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
            <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editing ? 'Edit Prestasi' : 'Tambah Prestasi'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                type="button"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Title & Rank */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lomba / Prestasi *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Peringkat (Misal: Juara 1)</label>
                  <input
                    type="text"
                    value={form.rank}
                    onChange={(e) => setForm({ ...form, rank: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Organizer & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Penyelenggara</label>
                  <input
                    type="text"
                    value={form.organizer}
                    onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tempat Pelaksanaan</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Date & Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tahun *</label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Related News */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hubungkan ke Berita Terkait</label>
                <div className="relative">
                  <select
                    value={form.article_id}
                    onChange={(e) => setForm({ ...form, article_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                  >
                    <option value="">-- Tidak Ada Berita --</option>
                    {articles.map(art => (
                      <option key={art.id} value={art.id}>{art.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Foto Prestasi</label>
                <ImageUploader 
                  value={form.image_url} 
                  onChange={(val) => setForm({ ...form, image_url: val })}
                  folder="prestasi"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-600/20 active:scale-[0.98]"
                >
                  {editing ? 'Simpan Perubahan' : 'Tambah Prestasi'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
