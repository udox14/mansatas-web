'use client'

import { useEffect, useState } from 'react'
import { 
  Trophy, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  MapPin, 
  Building2, 
  ChevronDown,
  Download,
  FileSpreadsheet,
  Upload,
  X,
  Save
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin/admin-layout'
import { api, API_URL } from '@/lib/api'
import type { Achievement, ApiResponse, ArticleListItem, PaginatedResponse } from '@/types'
import ImageUploader from '@/components/admin/image-uploader'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'

interface ImportAchievement {
  id: string
  title: string
  rank: string
  organizer: string
  location: string
  date: string
  year: number
  image_url: string
  article_slug: string
  article_id: string
}

async function downloadTemplate() {
  const XLSX = await import('xlsx')
  const header = [
    'Nama Lomba / Prestasi *',
    'Peringkat',
    'Penyelenggara',
    'Tempat Pelaksanaan',
    'Tanggal (YYYY-MM-DD)',
    'Tahun *',
    'URL Foto',
    'Slug Artikel Terkait',
  ]
  const examples = [
    ['Juara 1 Olimpiade Matematika Tingkat Kabupaten', 'Juara 1', 'Kementerian Agama Kabupaten Tasikmalaya', 'Tasikmalaya', '2024-05-21', 2024, '', 'juara-olimpiade-matematika-2024'],
    ['Medali Perak KSM Fisika', 'Medali Perak', 'Kementerian Agama Provinsi Jawa Barat', 'Bandung', '2023-08-12', 2023, 'https://contoh.sch.id/foto-prestasi.jpg', ''],
  ]

  const ws = XLSX.utils.aoa_to_sheet([header, ...examples])
  ws['!cols'] = [
    { wch: 45 },
    { wch: 18 },
    { wch: 38 },
    { wch: 28 },
    { wch: 20 },
    { wch: 12 },
    { wch: 36 },
    { wch: 32 },
  ]
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data Prestasi')
  XLSX.writeFile(wb, 'template_import_prestasi.xlsx')
}

function formatExcelDate(value: unknown): string {
  if (!value) return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000))
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
  }
  const text = String(value).trim()
  if (!text) return ''
  const normalized = text.replace(/\//g, '-')
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(normalized)) {
    const [year, month, day] = normalized.split('-')
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return ''
}

async function parseExcelFile(file: File, articles: ArticleListItem[]): Promise<ImportAchievement[]> {
  const XLSX = await import('xlsx')
  const data = await file.arrayBuffer()
  const wb = XLSX.read(data, { type: 'array', cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const articlesBySlug = new Map(articles.map((article) => [article.slug, article.id]))

  const items: ImportAchievement[] = []
  for (const row of rows.slice(1)) {
    const title = String(row[0] ?? '').trim()
    const year = parseInt(String(row[5] ?? ''), 10)
    if (!title && !String(row[1] ?? '').trim() && !String(row[2] ?? '').trim()) continue
    if (!title || !Number.isInteger(year)) continue

    const articleSlug = String(row[7] ?? '').trim()
    items.push({
      id: crypto.randomUUID(),
      title,
      rank: String(row[1] ?? '').trim(),
      organizer: String(row[2] ?? '').trim(),
      location: String(row[3] ?? '').trim(),
      date: formatExcelDate(row[4]),
      year,
      image_url: String(row[6] ?? '').trim(),
      article_slug: articleSlug,
      article_id: articleSlug ? articlesBySlug.get(articleSlug) || '' : '',
    })
  }

  return items
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importItems, setImportItems] = useState<ImportAchievement[]>([])
  const [importing, setImporting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [fileName, setFileName] = useState('')
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

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Format file harus Excel (.xlsx atau .xls).')
      return
    }

    setParsing(true)
    setFileName(file.name)
    try {
      const parsed = await parseExcelFile(file, articles)
      if (parsed.length === 0) {
        toast.error('Tidak ada data valid. Pastikan memakai template prestasi.')
        return
      }
      setImportItems(parsed)
      setImportOpen(true)
      toast.success(`${parsed.length} data prestasi berhasil dibaca.`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal membaca file Excel.')
    } finally {
      setParsing(false)
    }
  }

  const updateImportItem = (id: string, field: keyof ImportAchievement, value: string | number) => {
    setImportItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const next = { ...item, [field]: value }
      if (field === 'article_slug') {
        next.article_id = articles.find((article) => article.slug === value)?.id || ''
      }
      return next
    }))
  }

  const removeImportItem = (id: string) => {
    setImportItems(prev => prev.filter(item => item.id !== id))
  }

  const submitImport = async () => {
    const validItems = importItems.filter(item => item.title.trim() && Number.isInteger(item.year))
    if (validItems.length === 0) {
      toast.error('Tidak ada data valid untuk disimpan.')
      return
    }

    setImporting(true)
    try {
      await api.post('/api/admin/achievements/batch', validItems.map(item => ({
        title: item.title,
        rank: item.rank,
        organizer: item.organizer,
        location: item.location,
        date: item.date || null,
        year: item.year,
        image_url: item.image_url,
        article_id: item.article_id,
      })))
      toast.success(`${validItems.length} data prestasi berhasil diimport.`)
      setImportOpen(false)
      setImportItems([])
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Gagal import prestasi.')
    } finally {
      setImporting(false)
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadTemplate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
            >
              <Download size={17} />
              Template
            </button>
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-500/20 active:scale-95 whitespace-nowrap cursor-pointer">
              {parsing ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
              Import Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} disabled={parsing} />
            </label>
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

      {importOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
            <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-heading font-black text-slate-900 dark:text-white">Review Import Prestasi</h2>
                <p className="text-xs text-slate-500 mt-1">{importItems.length} data dari {fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[260px]">Prestasi</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[140px]">Peringkat</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[180px]">Penyelenggara</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[150px]">Tempat</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[140px]">Tanggal</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[90px]">Tahun</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[190px]">Slug Artikel</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {importItems.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <input value={item.title} onChange={(e) => updateImportItem(item.id, 'title', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-primary-400 outline-none px-2 py-1 font-semibold text-slate-900 dark:text-white rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={item.rank} onChange={(e) => updateImportItem(item.id, 'rank', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-primary-400 outline-none px-2 py-1 text-slate-600 dark:text-slate-300 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={item.organizer} onChange={(e) => updateImportItem(item.id, 'organizer', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-primary-400 outline-none px-2 py-1 text-slate-600 dark:text-slate-300 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={item.location} onChange={(e) => updateImportItem(item.id, 'location', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-primary-400 outline-none px-2 py-1 text-slate-600 dark:text-slate-300 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" value={item.date} onChange={(e) => updateImportItem(item.id, 'date', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-primary-400 outline-none px-2 py-1 text-slate-600 dark:text-slate-300 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" value={item.year} onChange={(e) => updateImportItem(item.id, 'year', parseInt(e.target.value, 10) || new Date().getFullYear())}
                          className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-primary-400 outline-none px-2 py-1 text-slate-600 dark:text-slate-300 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={item.article_slug} onChange={(e) => updateImportItem(item.id, 'article_slug', e.target.value)}
                          className={cn(
                            'w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-primary-400 outline-none px-2 py-1 rounded',
                            item.article_slug && !item.article_id ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'
                          )}
                          title={item.article_slug && !item.article_id ? 'Slug artikel tidak ditemukan' : undefined}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => removeImportItem(item.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Slug artikel yang merah berarti tidak cocok, data tetap bisa disimpan tanpa link artikel.
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setImportOpen(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl">
                  Batal
                </button>
                <button type="button" onClick={submitImport} disabled={importing || importItems.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                  {importing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Simpan {importItems.length} Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
