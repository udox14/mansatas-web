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
      <div className="pt-28 pb-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back */}
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors duration-300 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Daftar Artikel</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content (Left) */}
            <div className="lg:col-span-8">
              <article>
                {article.thumbnail_url && (
                  <div className="rounded-[2rem] overflow-hidden mb-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none bg-slate-50 dark:bg-slate-900">
                    <img
                      src={article.thumbnail_url.startsWith('/') ? `${API_URL}${article.thumbnail_url}` : article.thumbnail_url}
                      alt={article.title}
                      className="w-full max-h-[680px] object-contain"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  {article.category_name && (
                    <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-lg">
                      {article.category_name}
                    </span>
                  )}
                  {article.author_name && (
                    <span className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                      <User size={12} className="text-primary-500" />
                      {article.author_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                    <Calendar size={12} className="text-accent-500" />
                    {formatDate(article.created_at)}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white mb-10 leading-[1.2] tracking-tight">
                  {article.title}
                </h1>

                <div
                  className="prose prose-slate dark:prose-invert max-w-none 
                    prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:font-medium
                    prose-headings:font-heading prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                    prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-a:font-bold
                    prose-img:rounded-3xl prose-img:border prose-img:border-slate-100 dark:prose-img:border-slate-800 prose-img:bg-slate-50 dark:prose-img:bg-slate-900
                    prose-blockquote:border-primary-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:font-medium
                    [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:max-w-full"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(article.content, {
                      ADD_TAGS: ['iframe'],
                      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'class', 'style'],
                    }),
                  }}
                />
              </article>

              <hr className="my-14 border-slate-100 dark:border-slate-800" />

              {/* Comments Section */}
              <section id="komentar" className="scroll-mt-32">
                <div className="flex items-center gap-3.5 mb-10">
                  <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white leading-tight">Diskusi & Komentar</h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{comments.length} Komentar</p>
                  </div>
                </div>

                {/* Comment Form */}
                <div className="bg-slate-50/70 dark:bg-slate-900/30 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 mb-12">
                  <h3 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white mb-6">Tulis Komentar</h3>
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap *</label>
                        <input
                          type="text"
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          placeholder="Nama Anda"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500/10 focus:border-primary-600 outline-none transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Akun Instagram</label>
                        <input
                          type="text"
                          value={commentIg}
                          onChange={(e) => setCommentIg(e.target.value)}
                          placeholder="@username"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500/10 focus:border-primary-600 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pesan Komentar *</label>
                      <textarea
                        rows={4}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Tulis pendapat atau pertanyaan Anda secara sopan..."
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500/10 focus:border-primary-600 outline-none transition-all text-sm font-medium resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-450 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow active:scale-95 duration-300"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                      <span>Kirim Komentar</span>
                    </button>
                  </form>
                </div>

                {/* Comment List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="py-14 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/40">
                      <p className="text-slate-450 italic text-sm font-medium">Belum ada diskusi di artikel ini. Mari mulai berkomentar!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-lg hover:shadow-primary-500/5 duration-300">
                        <div className="shrink-0 w-11 h-11 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-heading font-extrabold text-lg border border-primary-100/30">
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-heading font-extrabold text-slate-900 dark:text-white text-sm md:text-base">
                                {comment.user_name}
                              </h4>
                              {comment.user_ig && (
                                <a 
                                  href={`https://instagram.com/${comment.user_ig.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg text-slate-500 hover:text-primary-600 transition-colors border border-slate-100 dark:border-slate-800"
                                >
                                  <Instagram size={10} />
                                  {comment.user_ig}
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium whitespace-pre-wrap">
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
              <div className="bg-slate-50/50 dark:bg-slate-900/10 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
                <h2 className="text-sm font-heading font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-6 pl-2.5 border-l-2 border-primary-600">
                  Rekomendasi Artikel
                </h2>
                
                <div className="space-y-6">
                  {recommendations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Tidak ada artikel terkait saat ini.</p>
                  ) : (
                    recommendations.map((rec) => (
                      <Link
                        key={rec.id}
                        href={`/artikel/detail?slug=${rec.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="shrink-0 w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/20">
                          {rec.thumbnail_url ? (
                            <img
                              src={rec.thumbnail_url.startsWith('/') ? `${API_URL}${rec.thumbnail_url}` : rec.thumbnail_url}
                              alt={rec.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-850">
                              <span className="font-heading font-black text-xs opacity-20">MAN1</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs md:text-sm font-heading font-bold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug mb-1">
                            {rec.title}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-450">{formatDate(rec.created_at)}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800 text-center">
                  <Link
                    href="/artikel"
                    className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
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
