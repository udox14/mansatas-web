'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Filter, X } from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import type { Gtk, ApiResponse } from '@/types'
import { cn } from '@/lib/utils'

export default function GtkPage() {
  const [gtkList, setGtkList] = useState<Gtk[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  useEffect(() => {
    api.get<ApiResponse<Gtk[]>>('/api/gtk')
      .then((res) => setGtkList(res.data))
      .catch(() => setGtkList([]))
      .finally(() => setLoading(false))
  }, [])

  // Unique values for filters
  const positions = useMemo(() => Array.from(new Set(gtkList.map(g => g.position))).sort(), [gtkList])
  const subjects = useMemo(() => Array.from(new Set(gtkList.map(g => g.subject).filter((s): s is string => Boolean(s)))).sort(), [gtkList])

  const filteredGtk = useMemo(() => {
    return gtkList.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.nip?.toLowerCase() || '').includes(search.toLowerCase())
      const matchGender = !genderFilter || item.gender === genderFilter
      const matchPosition = !positionFilter || item.position === positionFilter
      const matchSubject = !subjectFilter || item.subject === subjectFilter
      return matchSearch && matchGender && matchPosition && matchSubject
    })
  }, [gtkList, search, genderFilter, positionFilter, subjectFilter])

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-4"
          >
            Guru & Tenaga Kependidikan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Mengenal lebih dekat para pendidik dan staf profesional yang berdedikasi tinggi di MAN 1 Tasikmalaya.
          </motion.p>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-12 bg-white dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Filter Bar */}
          <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 mb-8 shadow-md sticky top-16 z-30 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Search */}
              <div className="relative group lg:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama atau NIP/PegID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
              >
                <option value="">Semua Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>

              {/* Position Filter */}
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
              >
                <option value="">Semua Jabatan</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Subject Filter */}
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
              >
                <option value="">Semua Mapel</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
                ))
              ) : filteredGtk.length > 0 ? (
                filteredGtk.map((item, i) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300"
                  >
                    {/* Photo */}
                    <div className="absolute inset-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover grayscale-0 transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-100 dark:bg-slate-900">
                          <Users size={64} strokeWidth={1} />
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 transition-opacity" />

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-5 pt-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1.5 drop-shadow-sm">
                        {item.position}
                      </p>
                      <h3 className="text-sm font-heading font-extrabold text-white leading-tight mb-1">
                        {item.name}
                      </h3>
                      {item.subject && (
                        <p className="text-[10px] text-white/60 line-clamp-1 italic">
                          {item.subject}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="text-slate-300 dark:text-slate-700" size={32} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-2">Tidak ada data ditemukan</h3>
                  <p className="text-slate-500 dark:text-slate-400">Coba ubah kata kunci atau hapus filter yang diterapkan.</p>
                  <button 
                    onClick={() => { setSearch(''); setGenderFilter(''); setPositionFilter(''); setSubjectFilter(''); }}
                    className="mt-6 text-primary-600 dark:text-primary-400 font-bold hover:underline"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
