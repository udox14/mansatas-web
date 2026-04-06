'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import PublicLayout from '@/components/public/public-layout'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Article, ApiResponse } from '@/types'

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={<PublicLayout><div className="flex justify-center py-20 pt-24"><Loader2 size={32} className="animate-spin text-primary-500" /></div></PublicLayout>}>
      <ArticleDetailContent />
    </Suspense>
  )
}

function ArticleDetailContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) { setLoading(false); setError(true); return }
    setLoading(true)
    api
      .get<ApiResponse<Article>>(`/api/articles/${slug}`)
      .then((res) => setArticle(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  return (
    <PublicLayout>
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Artikel
          </Link>

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
          )}

          {!loading && (error || !article) && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">
                Artikel Tidak Ditemukan
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Artikel yang Anda cari tidak tersedia atau telah dihapus.
              </p>
              <Link
                href="/artikel"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Lihat Semua Artikel
              </Link>
            </div>
          )}

          {!loading && article && (
            <article>
              {article.thumbnail_url && (
                <div className="rounded-2xl overflow-hidden mb-8 aspect-[2/1]">
                  <img
                    src={
                      article.thumbnail_url.startsWith('/')
                        ? `${apiUrl}${article.thumbnail_url}`
                        : article.thumbnail_url
                    }
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                {article.author_name && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {article.author_name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(article.created_at)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-8 leading-tight">
                {article.title}
              </h1>

              <div
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:font-heading prose-headings:font-bold
                  prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl
                  [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:max-w-full"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(article.content, {
                    ADD_TAGS: ['iframe'],
                    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
                  }),
                }}
              />
            </article>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
