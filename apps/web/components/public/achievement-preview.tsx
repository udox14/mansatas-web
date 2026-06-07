'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, MapPin, Building2 } from 'lucide-react'
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
    <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-500">
      {/* Decorative Gold Glow for Achievements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-500/5 dark:bg-accent-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400 mb-6 border border-accent-200 dark:border-accent-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(234,179,8,0.15)]"
          >
            <Trophy size={32} strokeWidth={1.5} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white mb-6 tracking-tighter"
          >
            Prestasi & <span className="text-accent-600 dark:text-accent-400">Penghargaan</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium"
          >
            Bukti nyata dedikasi dan semangat juang siswa-siswi MAN 1 Tasikmalaya dalam mengukir prestasi.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 animate-pulse" />
            ))
          ) : (
            achievements.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex flex-col h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl dark:hover:shadow-accent-500/10 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Photo Section */}
                <div className="absolute inset-0 z-0">
                  {item.image_url ? (
                    <img 
                      src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-110 opacity-30 dark:opacity-30 group-hover:opacity-40 grayscale-0 md:grayscale md:group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/50">
                      <Trophy size={64} className="text-slate-300 dark:text-slate-800" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent" />
                </div>

                <div className="absolute top-6 left-6 z-10">
                  <div className="px-4 py-2 bg-accent-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                     {item.rank || 'Juara'}
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                  <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-6 line-clamp-3 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors leading-tight">
                    {item.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-accent-600 dark:text-accent-400" />
                      </div>
                      <span className="text-sm font-bold truncate">{item.organizer}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-accent-600 dark:text-accent-400" />
                      </div>
                      <span className="text-xs font-medium truncate">{item.location}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    {item.article_slug ? (
                      <Link 
                        href={`/artikel/detail?slug=${item.article_slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest group/btn cursor-pointer"
                      >
                        <span>Baca Detail</span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                         {item.date ? formatDate(item.date) : item.year}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="text-center">
          <Link
            href="/prestasi"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
          >
            <span className="text-xs uppercase tracking-widest">Lihat Semua Prestasi</span>
            <ArrowRight size={16} className="text-accent-600 dark:text-accent-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
