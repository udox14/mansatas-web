'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Users } from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import type { Gtk, ApiResponse } from '@/types'

export default function GtkPreview() {
  const [gtkList, setGtkList] = useState<Gtk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<Gtk[]>>('/api/gtk/featured')
      .then((res) => setGtkList(res.data))
      .catch(() => setGtkList([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && gtkList.length === 0) return null

  return (
    <section id="gtk" className="py-24 bg-white dark:bg-slate-950 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] bg-primary-100/50 dark:bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
            <span className="w-12 h-[2px] bg-primary-500 hidden md:block" />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400"
            >
              Guru & Staf
            </motion.span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white tracking-tighter max-w-2xl">
              Tenaga Pendidik <span className="text-primary-600 dark:text-primary-500">Berdedikasi</span>
            </h2>
            <Link
              href="/gtk"
              className="group hidden md:inline-flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
            >
              <span className="text-xs uppercase tracking-widest">Lihat Semua GTK</span>
              <ArrowRight size={16} className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
              ))
            : gtkList.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/20"
                >
                  {/* Photo */}
                  <div className="absolute inset-0">
                    {item.image_url ? (
                       <img
                         src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url}
                         alt={item.name}
                         className="w-full h-full object-cover grayscale-0 md:grayscale opacity-100 dark:opacity-70 dark:md:group-hover:opacity-100 md:group-hover:grayscale-0 transition-all duration-700 scale-100 md:group-hover:scale-110"
                       />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-700 bg-slate-100 dark:bg-slate-900">
                        <Users size={36} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 dark:from-slate-950 dark:via-slate-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />

                  {/* Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-2 drop-shadow-sm">
                      {item.position}
                    </p>
                    <h3 className="text-base font-heading font-black text-white leading-tight mb-1">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-slate-300 dark:text-slate-400 line-clamp-1 font-medium tracking-wider uppercase">
                      {item.subject || '-'}
                    </p>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* View All Button Mobile */}
        <div className="text-center md:hidden">
          <Link
            href="/gtk"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
          >
            <span className="text-xs uppercase tracking-widest">Semua GTK</span>
            <ArrowRight size={16} className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
