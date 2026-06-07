'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, MapPin, Building2, Medal, Award, Star } from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import type { Achievement, ApiResponse } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AchievementPreview() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<Achievement[]>>('/api/achievements?limit=3')
      .then((res) => setAchievements(res.data))
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && achievements.length === 0) return null

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg mb-4"
          >
            Prestasi Terbaru
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-4"
          >
            Prestasi & Penghargaan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg"
          >
            Bukti nyata dedikasi dan semangat juang siswa-siswi MAN 1 Tasikmalaya dalam mengukir prestasi.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[450px] bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
            ))
          ) : (
            achievements.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-500"
              >
                {/* Photo Section */}
                <div className="aspect-[4/3] overflow-hidden relative bg-slate-50 dark:bg-slate-800">
                  {item.image_url ? (
                    <img 
                      src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy size={48} className="text-slate-200 dark:text-slate-700" strokeWidth={1.2} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1 bg-white/95 dark:bg-slate-950/95 border border-slate-100 dark:border-slate-850 rounded-lg shadow-sm text-[9px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                       {item.rank || 'Juara'}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Building2 size={13} className="text-primary-500 shrink-0" />
                        <span className="text-xs font-bold truncate">{item.organizer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <MapPin size={13} className="text-accent-500 shrink-0" />
                        <span className="text-[11px] font-semibold truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {item.article_slug ? (
                      <Link 
                        href={`/artikel/detail?slug=${item.article_slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest group/btn cursor-pointer"
                      >
                        <span>Baca Detail</span>
                        <ArrowRight size={14} className="text-primary-500 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                         {item.date ? formatDate(item.date) : item.year}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Standardized Button */}
        <div className="text-center">
          <Link
            href="/prestasi"
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 active:scale-95"
          >
            <span>Lihat Semua Prestasi</span>
            <ArrowRight size={18} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
