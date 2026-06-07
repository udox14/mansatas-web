'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import { formatDate, truncate } from '@/lib/utils'
import type { ArticleListItem, PaginatedResponse } from '@/types'

export default function RecentArticles() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<PaginatedResponse<ArticleListItem>>('/api/articles?limit=3')
      .then((res) => setArticles(res.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && articles.length === 0) return null

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full mb-3"
          >
            Berita
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2"
          >
            Berita & Artikel Terkini
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
          >
            Ikuti berbagai kegiatan dan informasi terbaru dari MAN 1 Tasikmalaya.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 p-4 h-[420px] animate-pulse" />
              ))
            : articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/artikel/detail?slug=${article.slug}`}
                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1.5 transition-all duration-500 h-full"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                      {article.thumbnail_url ? (
                        <img
                          src={article.thumbnail_url.startsWith('/') 
                            ? `${API_URL}${article.thumbnail_url}` 
                            : article.thumbnail_url
                          }
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-850">
                          <span className="text-4xl font-heading font-black opacity-10">MAN1</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/95 dark:bg-slate-950/95 text-primary-600 dark:text-primary-400 text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                          {article.category_name || 'Informasi'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-primary-500" />
                            {article.author_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-accent-500" />
                            {formatDate(article.created_at)}
                          </span>
                        </div>
                        
                        <h3 className="font-heading font-extrabold text-slate-900 dark:text-white mb-3 text-lg md:text-xl line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                          {article.title}
                        </h3>
                        
                        {article.excerpt && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                            {truncate(article.excerpt, 100)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest group/link">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/artikel"
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 active:scale-95"
          >
            <span>Lihat Semua Artikel</span>
            <ArrowRight size={18} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
