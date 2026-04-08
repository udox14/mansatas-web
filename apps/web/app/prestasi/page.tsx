'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Building2, 
  ArrowRight, 
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Award,
  Medal,
  Star
} from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import type { Achievement, ApiResponse } from '@/types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import PageHero from '@/components/public/page-hero'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchYears()
    fetchAchievements()
  }, [selectedYear])

  const fetchYears = async () => {
    try {
      const res = await api.get<ApiResponse<number[]>>('/api/achievements/years')
      setYears(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const url = selectedYear 
        ? `/api/achievements?year=${selectedYear}` 
        : '/api/achievements'
      const res = await api.get<ApiResponse<Achievement[]>>(url)
      setAchievements(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <PageHero 
        title="Prestasi"
        description="Menampilkan riwayat kemenangan dan dedikasi siswa-siswi MAN 1 Tasikmalaya dalam mengharumkan nama madrasah di tingkat daerah hingga nasional."
      />

      <div className="pt-10">
        {/* Year Filter Section */}
        <section className="sticky top-20 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800 shrink-0">
               <Filter size={16} className="text-slate-400" />
               <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filter Tahun</span>
            </div>
            <button
              onClick={() => setSelectedYear(null)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                selectedYear === null 
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                  : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              )}
            >
              Semua Tahun
            </button>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  selectedYear === year 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                    : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 relative">
          {/* Vertical Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-slate-200 dark:via-slate-800 to-transparent -translate-x-1/2 hidden md:block" />
          
          <div className="space-y-20 relative">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-8 items-center animate-pulse">
                   <div className="flex-1 w-full h-40 bg-slate-50 dark:bg-slate-900 rounded-3xl" />
                   <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 hidden md:block" />
                   <div className="flex-1 w-full h-40 bg-slate-50 dark:bg-slate-900 rounded-3xl" />
                </div>
              ))
            ) : achievements.length > 0 ? (
              achievements.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={cn(
                    "flex flex-col md:flex-row gap-8 md:gap-4 items-start md:items-center relative",
                    i % 2 !== 0 ? "md:flex-row-reverse" : ""
                  )}
                >
                  {/* Timeline Dot (Middle) */}
                  <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800 md:hidden" />
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-12 h-12 items-center justify-center hidden md:flex">
                     <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-4 border-primary-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" />
                  </div>

                  {/* Date Card (Side 1) */}
                  <div className="flex-1 w-full md:text-right hidden md:block">
                     <div className={cn(
                       "inline-flex flex-col",
                       i % 2 !== 0 ? "md:text-left" : "md:text-right"
                     )}>
                        <span className="text-4xl font-heading font-black text-slate-100 dark:text-slate-800 uppercase tracking-tighter">
                           {item.date ? formatDate(item.date).split(' ')[2] : item.year}
                        </span>
                        <span className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] -mt-2">
                           {item.date ? formatDate(item.date).split(' ').slice(0,2).join(' ') : 'Waktu Pelaksanaan'}
                        </span>
                     </div>
                  </div>

                  {/* Main Card (Side 2) */}
                  <div className="flex-1 w-full pl-12 md:pl-0">
                    <div className="group relative bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-primary-600/10 hover:border-primary-500/30 transition-all duration-500 overflow-hidden">
                       
                       {/* Background Icon Decoration */}
                       <div className="absolute -right-4 -top-4 text-slate-50 dark:text-slate-800/20 group-hover:text-primary-500/10 transition-colors">
                          <Trophy size={140} strokeWidth={1} />
                       </div>

                       <div className="relative space-y-6">
                          <div className="flex items-start justify-between gap-4">
                             <div className="space-y-1">
                                <div className="inline-flex px-3 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2">
                                   {item.rank || 'Penghargaan'}
                                </div>
                                <h3 className="text-xl md:text-2xl font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-primary-600 transition-colors">
                                   {item.title}
                                </h3>
                             </div>
                             <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                                {i % 3 === 0 ? <Medal size={28} className="text-yellow-500" /> : i % 3 === 1 ? <Award size={28} className="text-primary-500" /> : <Star size={28} className="text-blue-500" />}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                   <Building2 size={16} />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penyelenggara</span>
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.organizer || '-'}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                   <MapPin size={16} />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi</span>
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.location || '-'}</span>
                                </div>
                             </div>
                          </div>

                          {item.image_url && (
                             <div className="rounded-2xl overflow-hidden aspect-video relative group/img">
                                <img 
                                   src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url} 
                                   className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                   alt={item.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                             </div>
                          )}

                          {item.article_slug && (
                             <Link 
                                href={`/artikel/detail?slug=${item.article_slug}`}
                                className="inline-flex items-center gap-2 group/btn"
                             >
                                <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 group-hover/btn:mr-2 transition-all">Baca Berita Terkait</span>
                                <ArrowRight size={14} className="text-primary-500" />
                             </Link>
                          )}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 text-center">
                 <div className="inline-flex p-8 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-200 dark:text-slate-800 mb-6">
                    <Trophy size={80} strokeWidth={1} />
                 </div>
                 <h3 className="text-2xl font-heading font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">DATA BELUM TERSEDIA</h3>
                 <p className="text-slate-500 mt-2">Pilih tahun lain atau kembali lagi nanti.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2" />
         </div>
         <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-heading font-black uppercase tracking-tight mb-6">Wujudkan Prestasimu Bersama Kami!</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">Mari bergabung dengan entitas pendidikan yang berkomitmen penuh mencetak generasi berkarakter dan berprestasi.</p>
            <Link 
               href="/ppdb"
               className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95"
            >
               Daftar Sekarang
               <ChevronRight size={20} />
            </Link>
         </div>
      </section>
      </div>
    </PublicLayout>
  )
}
