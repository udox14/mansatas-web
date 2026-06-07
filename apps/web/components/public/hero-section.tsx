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

  // Auto-advance
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
    const timer = setInterval(next, 7000) // Slower for cinematic feel
    return () => clearInterval(timer)
  }, [next, slides.length])

  const slide = slides[current]
  const isStatic = settings?.text_mode === 'static'
  const title = isStatic ? settings?.static_title : slide?.title
  const description = isStatic ? settings?.static_description : slide?.description
  const btnText = isStatic ? settings?.static_button_text : slide?.button_text
  const btnUrl = isStatic ? settings?.static_button_url : slide?.button_url

  const fullTitle = title || 'Madrasah Aliyah Negeri 1 Tasikmalaya'

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col justify-end pb-12 sm:pb-24 overflow-hidden bg-slate-950">
      
      {/* Background Slideshow Layer */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          {slides.map((s, i) => {
            if (i !== current) return null
            
            const bgImage = s.image_url
              ? s.image_url.startsWith('/')
                ? `${API_URL}${s.image_url}`
                : s.image_url
              : null

            return (
              <motion.div
                key={`bg-${i}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 1.5 } }} // Slow fade out
                transition={{ duration: 1.5, ease: 'easeOut' }} // Slow fade in
                className="absolute inset-0"
              >
                {bgImage ? (
                  <img
                    src={bgImage}
                    alt={s.title || 'Slide'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-900 to-slate-900" />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Critical Overlays to ensure text readability (No White on White) */}
      <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/80 via-slate-900/30 to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="max-w-4xl space-y-6 sm:space-y-8">
          
          <div className="flex items-center gap-3">
            <span className="w-12 h-[2px] bg-primary-400" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-primary-300 drop-shadow-md">
              Unggul & Berkarakter
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6 sm:space-y-8"
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-heading font-black text-white leading-[1.05] tracking-tighter drop-shadow-lg">
                {fullTitle}
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-200 max-w-2xl leading-relaxed font-medium drop-shadow-md">
                {description || 'Membentuk generasi muslim yang cerdas, berakhlak mulia, dan berwawasan global dalam lingkungan belajar yang inspiratif.'}
              </p>
              
              <div className="pt-4 flex flex-wrap gap-4">
                {btnText && btnUrl && (
                  <Link
                    href={btnUrl}
                    className="inline-flex items-center px-8 py-4 sm:px-10 sm:py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-full shadow-xl shadow-primary-900/50 hover:shadow-primary-600/40 transition-all active:scale-95 duration-300"
                  >
                    {btnText}
                  </Link>
                )}
                <Link
                  href="#program"
                  className="inline-flex items-center px-8 py-4 sm:px-10 sm:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-full border border-white/30 hover:border-white/50 transition-all active:scale-95 duration-300"
                >
                  Jelajahi Program
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Cinematic Slide Controls - Positioned at Bottom Right */}
      {slides.length > 1 && (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 flex justify-between items-end">
          
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 sm:gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-500 ${
                  i === current
                    ? 'w-12 h-1.5 sm:h-2 bg-primary-400 rounded-full'
                    : 'w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/60 rounded-full'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={prev}
              className="p-3 sm:p-4 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/30 text-white rounded-full transition-all active:scale-90"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="p-3 sm:p-4 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/30 text-white rounded-full transition-all active:scale-90"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
        </div>
      )}
      
      {/* Remove the floating metrics bar from here to make it strictly cinematic, 
          it can be moved to another component if needed, or we just let the hero be 100% immersive.
          For now, keeping the hero extremely clean. */}
    </section>
  )
}
