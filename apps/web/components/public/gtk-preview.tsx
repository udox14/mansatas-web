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
    <section id="gtk" className="py-16 bg-white dark:bg-slate-950 overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full mb-3 tracking-wider uppercase"
          >
            Staf Kependidikan
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-3"
          >
            Guru & Staf Madrasah
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Didukung oleh jajaran pimpinan dan tenaga pendidik yang berdedikasi tinggi untuk kemajuan madrasah.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
              ))
            : gtkList.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/20"
                >
                  {/* Photo */}
                  <div className="absolute inset-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                        <Users size={48} strokeWidth={1} />
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                  {/* Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] md:text-xs font-bold text-primary-400 uppercase tracking-widest mb-1 drop-shadow-sm">
                      {item.position}
                    </p>
                    <h3 className="text-sm md:text-md font-heading font-bold text-white leading-tight mb-1">
                      {item.name}
                    </h3>
                    <p className="text-[10px] md:text-xs text-white/70 line-clamp-1 italic">
                      {item.subject || '-'}
                    </p>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/gtk"
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 active:scale-95"
          >
            <span>Lihat Semua GTK</span>
            <ArrowRight size={18} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
