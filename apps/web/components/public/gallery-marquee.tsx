'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { api, API_URL } from '@/lib/api'
import type { GalleryImage } from '@/types'

export default function GalleryMarquee() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<{ success: boolean; data: GalleryImage[] }>('/api/gallery')
      .then((res) => setImages(res.data))
      .catch(() => {})
  }, [])

  if (images.length === 0) return null

  // Duplikasi gambar untuk efek infinite
  const duplicated = [...images, ...images]

  return (
    <section id="galeri" className="py-20 bg-slate-50 dark:bg-slate-900 overflow-hidden">
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
          Kegiatan Kami
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
        >
          Momen-momen terbaik dari berbagai kegiatan di MAN 1 Tasikmalaya.
        </motion.p>
      </div>

      {/* Marquee Row 1 → kiri */}
      <div ref={containerRef} className="relative mb-4">
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

      {/* Marquee Row 2 → kanan (reverse) */}
      {images.length > 3 && (
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
