'use client'

import { useEffect, useState } from 'react'
import { 
  Check, 
  Trash2, 
  MessageSquare, 
  Instagram, 
  Clock, 
  Loader2, 
  Search,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'

interface CommentAdmin {
  id: string
  article_title: string
  user_name: string
  user_ig: string | null
  content: string
  is_approved: boolean
  created_at: string
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const confirm = useConfirm()

  const fetchComments = async () => {
    try {
      setLoading(true)
      const res = await api.get<{ data: CommentAdmin[] }>('/api/admin/comments')
      setComments(res.data)
    } catch (err) {
      toast.error('Gagal mengambil data komentar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/admin/comments/${id}/approve`, {})
      toast.success('Komentar disetujui')
      fetchComments()
    } catch (err) {
      toast.error('Gagal menyetujui komentar')
    }
  }

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Komentar',
      message: 'Apakah Anda yakin ingin menghapus komentar ini?',
    })
    if (!ok) return

    try {
      await api.delete(`/api/admin/comments/${id}`)
      toast.success('Komentar dihapus')
      fetchComments()
    } catch (err) {
      toast.error('Gagal menghapus komentar')
    }
  }

  const filteredComments = comments.filter(c => {
    const matchesSearch = c.user_name.toLowerCase().includes(search.toLowerCase()) || 
                         c.article_title?.toLowerCase().includes(search.toLowerCase()) ||
                         c.content.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'pending') return matchesSearch && !c.is_approved
    if (filter === 'approved') return matchesSearch && c.is_approved
    return matchesSearch
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-xl">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Moderasi Komentar</h2>
              <p className="text-sm text-slate-500">Kelola dan tinjau komentar dari pengunjung.</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama, artikel, atau isi komentar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  filter === f
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {f === 'all' ? 'Semua' : f === 'pending' ? 'Tertunda' : 'Disetujui'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
              <Loader2 className="animate-spin text-primary-500 mb-4" size={32} />
              <p className="text-slate-500 animate-pulse">Memuat komentar...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-2 border-dashed border-slate-200 dark:border-slate-800">
              <MessageSquare className="text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 italic">Tidak ada komentar ditemukan.</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div 
                key={comment.id}
                className={`p-5 md:p-6 rounded-3xl border transition-all ${
                  comment.is_approved 
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' 
                    : 'bg-primary-50/30 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30 ring-1 ring-primary-100/50'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-heading font-bold text-slate-900 dark:text-white">{comment.user_name}</h3>
                      {comment.user_ig && (
                        <div className="flex items-center gap-1.5 text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                          <Instagram size={12} />
                          {comment.user_ig}
                        </div>
                      )}
                      {!comment.is_approved && (
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase">
                          Menunggu Persetujuan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(comment.created_at)}
                      </span>
                      <span className="flex items-center gap-1 uppercase tracking-wider">
                        <Filter size={12} />
                        Artikel: {comment.article_title || 'N/A'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                      "{comment.content}"
                    </p>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0 md:justify-center">
                    {!comment.is_approved && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <Check size={16} />
                        Setujui
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/40 text-xs font-bold rounded-xl transition-all active:scale-95"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
