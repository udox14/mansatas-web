'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api } from '@/lib/api'
import { formatDate, truncate } from '@/lib/utils'
import type { ArticleListItem, PaginatedResponse } from '@/types'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

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
      const res = await api.get<PaginatedResponse<ArticleListItem>>(`/api/articles?${params}`)
      setArticles(res.data)
      setMeta(res.meta)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  return (
    <PublicLayout>
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-3">
              Berita & Artikel
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Informasi terkini dari MAN 1 Tasikmalaya
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-400 dark:text-slate-500">
                {debouncedSearch
                  ? `Tidak ada artikel yang cocok dengan "${debouncedSearch}"`
                  : 'Belum ada artikel yang dipublikasikan.'}
              </p>
            </div>
          )}

          {/* Article Grid */}
          {!loading && articles.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => {
                  const thumb = article.thumbnail_url
                    ? article.thumbnail_url.startsWith('/')
                      ? `${apiUrl}${article.thumbnail_url}`
                      : article.thumbnail_url
                    : null

                  return (
                    <Link
                      key={article.id}
                      href={`/artikel/detail?slug=${article.slug}`}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                            <span className="text-4xl font-heading font-bold">M1</span>
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <span>{article.author_name}</span>
                          <span>•</span>
                          <time>{formatDate(article.created_at)}</time>
                        </div>
                        <h3 className="font-heading font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {truncate(article.excerpt, 120)}
                          </p>
                        )}
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
