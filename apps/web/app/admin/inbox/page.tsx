'use client'

import { useEffect, useState } from 'react'
import { Mail, MailOpen, Trash2, Loader2, ChevronLeft } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import type { ContactMessage } from '@/types'

export default function AdminInboxPage() {
  const confirm = useConfirm()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetch = () => {
    api.get<{ data: ContactMessage[]; meta: { unreadCount: number } }>('/api/admin/inbox?limit=50')
      .then((r) => { setMessages(r.data); setUnreadCount(r.meta.unreadCount) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const openMessage = async (msg: ContactMessage) => {
    try {
      const res = await api.get<{ data: ContactMessage }>(`/api/admin/inbox/${msg.id}`)
      setSelected(res.data)
      setMessages(messages.map((m) => m.id === msg.id ? { ...m, is_read: true } : m))
      if (!msg.is_read) setUnreadCount((c) => Math.max(0, c - 1))
    } catch { toast.error('Gagal membuka pesan.') }
  }

  const remove = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Pesan',
      message: 'Apakah Anda yakin ingin menghapus pesan ini?',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/api/admin/inbox/${id}`)
      toast.success('Pesan berhasil dihapus.')
      if (selected?.id === id) setSelected(null)
      fetch()
    } catch {
      toast.error('Gagal menghapus pesan.')
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Inbox</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 rounded-full">
              {unreadCount} belum dibaca
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">Belum ada pesan.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <button key={msg.id} onClick={() => openMessage(msg)}
                    className={cn(
                      'w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                      selected?.id === msg.id && 'bg-primary-50 dark:bg-primary-950/30',
                      !msg.is_read && 'border-l-2 border-primary-500'
                    )}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.is_read ? <MailOpen size={14} className="text-slate-400" /> : <Mail size={14} className="text-primary-500" />}
                      <span className={cn('text-sm truncate', !msg.is_read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>{msg.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{msg.subject}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(msg.created_at)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white">{selected.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Dari: {selected.name} ({selected.email})</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(selected.created_at)}</p>
                  </div>
                  <button onClick={() => remove(selected.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400 py-20">
                Pilih pesan untuk membaca
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
