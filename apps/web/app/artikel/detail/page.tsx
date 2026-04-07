'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Loader2, 
  MessageSquare, 
  Instagram, 
  Send 
} from 'lucide-react'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Article, ApiResponse, ArticleComment, ArticleListItem, PaginatedResponse } from '@/types'

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
  const [recommendations, setRecommendations] = useState<ArticleListItem[]>([])
  const [comments, setComments] = useState<ArticleComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Form state
  const [commentName, setCommentName] = useState('')
  const [commentIg, setCommentIg] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) return // Tunggu sampai slug tersedia
    
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(false)
        // 1. Fetch Article Detail
        const articleRes = await api.get<ApiResponse<Article>>(`/api/articles/${slug}`)
        const currentArticle = articleRes.data
        setArticle(currentArticle)

        // 2 & 3. Fetch Recommendations & Comments (Secondary, don't break page if failed)
        try {
          const recPath = currentArticle.category_slug 
            ? `/api/articles?category=${currentArticle.category_slug}&limit=6`
            : `/api/articles?limit=6`
          
          const recRes = await api.get<PaginatedResponse<ArticleListItem>>(recPath)
          setRecommendations(recRes.data.filter(a => a.id !== currentArticle.id).slice(0, 5))

          const commentRes = await api.get<ApiResponse<ArticleComment[]>>(`/api/articles/${currentArticle.id}/comments`)
          setComments(commentRes.data)
        } catch (secErr) {
          console.error('Secondary fetch failed:', secErr)
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!article) return
    if (!commentName.trim() || !commentContent.trim()) {
      toast.error('Nama dan pesan wajib diisi')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post(`/api/articles/${article.id}/comments`, {
        user_name: commentName,
        user_ig: commentIg,
        content: commentContent
      })
      
      toast.success('Komentar terkirim! Menunggu moderasi admin.')
      setCommentName('')
      setCommentIg('')
      setCommentContent('')
    } catch (err) {
      toast.error('Gagal mengirim komentar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !article) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-24 pt-32">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      </PublicLayout>
    )
  }

  // Jika tidak ada slug atau error atau artikel null setelah loading selesai
  if (!slug || error || !article) {
    return (
      <PublicLayout>
        <div className="pt-32 pb-20 px-4 text-center">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            {!slug ? 'Parameter Tidak Valid' : 'Artikel Tidak Ditemukan'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {!slug 
              ? 'Silakan pilih artikel melalui daftar artikel kami.' 
              : 'Artikel yang Anda cari tidak tersedia atau telah dihapus.'}
          </p>
          <Link href="/artikel" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors">
            <ArrowLeft size={16} />
            Lihat Semua Artikel
          </Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back */}
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Artikel
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content (Left) */}
            <div className="lg:col-span-8">
              <article>
                {article.thumbnail_url && (
                  <div className="rounded-2xl overflow-hidden mb-8 aspect-[2/1] shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <img
                      src={article.thumbnail_url.startsWith('/') ? `${API_URL}${article.thumbnail_url}` : article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {article.category_name && (
                    <span className="px-2.5 py-0.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-bold rounded-md text-xs uppercase tracking-wider">
                      {article.category_name}
                    </span>
                  )}
                  {article.author_name && (
                    <span className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                      <User size={14} />
                      {article.author_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                    <Calendar size={14} />
                    {formatDate(article.created_at)}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white mb-10 leading-[1.2]">
                  {article.title}
                </h1>

                <div
                  className="prose prose-slate dark:prose-invert max-w-none 
                    prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300
                    prose-headings:font-heading prose-headings:font-bold
                    prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-blockquote:border-primary-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
                    [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:max-w-full"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(article.content, {
                      ADD_TAGS: ['iframe'],
                      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
                    }),
                  }}
                />
              </article>

              <hr className="my-16 border-slate-100 dark:border-slate-800" />

              {/* Comments Section */}
              <section id="komentar" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2.5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-xl">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Komentar</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{comments.length} diskusi</p>
                  </div>
                </div>

                {/* Comment Form */}
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 mb-12">
                  <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-6">Tulis Komentar</h3>
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama *</label>
                        <input
                          type="text"
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          placeholder="Nama Anda"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Akun Instagram</label>
                        <input
                          type="text"
                          value={commentIg}
                          onChange={(e) => setCommentIg(e.target.value)}
                          placeholder="@username"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Komentar *</label>
                      <textarea
                        rows={4}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Tulis pendapat atau pertanyaan Anda..."
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      Kirim Komentar
                    </button>
                  </form>
                </div>

                {/* Comment List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                      <p className="text-slate-400 italic">Belum ada komentar. Jadilah yang pertama!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="group flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 transition-hover hover:border-primary-100 dark:hover:border-primary-900/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-heading font-bold text-lg">
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-heading font-bold text-slate-900 dark:text-white">
                                {comment.user_name}
                              </h4>
                              {comment.user_ig && (
                                <a 
                                  href={`https://instagram.com/${comment.user_ig.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full text-slate-500 hover:text-primary-600 transition-colors"
                                >
                                  <Instagram size={10} />
                                  {comment.user_ig}
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar (Right) */}
            <aside className="lg:col-span-4 h-fit sticky top-24">
              <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white mb-6 pl-2 border-l-4 border-primary-500">
                  Rekomendasi Artikel
                </h2>
                
                <div className="space-y-6">
                  {recommendations.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Tidak ada artikel terkait.</p>
                  ) : (
                    recommendations.map((rec) => (
                      <Link
                        key={rec.id}
                        href={`/artikel/detail?slug=${rec.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="shrink-0 w-24 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {rec.thumbnail_url ? (
                            <img
                              src={rec.thumbnail_url.startsWith('/') ? `${API_URL}${rec.thumbnail_url}` : rec.thumbnail_url}
                              alt={rec.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700">
                              <span className="font-heading font-black opacity-20">M1</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug mb-1.5">
                            {rec.title}
                          </h3>
                          <span className="text-[10px] text-slate-400">{formatDate(rec.created_at)}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    href="/artikel"
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                  >
                    Lihat Semua Artikel →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
