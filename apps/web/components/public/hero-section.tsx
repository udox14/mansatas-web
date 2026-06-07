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

const PHRASES = [
  "Mencetak generasi muslim yang cerdas dan berakhlak mulia.",
  "Unggul dalam Iman, Ilmu, dan Amal di era global.",
  "Membangun karakter Islami yang kuat dan inspiratif.",
  "Madrasah Hebat, Bermartabat, Mandiri & Berprestasi.",
  "Merajut asa dan meraih prestasi tiada henti.",
  "Bangkit, Jaya, Juara!"
]

function Typewriter() {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex]
    let timeoutId: NodeJS.Timeout

    if (!isDeleting) {
      if (text.length < currentPhrase.length) {
        timeoutId = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length + 1))
        }, 40) // typing speed
      } else {
        timeoutId = setTimeout(() => setIsDeleting(true), 3000) // pause before deleting
      }
    } else {
      if (text.length > 0) {
        timeoutId = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length - 1))
        }, 20) // deleting speed
      } else {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [text, isDeleting, phraseIndex])

  return (
    <span className="inline-flex items-center min-h-[3rem] sm:min-h-[4rem]">
      <span>{text}</span>
      <span className="animate-pulse ml-1 inline-block w-1.5 h-6 sm:h-7 bg-primary-600 dark:bg-primary-400 opacity-80" />
    </span>
  )
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

  const fullTitle = title || 'MAN 1 Tasikmalaya'

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col justify-end pb-12 sm:pb-24 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      
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
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-slate-200 dark:from-primary-900 dark:to-slate-900" />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Overlays to ensure text readability for both Light and Dark mode */}
      {/* Light Mode Overlays */}
      <div className="absolute inset-0 z-0 bg-white/40 dark:opacity-0 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:opacity-0 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-50/80 via-slate-50/30 to-transparent dark:opacity-0 transition-opacity duration-500 pointer-events-none" />
      
      {/* Dark Mode Overlays */}
      <div className="absolute inset-0 z-0 bg-black/40 opacity-0 dark:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent opacity-0 dark:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/80 via-slate-900/30 to-transparent opacity-0 dark:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="max-w-4xl space-y-4">
          <div className="mb-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24">
              <img src="/logokemenag.png" alt="Kemenag" className="w-full h-full object-contain drop-shadow-md dark:drop-shadow-lg" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isStatic ? 'static-text' : `text-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading font-black text-slate-900 dark:text-white leading-[1.05] tracking-tighter drop-shadow-sm dark:drop-shadow-lg transition-colors">
                {fullTitle}
              </h1>
              
              <div className="text-xl sm:text-3xl text-primary-700 dark:text-primary-400 font-bold tracking-tight drop-shadow-sm transition-colors">
                <Typewriter />
              </div>
              
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium drop-shadow-sm transition-colors">
                Portal informasi resmi Madrasah Aliyah Negeri 1 Tasikmalaya. Temukan ragam berita terbaru, program unggulan, profil pendidik, serta rentetan prestasi membanggakan dari peserta didik kami.
              </p>
              
              <div className="pt-6 flex flex-wrap gap-4">
                {btnText && btnUrl && (
                  <Link
                    href={btnUrl}
                    className="inline-flex items-center px-8 py-4 sm:px-10 sm:py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-full shadow-lg shadow-primary-600/30 dark:shadow-xl dark:shadow-primary-900/50 hover:shadow-primary-600/40 transition-all active:scale-95 duration-300"
                  >
                    {btnText}
                  </Link>
                )}
                <Link
                  href="#program"
                  className="inline-flex items-center px-8 py-4 sm:px-10 sm:py-5 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 backdrop-blur-md text-slate-900 dark:text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-full border border-slate-200 dark:border-white/30 hover:border-slate-300 dark:hover:border-white/50 transition-all active:scale-95 duration-300 shadow-sm dark:shadow-none"
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
                    ? 'w-12 h-1.5 sm:h-2 bg-primary-600 dark:bg-primary-400 rounded-full'
                    : 'w-2 h-1.5 sm:h-2 bg-slate-300 dark:bg-white/30 hover:bg-slate-400 dark:hover:bg-white/60 rounded-full'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={prev}
              className="p-3 sm:p-4 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-900 dark:text-white rounded-full transition-all active:scale-90 shadow-sm dark:shadow-none"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="p-3 sm:p-4 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-900 dark:text-white rounded-full transition-all active:scale-90 shadow-sm dark:shadow-none"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
        </div>
      )}
    </section>
  )
}
