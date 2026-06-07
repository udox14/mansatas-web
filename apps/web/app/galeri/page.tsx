'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Folder, Image as ImageIcon, ArrowRight, ChevronRight } from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import type { GalleryCategory, ApiResponse } from '@/types'
import { cn } from '@/lib/utils'
import PageHero from '@/components/public/page-hero'

export default function GalleryPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<GalleryCategory[]>>('/api/gallery/categories')
      .then(res => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <PageHero 
        title="Galeri Sekolah"
        description="Menyimpan setiap jejak prestasi, kegiatan, dan transformasi MAN 1 Tasikmalaya dalam bingkai visual yang abadi."
      />

      {/* Categories Grid Section */}
      <section className="pt-10 pb-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-200 dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
              ))
            ) : categories.length > 0 ? (
              categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="relative"
                >
                  <Link 
                    href={`/galeri/detail?slug=${cat.slug}`}
                    className="group relative block aspect-[4/5] rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 transition-all duration-500 hover:-translate-y-3"
                  >
                    {/* Folder Stack Effect */}
                    <div className="absolute inset-0 bg-primary-50/50 dark:bg-slate-800 rounded-[2rem] translate-y-3 translate-x-3 rotate-3 -z-10 group-hover:rotate-6 group-hover:translate-x-4 transition-transform duration-500 border border-slate-200/50 dark:border-slate-700/50" />
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-850 rounded-[2rem] translate-y-1.5 translate-x-1.5 rotate-1 -z-20 group-hover:rotate-3 group-hover:translate-x-2 transition-transform duration-500 border border-slate-200/30 dark:border-slate-800/50" />

                    {/* Main Image */}
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-50">
                      {(cat.thumbnail_url || cat.fallback_url) ? (
                        <div className="w-full h-full relative">
                          <img 
                            src={(cat.thumbnail_url || cat.fallback_url || '').startsWith('/') ? `${API_URL}${cat.thumbnail_url || cat.fallback_url}` : (cat.thumbnail_url || cat.fallback_url || '')} 
                            alt={cat.name}
                            className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center transition-colors">
                           <div className="p-6 bg-primary-50 dark:bg-primary-950/30 rounded-2xl text-primary-600 mb-4 group-hover:scale-105 transition-transform">
                              <Folder size={36} strokeWidth={1.5} />
                           </div>
                           <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Album Kosong</span>
                        </div>
                      )}
                    </div>

                    {/* Content Glassmorphism Box */}
                    <div className="absolute inset-x-4 bottom-4 p-5 bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-end overflow-hidden group-hover:bg-primary-600 group-hover:border-primary-650 transition-colors duration-500 shadow-xl">
                       <h3 className="text-lg md:text-xl font-heading font-extrabold text-white uppercase tracking-tight mb-1 group-hover:translate-x-1 transition-transform leading-tight">
                          {cat.name}
                       </h3>
                       <p className="text-[10px] text-white/70 group-hover:text-white/90 line-clamp-1 italic font-medium">
                          {cat.description || 'Jelajahi koleksi momen berharga'}
                       </p>
                       <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 group-hover:border-white/20 transition-colors">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/80 uppercase tracking-widest">
                             <ImageIcon size={10} className="text-accent-400 group-hover:text-white" />
                             <span>Lihat Galeri</span>
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-white text-primary-600 flex items-center justify-center shadow-md group-hover:rotate-45 group-hover:scale-105 transition-all">
                             <ChevronRight size={14} strokeWidth={3} />
                          </div>
                       </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem]">
                <div className="inline-flex p-6 bg-slate-50 dark:bg-slate-800/50 rounded-full text-slate-200 dark:text-slate-700 mb-6">
                   <Folder size={64} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-heading font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-2">Dokumentasi Belum Diatur</h3>
                <p className="text-slate-500 dark:text-slate-400">Tim kami sedang mempersiapkan tumpukan memori terbaik.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
