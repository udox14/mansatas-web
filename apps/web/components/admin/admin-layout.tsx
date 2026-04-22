'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Image, FileText, Grid3X3, Images, Inbox,
  Users, LogOut, Menu, X, ChevronRight, Loader2, Tag, MessageSquare,
  Trophy,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const SIDEBAR_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/hero', label: 'Hero Slider', icon: Image, feature: 'hero' },
  { href: '/admin/artikel', label: 'Artikel', icon: FileText, feature: 'artikel' },
  { href: '/admin/kategori', label: 'Kategori', icon: Tag, feature: 'kategori' },
  { href: '/admin/program', label: 'Program', icon: Grid3X3, feature: 'program' },
  { href: '/admin/gtk', label: 'Guru & Staf', icon: Users, feature: 'gtk' },
  { href: '/admin/prestasi', label: 'Prestasi', icon: Trophy, feature: 'prestasi' },
  { href: '/admin/galeri', label: 'Galeri', icon: Images, feature: 'galeri' },
  { href: '/admin/komentar', label: 'Komentar', icon: MessageSquare, feature: 'komentar' },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox, feature: 'inbox' },
  { href: '/admin/users', label: 'Pengguna', icon: Users, role: 'superadmin' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/admin/login'
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user) return null

  const filteredItems = SIDEBAR_ITEMS.filter((item) => {
    if (item.role && item.role !== user.role) return false
    if (user.role === 'superadmin') return true
    if (item.feature) {
      return user.permissions?.includes(item.feature)
    }
    return true // Dashboard is allowed for everyone
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img src="/logokemenag.png" alt="Kemenag" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-slate-900 dark:text-white">Admin Panel</p>
            <p className="text-[10px] text-slate-400">MAN 1 Tasikmalaya</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
              >
                <item.icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="ml-3 lg:ml-0">
            <h1 className="text-sm font-heading font-semibold text-slate-900 dark:text-white">
              {filteredItems.find((i) => i.href === pathname)?.label || 'Admin'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
