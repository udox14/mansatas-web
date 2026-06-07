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
  const [menuOpen, setMenuOpen] = useState(false)

  // Block scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Top bar visibility logic
  const isSolid = scrolled || !isHome || menuOpen

  return (
    <>
      {/* Top Header Bar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b',
          isSolid 
            ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-slate-200 dark:border-slate-800 py-3 shadow-sm' 
            : 'bg-transparent border-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group z-[101]" onClick={() => setMenuOpen(false)}>
            <div className="relative flex items-center justify-center w-10 h-10 transition-transform group-hover:scale-105 duration-300">
              <img src="/logokemenag.png" alt="Kemenag" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className={cn(
                'font-heading font-extrabold text-lg leading-tight tracking-tight transition-colors duration-300',
                isSolid ? 'text-slate-900 dark:text-white' : 'text-white'
              )}>
                MAN 1 Tasikmalaya
              </p>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4 z-[101]">
            {/* PMB CTA (Hidden on small screens) */}
            <Link
              href="/pmb"
              className={cn(
                'hidden sm:inline-flex items-center px-6 py-2.5 text-xs uppercase tracking-widest font-extrabold rounded-full transition-all duration-300 shadow hover:shadow-md active:scale-95 border',
                isSolid
                  ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                  : 'bg-white text-primary-900 border-white hover:bg-slate-100'
              )}
            >
              Portal PMB
            </Link>

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggle}
                className={cn(
                  'p-2.5 rounded-full transition-all duration-300 border backdrop-blur-md',
                  isSolid
                    ? 'text-slate-600 border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-900'
                    : 'text-white border-white/20 hover:bg-white/20'
                )}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            {/* Hamburger / Close Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                'p-2.5 rounded-full transition-all duration-300 border backdrop-blur-md flex items-center gap-2',
                isSolid
                  ? 'text-slate-900 border-slate-200 hover:bg-slate-100 dark:text-white dark:border-slate-800 dark:hover:bg-slate-900'
                  : 'text-white border-white/20 hover:bg-white/20'
              )}
              aria-label="Toggle menu"
            >
              <span className="hidden sm:block text-xs font-bold uppercase tracking-widest ml-1">Menu</span>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mega Full-screen Overlay Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] bg-white dark:bg-slate-950 flex flex-col justify-center overflow-y-auto"
          >
            {/* Background Aesthetic element */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 -right-1/4 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary-100/50 dark:bg-primary-900/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 -left-1/4 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-accent-100/40 dark:bg-accent-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 flex flex-col lg:flex-row gap-12 lg:gap-24">
              
              {/* Navigation Links */}
              <div className="flex-1">
                <nav className="flex flex-col gap-4 sm:gap-6">
                  {NAV_LINKS.map((link, i) => {
                    const active = link.href === '/' 
                      ? pathname === '/' 
                      : link.href.startsWith('/#') 
                        ? false 
                        : pathname.startsWith(link.href)

                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            'group flex items-center gap-6 w-fit',
                            active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-800 dark:text-white'
                          )}
                        >
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-600">0{i + 1}</span>
                          <span className="text-4xl sm:text-5xl md:text-6xl font-heading font-black tracking-tighter hover:text-primary-500 transition-colors duration-300">
                            {link.label}
                          </span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>

              {/* Sidebar Info in Menu */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="lg:w-1/3 flex flex-col justify-end space-y-8"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Informasi Kontak</h3>
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-200">
                    Jl. Awipari No. 12<br />
                    Kota Tasikmalaya, Jawa Barat<br />
                    Indonesia 46196
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Email & Telepon</h3>
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-200">
                    info@man1tasikmalaya.sch.id<br />
                    (0265) 331 445
                  </p>
                </div>
                
                <div className="pt-4">
                  <Link
                    href="/pmb"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-primary-600 text-white text-sm uppercase tracking-widest font-extrabold rounded-full hover:bg-primary-700 shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
                  >
                    Daftar PMB Sekarang
                  </Link>
                </div>
              </motion.div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
