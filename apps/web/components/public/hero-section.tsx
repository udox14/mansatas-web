'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import type { HeroSlide, HeroSettings } from '@/types'

interface HeroData {
  settings: HeroSettings | null
  slides: HeroSlide[]
}

export default function HeroSection() {
  const [data, setData] = useState<HeroData | null>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api.get<{ success: boolean; data: HeroData }>('/api/hero')
      .then((res) => setData(res.data))
      .catch(() => {})
  }, [])

  const slides = data?.slides ?? []
  const settings = data?.settings

  // Auto-advance setiap 6 detik
  const next = useCallback(() => {
    if (slides.length <= 1) return
    setCurrent((p) => (p + 1) % slides.length)
  }, [slides.length])

  const prev = () => {
    if (slides.length <= 1) return
    setCurrent((p) => (p - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  // Tentukan teks berdasarkan mode
  const slide = slides[current]
  const isStatic = settings?.text_mode === 'static'
  const title = isStatic ? settings?.static_title : slide?.title
  const description = isStatic ? settings?.static_description : slide?.description
  const btnText = isStatic ? settings?.static_button_text : slide?.button_text
  const btnUrl = isStatic ? settings?.static_button_url : slide?.button_url

  // Fallback jika belum ada data / slides kosong
  const bgImage = slide?.image_url
    ? slide.image_url.startsWith('/')
      ? `${API_URL}${slide.image_url}`
      : slide.image_url
    : null

  return (
    <section className="relative min-h-screen lg:h-screen w-full bg-white dark:bg-slate-950 flex flex-col justify-between pt-28 pb-8 overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-50/50 dark:bg-primary-950/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-50/40 dark:bg-accent-950/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 py-8 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-400 text-xs font-extrabold uppercase tracking-widest rounded-lg border border-accent-100 dark:border-accent-900"
            >
              Akreditasi A
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current}-${isStatic ? 'static' : 'dynamic'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  {title || 'MAN 1 Tasikmalaya'}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  {description || 'Unggul dalam Iman, Ilmu, dan Amal'}
                </p>
                
                <div className="pt-4 flex flex-wrap gap-4">
                  {btnText && btnUrl && (
                    <Link
                      href={btnUrl}
                      className="inline-flex items-center px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      {btnText}
                    </Link>
                  )}
                  <Link
                    href="#program"
                    className="inline-flex items-center px-8 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-800 transition-all active:scale-95"
                  >
                    Pelajari Selengkapnya
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Slide Showcase */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            {/* Elegant slider container with decorative ring */}
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-slate-100 dark:bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  {bgImage ? (
                    <img
                      src={bgImage}
                      alt={title || 'Hero Showcase'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Slider overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Slider Controls (Chevron Left / Right) */}
              {slides.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button
                    onClick={prev}
                    className="p-2 bg-white/90 dark:bg-slate-950/90 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md rounded-xl text-slate-800 dark:text-white transition-all shadow pointer-events-auto active:scale-90"
                    aria-label="Slide sebelumnya"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="p-2 bg-white/90 dark:bg-slate-950/90 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md rounded-xl text-slate-800 dark:text-white transition-all shadow pointer-events-auto active:scale-90"
                    aria-label="Slide selanjutnya"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Dot Indicators inside Frame */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === current
                          ? 'bg-white w-4'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom: Minimalist Metrics Bar */}
      <div className="w-full z-20 mt-8 lg:mt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl">
          
          <div className="flex flex-col justify-center text-center sm:text-left sm:border-r border-slate-200/50 dark:border-slate-800/50 last:border-0 sm:pr-4">
            <span className="text-2xl sm:text-3xl font-heading font-black text-primary-600 dark:text-primary-400">1.200+</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Siswa Aktif</span>
          </div>

          <div className="flex flex-col justify-center text-center sm:text-left sm:border-r border-slate-200/50 dark:border-slate-800/50 last:border-0 sm:pr-4">
            <span className="text-2xl sm:text-3xl font-heading font-black text-primary-600 dark:text-primary-400">80+</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Guru & Staf</span>
          </div>

          <div className="flex flex-col justify-center text-center sm:text-left sm:border-r border-slate-200/50 dark:border-slate-800/50 last:border-0 sm:pr-4">
            <span className="text-2xl sm:text-3xl font-heading font-black text-primary-600 dark:text-primary-400">50+</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kegiatan & Fasilitas</span>
          </div>

          <div className="flex flex-col justify-center text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-heading font-black text-primary-600 dark:text-primary-400">Terakreditasi</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unggul (Nilai A)</span>
          </div>

        </div>
      </div>

    </section>
  )
}
