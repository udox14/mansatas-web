'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Loader2, ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import { cn, formatDate, truncate } from '@/lib/utils'
import type { ArticleListItem, PaginatedResponse, Category } from '@/types'
import PageHero from '@/components/public/page-hero'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Fetch categories
  useEffect(() => {
    api.get<{ data: Category[] }>('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
  }, [])

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '9' })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (selectedCategory) params.set('category', selectedCategory)
      const res = await api.get<PaginatedResponse<ArticleListItem>>(`/api/articles?${params}`)
      setArticles(res.data)
      setMeta(res.meta)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, selectedCategory])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return (
    <PublicLayout>
      <PageHero 
        title="Berita & Artikel"
        description="Informasi terkini dari Madrasah Aliyah Negeri 1 Tasikmalaya."
      />

      <div className="pt-10 pb-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Category Filter */}
          <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-3 scrollbar-none no-scrollbar">
            <button
              onClick={() => { setSelectedCategory(''); setPage(1); }}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border active:scale-95",
                selectedCategory === '' 
                  ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/10" 
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border active:scale-95",
                  selectedCategory === cat.slug 
                    ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/10" 
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary-600" />
            </div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-400 dark:text-slate-500 font-medium">
                {debouncedSearch
                  ? `Tidak ada artikel yang cocok dengan "${debouncedSearch}"`
                  : 'Belum ada artikel yang dipublikasikan.'}
              </p>
            </div>
          )}

          {/* Article Grid */}
          {!loading && articles.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => {
                  const thumb = article.thumbnail_url
                    ? article.thumbnail_url.startsWith('/')
                      ? `${API_URL}${article.thumbnail_url}`
                      : article.thumbnail_url
                    : null

                  return (
                    <Link
                      key={article.id}
                      href={`/artikel/detail?slug=${article.slug}`}
                      className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1.5 transition-all duration-500 h-full"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                            loading="lazy"
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
                            <span>{article.author_name}</span>
                            <span>•</span>
                            <time>{formatDate(article.created_at)}</time>
                          </div>
                          
                          <h3 className="font-heading font-extrabold text-slate-900 dark:text-white mb-3 text-lg md:text-xl line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed mb-6">
                              {truncate(article.excerpt, 120)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest group/link">
                          <span>Baca Selengkapnya</span>
                          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-slate-500 dark:text-slate-400 px-3">
                    Halaman {page} dari {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page >= meta.totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
