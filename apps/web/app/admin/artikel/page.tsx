'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Trash2, RotateCcw, Eye, EyeOff, Pencil, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import type { ArticleListItem } from '@/types'

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<(ArticleListItem & { is_deleted?: boolean })[]>([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (showDeleted) params.set('deleted', 'true')
      const res = await api.get<{ data: any[]; meta: any }>(`/api/admin/articles?${params}`)
      setArticles(res.data)
      setMeta(res.meta)
    } catch { setArticles([]) }
    finally { setLoading(false) }
  }, [page, search, status, showDeleted])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'published' ? 'draft' : 'published'
    await api.patch(`/api/admin/articles/${id}/status`, { status: newStatus })
    fetchArticles()
  }

  const softDelete = async (id: string) => {
    if (!confirm('Hapus artikel ini?')) return
    await api.delete(`/api/admin/articles/${id}`)
    fetchArticles()
  }

  const restore = async (id: string) => {
    await api.patch(`/api/admin/articles/${id}/restore`, {})
    fetchArticles()
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Artikel</h2>
            <p className="text-sm text-slate-500">{meta.total} artikel</p>
          </div>
          <Link href="/admin/artikel/baru"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-all">
            <Plus size={16} /> Tulis Artikel
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cari judul..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} className="rounded" />
            Tampilkan terhapus
          </label>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-500" size={24} /></div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">Belum ada artikel.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Judul</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Tanggal</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {articles.map((a) => (
                    <tr key={a.id} className={cn(a.is_deleted && 'opacity-50')}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.author_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                          a.status === 'published' ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
                          a.is_deleted && 'bg-red-50 text-red-600'
                        )}>
                          {a.is_deleted ? 'Terhapus' : a.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(a.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {a.is_deleted ? (
                            <button onClick={() => restore(a.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg" title="Pulihkan">
                              <RotateCcw size={15} />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => toggleStatus(a.id, a.status)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                title={a.status === 'published' ? 'Jadikan Draft' : 'Publish'}>
                                {a.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                              <Link href={`/admin/artikel/edit?id=${a.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg" title="Edit">
                                <Pencil size={15} />
                              </Link>
                              <button onClick={() => softDelete(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg" title="Hapus">
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
