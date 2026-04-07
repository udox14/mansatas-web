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
    <section id="galeri" className="py-20 bg-slate-50 dark:bg-slate-900 overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 mb-14 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full mb-4"
        >
          Galeri
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-3"
        >
          Momen Spesial Kami
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
        >
           Melihat lebih dekat perjalanan dan kegembiraan di MAN 1 Tasikmalaya.
        </motion.p>
      </div>

      {/* Marquee Rows */}
      <div className="space-y-6">
        <div ref={containerRef} className="relative">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: { repeat: Infinity, repeatType: 'loop', duration: 50, ease: 'linear' },
            }}
            className="flex gap-4"
          >
            {duplicated.map((img, i) => (
              <MarqueeCard key={`row1-${i}`} image={img} />
            ))}
          </motion.div>
        </div>

        {images.length > 4 && (
          <div className="relative">
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
         <div className="mt-16 text-center">
            <Link 
              href="/galeri" 
              className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 active:scale-95"
            >
              <span>Jelajahi Galeri Lengkap</span>
              <div className="w-8 h-8 flex items-center justify-center bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>
            </Link>
         </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-10">
          <p className="text-slate-400 text-sm italic">Momen kegiatan akan segera hadir.</p>
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
    <div className="shrink-0 w-72 h-48 rounded-xl overflow-hidden group relative">
      <img
        src={src}
        alt={image.caption || 'Galeri'}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      {image.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs">{image.caption}</p>
        </div>
      )}
    </div>
  )
}
