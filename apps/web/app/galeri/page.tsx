'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Folder, Image as ImageIcon, ArrowRight, ChevronRight } from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import type { GalleryCategory, ApiResponse } from '@/types'
import { cn } from '@/lib/utils'

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
      <section className="pt-32 pb-16 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-4"
          >
            Galeri Sekolah
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Kumpulan dokumentasi kegiatan, sarana prasarana, dan momen-momen berharga di MAN 1 Tasikmalaya.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
              ))
            ) : categories.length > 0 ? (
              categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={`/galeri/${cat.slug}`}
                    className="group block relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Folder Image/Thumbnail */}
                    {cat.thumbnail_url ? (
                      <img 
                        src={cat.thumbnail_url.startsWith('/') ? `${API_URL}${cat.thumbnail_url}` : cat.thumbnail_url} 
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:scale-110 transition-transform duration-500">
                        <Folder size={64} strokeWidth={1} />
                      </div>
                    )}
                    
                    {/* Glass Overlay */}
                    <div className="absolute inset-x-4 bottom-4 p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-0.5">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {cat.description || 'Lihat koleksi foto'}
                          </p>
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-xl shadow-md shadow-primary-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Folder Tab Effect (Decorative) */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 dark:bg-primary-500/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-150" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <ImageIcon className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
                <p className="text-slate-400 italic">Belum ada kategori galeri.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
