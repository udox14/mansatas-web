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
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      
      {/* Decorative Blur */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-slate-100/50 dark:bg-slate-800/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
            <span className="w-12 h-[2px] bg-primary-500 hidden sm:block" />
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400"
            >
              Berita & Informasi Terkini
            </motion.span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 text-center sm:text-left"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">
              Kabar <span className="text-primary-600 dark:text-primary-500">Madrasah</span>
            </h2>
            <Link
              href="/artikel"
              className="group hidden sm:inline-flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
            >
              <span className="text-xs uppercase tracking-widest">Lihat Semua Berita</span>
              <ArrowRight size={16} className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 h-[450px] animate-pulse" />
              ))
            : articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <Link
                    href={`/artikel/detail?slug=${article.slug}`}
                    className="group flex flex-col bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl dark:hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      {article.thumbnail_url ? (
                        <img
                          src={article.thumbnail_url.startsWith('/') 
                            ? `${API_URL}${article.thumbnail_url}` 
                            : article.thumbnail_url
                          }
                          alt={article.title}
                          className="w-full h-full object-cover md:group-hover:scale-110 grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-100 dark:bg-slate-800">
                          <span className="text-4xl font-heading font-black opacity-20">MAN1</span>
                        </div>
                      )}
                      
                      {/* Dark overlay for contrast only in dark mode */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 dark:opacity-80" />
                      {/* Light overlay for light mode */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent opacity-80 dark:opacity-0" />
                      
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-4 py-1.5 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          {article.category_name || 'Berita'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-1 justify-between relative z-10 -mt-8 bg-slate-50 dark:bg-slate-900 rounded-t-3xl">
                      <div>
                        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-4">
                          <span className="flex items-center gap-1.5">
                            <User size={12} className="text-primary-600 dark:text-primary-400" />
                            {article.author_name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-primary-600 dark:text-primary-400" />
                            {formatDate(article.created_at)}
                          </span>
                        </div>
                        
                        <h3 className="font-heading font-black text-slate-900 dark:text-white mb-4 text-xl lg:text-2xl line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                          {article.title}
                        </h3>
                        
                        {article.excerpt && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                            {truncate(article.excerpt, 100)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-auto">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center sm:hidden">
          <Link
            href="/artikel"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
          >
            <span className="text-xs uppercase tracking-widest">Semua Berita</span>
            <ArrowRight size={16} className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
