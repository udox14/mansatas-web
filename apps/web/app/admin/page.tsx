'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Image, Images, Inbox, ArrowRight } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'

interface Stats {
  articles: number
  slides: number
  gallery: number
  unread: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ articles: 0, slides: 0, gallery: 0, unread: 0 })

  useEffect(() => {
    Promise.all([
      api.get<{ data: unknown[]; meta: { total: number } }>('/api/admin/articles?limit=1').catch(() => ({ meta: { total: 0 } })),
      api.get<{ data: { slides: unknown[] } }>('/api/admin/hero').catch(() => ({ data: { slides: [] } })),
      api.get<{ data: unknown[] }>('/api/admin/gallery').catch(() => ({ data: [] })),
      api.get<{ meta: { unreadCount: number } }>('/api/admin/inbox?limit=1').catch(() => ({ meta: { unreadCount: 0 } })),
    ]).then(([articles, hero, gallery, inbox]) => {
      setStats({
        articles: (articles as any).meta?.total || 0,
        slides: (hero as any).data?.slides?.length || 0,
        gallery: (gallery as any).data?.length || 0,
        unread: (inbox as any).meta?.unreadCount || 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Total Artikel', value: stats.articles, icon: FileText, href: '/admin/artikel', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50' },
    { label: 'Hero Slides', value: stats.slides, icon: Image, href: '/admin/hero', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' },
    { label: 'Foto Galeri', value: stats.gallery, icon: Images, href: '/admin/galeri', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' },
    { label: 'Pesan Belum Dibaca', value: stats.unread, icon: Inbox, href: '/admin/inbox', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/50' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
            Selamat datang, {user?.name}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kelola website MAN 1 Tasikmalaya dari sini.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon size={20} />
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
