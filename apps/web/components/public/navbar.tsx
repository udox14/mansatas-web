'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/program', label: 'Program' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/gtk', label: 'GTK' },
  { href: '/prestasi', label: 'Prestasi' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/#kontak', label: 'Kontak' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { isDark, toggle, mounted } = useDarkMode()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Force solid style if not on home
  const isSolid = scrolled || !isHome

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'top-3 px-4 sm:px-6 lg:px-8' : 'top-0'
      )}
    >
      <nav
        className={cn(
          'mx-auto max-w-7xl transition-all duration-500 px-4 sm:px-6 lg:px-8',
          scrolled
            ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-md rounded-2xl border border-slate-100 dark:border-slate-800/80 h-16'
            : 'bg-transparent h-20 border-b border-transparent'
        )}
      >
        <div className="flex h-full items-center justify-between">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 transition-transform group-hover:scale-105 duration-300">
              <img src="/logokemenag.png" alt="Kemenag" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className={cn(
                'font-heading font-extrabold text-sm leading-tight tracking-tight transition-colors duration-300',
                isSolid ? 'text-slate-900 dark:text-white' : 'text-white'
              )}>
                MAN 1 Tasikmalaya
              </p>
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-wider transition-colors duration-300',
                isSolid ? 'text-primary-600 dark:text-primary-400' : 'text-accent-300'
              )}>
                Unggul & Berkarakter
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' 
                ? pathname === '/' 
                : link.href.startsWith('/#') 
                  ? false 
                  : pathname.startsWith(link.href)

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'relative px-3.5 py-2 text-xs uppercase tracking-wider font-bold rounded-lg transition-all duration-300 flex flex-col items-center',
                      active
                        ? isSolid
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/30'
                          : 'text-white bg-white/10'
                        : isSolid
                          ? 'text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-primary-400 dark:hover:bg-slate-900'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {link.label}
                    {active && (
                      <span className={cn(
                        'absolute bottom-1 w-1.5 h-1.5 rounded-full',
                        isSolid ? 'bg-primary-600 dark:bg-primary-400' : 'bg-white'
                      )} />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Right: Dark Mode + CTA + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggle}
                className={cn(
                  'p-2 rounded-xl transition-all duration-300 border',
                  isSolid
                    ? 'text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-900'
                    : 'text-white/80 border-white/10 hover:border-white/20 hover:bg-white/10'
                )}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            {/* CTA Button */}
            <Link
              href="/pmb"
              className={cn(
                'hidden sm:inline-flex items-center px-5 py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 shadow-sm hover:shadow active:scale-95 border',
                isSolid
                  ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                  : 'bg-white text-primary-700 border-white hover:bg-slate-50'
              )}
            >
              Portal PMB
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'md:hidden p-2 rounded-xl transition-all border duration-300',
                isSolid
                  ? 'text-slate-800 border-slate-100 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-900'
                  : 'text-white border-white/10 hover:bg-white/10'
              )}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'md:hidden mt-2 mx-auto max-w-7xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 dark:border-slate-900 overflow-hidden',
              !scrolled && 'mx-4'
            )}
          >
            <ul className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => {
                const active = link.href === '/' 
                  ? pathname === '/' 
                  : link.href.startsWith('/#') 
                    ? false 
                    : pathname.startsWith(link.href)

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl transition-all',
                        active
                          ? 'text-primary-600 bg-primary-50/70 dark:text-primary-400 dark:bg-primary-950/40'
                          : 'text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-primary-400 dark:hover:bg-slate-900'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              <li className="pt-2">
                <Link
                  href="/pmb"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-6 py-3 bg-primary-600 text-white text-xs uppercase tracking-wider font-extrabold rounded-xl hover:bg-primary-700 shadow-sm active:scale-95 transition-all"
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
