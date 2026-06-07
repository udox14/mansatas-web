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

  // Split title for editorial two-tone color style
  const fullTitle = title || 'MAN 1 Tasikmalaya'
  const titleWords = fullTitle.split(' ')
  const titleHighlight = titleWords.length > 2 
    ? titleWords.slice(titleWords.length - 2).join(' ') 
    : titleWords.slice(1).join(' ')
  const titleMain = titleWords.length > 2
    ? titleWords.slice(0, titleWords.length - 2).join(' ')
    : titleWords[0]

  const nextIndex = (current + 1) % slides.length
  const nextSlide = slides[nextIndex]
  const nextBgImage = nextSlide?.image_url
    ? nextSlide.image_url.startsWith('/')
      ? `${API_URL}${nextSlide.image_url}`
      : nextSlide.image_url
    : null

  return (
    <section className="relative min-h-screen lg:h-screen w-full bg-white dark:bg-slate-950 flex flex-col justify-between pt-28 pb-14 overflow-hidden">
      {/* Giant faint background watermark */}
      <div className="absolute -left-12 top-24 text-[13vw] font-black text-slate-100/50 dark:text-slate-900/10 font-heading tracking-tighter select-none pointer-events-none uppercase">
        MANSATA
      </div>

      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Blur Blobs */}
      <div className="absolute -top-48 right-0 w-[500px] h-[500px] bg-primary-100/40 dark:bg-primary-950/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-accent-100/20 dark:bg-accent-950/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Content Container */}
      <div className="flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 py-8 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left: Giant Editorial Typography */}
          <div className="lg:col-span-7 space-y-6 text-left relative">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-accent-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary-700 dark:text-primary-400">
                Madrasah Aliyah Negeri
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current}-${isStatic ? 'static' : 'dynamic'}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-black text-slate-900 dark:text-white leading-[0.98] tracking-tighter">
                  {titleMain} <br />
                  <span className="text-primary-600 dark:text-primary-450">{titleHighlight}</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-550 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
                  {description || 'Unggul dalam Iman, Ilmu, dan Amal'}
                </p>
                
                <div className="pt-6 flex flex-wrap gap-4">
                  {btnText && btnUrl && (
                    <Link
                      href={btnUrl}
                      className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-550/20 transition-all active:scale-95 duration-350"
                    >
                      {btnText}
                    </Link>
                  )}
                  <Link
                    href="#program"
                    className="inline-flex items-center px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-800 transition-all active:scale-95 duration-350"
                  >
                    Jelajahi Program
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Stacked Collage Slide Showcase (3D Effect) */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center pt-6 lg:pt-0">
            <div className="relative w-full max-w-[420px] aspect-[4/3]">
              
              {/* Back Card: Next Slide Preview */}
              {slides.length > 1 && nextBgImage && (
                <div className="absolute top-2 -right-6 w-11/12 h-full rounded-[2rem] overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-850 opacity-40 z-0 transform rotate-6 scale-95 pointer-events-none bg-slate-50 dark:bg-slate-900 transition-all duration-700">
                  <img
                    src={nextBgImage}
                    alt="Next Slide Preview"
                    className="w-full h-full object-cover blur-[0.5px]"
                  />
                </div>
              )}

              {/* Front Card: Active Slide */}
              <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 ring-1 ring-slate-200/60 dark:ring-slate-800/60 bg-slate-50 dark:bg-slate-900 z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-700">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    {bgImage ? (
                      <img
                        src={bgImage}
                        alt={title || 'Showcase'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-650 via-primary-700 to-accent-600" />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Soft gradient bottom overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />

                {/* Left/Right controls nested inside card */}
                {slides.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                    <button
                      onClick={prev}
                      className="p-2 bg-white/95 dark:bg-slate-950/95 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white rounded-xl shadow-md pointer-events-auto transition-transform active:scale-90"
                      aria-label="Slide sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={next}
                      className="p-2 bg-white/95 dark:bg-slate-950/95 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white rounded-xl shadow-md pointer-events-auto transition-transform active:scale-90"
                      aria-label="Slide selanjutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Slide indicator dots nested inside card */}
                {slides.length > 1 && (
                  <div className="absolute bottom-4 left-6 flex gap-1 z-20">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-1.5 rounded-full transition-all ${
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
      </div>

      {/* Floating Metrics Stats Bar (Bridges the fold) */}
      <div className="w-full z-20 mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 p-6 rounded-[2rem] shadow-xl shadow-slate-250/20 dark:shadow-none">
          
          <div className="flex flex-col justify-center text-center sm:text-left sm:border-r border-slate-150 dark:border-slate-800 last:border-0 sm:pr-4">
            <span className="text-3xl sm:text-4xl font-heading font-black text-primary-600 dark:text-primary-450 tracking-tight">1.200+</span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Siswa Aktif</span>
          </div>

          <div className="flex flex-col justify-center text-center sm:text-left sm:border-r border-slate-150 dark:border-slate-800 last:border-0 sm:pr-4">
            <span className="text-3xl sm:text-4xl font-heading font-black text-primary-600 dark:text-primary-450 tracking-tight">80+</span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Guru & Staf</span>
          </div>

          <div className="flex flex-col justify-center text-center sm:text-left sm:border-r border-slate-150 dark:border-slate-800 last:border-0 sm:pr-4">
            <span className="text-3xl sm:text-4xl font-heading font-black text-primary-600 dark:text-primary-450 tracking-tight">50+</span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Fasilitas & Program</span>
          </div>

          <div className="flex flex-col justify-center text-center sm:text-left">
            <span className="text-3xl sm:text-4xl font-heading font-black text-primary-600 dark:text-primary-450 tracking-tight">Grade A</span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Akreditasi Unggul</span>
          </div>

        </div>
      </div>

    </section>
  )
}
