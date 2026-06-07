'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import type { GalleryImage } from '@/types'

export default function GalleryMarquee() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only featured images from /api/gallery (handled by worker)
    api.get<{ success: boolean; data: GalleryImage[] }>('/api/gallery')
      .then((res) => setImages(res.data))
      .catch(() => {})
  }, [])

  const duplicated = images.length > 0 ? [...images, ...images] : []

  return (
    <section id="galeri" className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 mb-16 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-[2px] bg-primary-500 mb-8"
          />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white tracking-tighter mb-4"
          >
            Momen <span className="text-primary-600 dark:text-primary-500">Madrasah</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 font-medium max-w-xl text-lg"
          >
            Melihat lebih dekat perjalanan, kegiatan, dan kegembiraan di lingkungan MAN 1 Tasikmalaya.
          </motion.p>
        </div>
      </div>

      {/* Marquee Rows - Edge to Edge Cinematic */}
      <div className="space-y-4">
        <div ref={containerRef} className="relative w-[150vw] -ml-[25vw] rotate-[-2deg]">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: { repeat: Infinity, repeatType: 'loop', duration: 40, ease: 'linear' },
            }}
            className="flex gap-4"
          >
            {duplicated.map((img, i) => (
              <MarqueeCard key={`row1-${i}`} image={img} />
            ))}
          </motion.div>
        </div>

        {images.length > 4 && (
          <div className="relative w-[150vw] -ml-[25vw] rotate-[2deg] mt-8">
            <motion.div
              animate={{ x: ['-50%', '0%'] }}
              transition={{
                x: { repeat: Infinity, repeatType: 'loop', duration: 45, ease: 'linear' },
              }}
              className="flex gap-4"
            >
              {[...duplicated].reverse().map((img, i) => (
                <MarqueeCard key={`row2-${i}`} image={img} />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {images.length > 0 && (
         <div className="mt-24 text-center relative z-10">
            <Link 
              href="/galeri" 
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
            >
              <span className="text-xs uppercase tracking-widest">Jelajahi Galeri Lengkap</span>
              <ArrowRight size={16} className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-10">
          <p className="text-slate-500 text-sm uppercase font-bold tracking-widest">Momen kegiatan akan segera hadir</p>
        </div>
      )}
    </section>
  )
}

function MarqueeCard({ image }: { image: GalleryImage }) {
  const src = image.image_url.startsWith('/')
    ? `${API_URL}${image.image_url}`
    : image.image_url

  return (
    <div className="shrink-0 w-80 h-56 md:w-96 md:h-64 rounded-xl overflow-hidden group relative bg-slate-200 dark:bg-slate-900 transition-all duration-500 shadow-lg">
      <img
        src={src}
        alt={image.caption || 'Galeri'}
        className="w-full h-full object-cover grayscale-0 md:grayscale opacity-100 dark:opacity-60 dark:md:group-hover:opacity-100 md:group-hover:grayscale-0 transition-all duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 dark:opacity-80" />
      
      {image.caption && (
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <p className="text-white text-xs font-black uppercase tracking-widest truncate drop-shadow-md">
            {image.caption}
          </p>
        </div>
      )}
    </div>
  )
}
