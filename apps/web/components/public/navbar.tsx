'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/#program', label: 'Program' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/#galeri', label: 'Galeri' },
  { href: '/#kontak', label: 'Kontak' },
]

export default function Navbar() {
  const { isDark, toggle, mounted } = useDarkMode()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm border-b border-primary-100/50 dark:border-slate-800/50'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logokemenag.png" alt="Kemenag" className="w-10 h-10 object-contain" />
            <div className="hidden sm:block">
              <p className={cn(
                'font-heading font-bold text-sm leading-tight transition-colors',
                scrolled ? 'text-slate-900 dark:text-white' : 'text-white'
              )}>
                MAN 1 Tasikmalaya
              </p>
              <p className={cn(
                'text-xs leading-tight transition-colors',
                scrolled ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
              )}>
                Singaparna
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    scrolled
                      ? 'text-slate-600 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:text-primary-400 dark:hover:bg-slate-800'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Dark Mode + CTA + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggle}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  scrolled
                    ? 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    : 'text-white/70 hover:bg-white/10'
                )}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* CTA Button */}
            <Link
              href="/ppdb"
              className={cn(
                'hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all',
                scrolled
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md'
                  : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 border border-white/20'
              )}
            >
              Portal PPDB
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'md:hidden p-2 rounded-lg transition-colors',
                scrolled
                  ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-primary-100/50 dark:border-slate-800/50"
          >
            <ul className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/pmb"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                >
                  Portal PMB
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
