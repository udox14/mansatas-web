'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Maximize2, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import type { GalleryImage, GalleryCategory, ApiResponse } from '@/types'
import { cn } from '@/lib/utils'

export default function GalleryCategoryPage() {
  return (
    <Suspense fallback={<PublicLayout><div className="flex justify-center py-40"><Loader2 size={32} className="animate-spin text-primary-500" /></div></PublicLayout>}>
      <GalleryCategoryContent />
    </Suspense>
  )
}

function GalleryCategoryContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const router = useRouter()
  
  const [photos, setPhotos] = useState<GalleryImage[]>([])
  const [category, setCategory] = useState<GalleryCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryImage | null>(null)

  useEffect(() => {
    if (!slug) return
    
    api.get<ApiResponse<GalleryImage[]> & { category: GalleryCategory }>(`/api/gallery/photos/${slug}`)
      .then(res => {
        setPhotos(res.data)
        setCategory(res.category)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (!slug) {
    return (
      <PublicLayout>
        <div className="pt-40 pb-20 text-center">
            <h2 className="text-xl font-bold mb-4">Parameter tidak valid</h2>
            <button onClick={() => router.push('/galeri')} className="px-4 py-2 bg-primary-500 text-white rounded-xl">Kembali</button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <section className="pt-32 pb-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors mb-6 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Kembali ke Galeri</span>
          </button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {category?.name || 'Loading...'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                {category?.description || 'Menampilkan koleksi dokumentasi foto terbaik kami.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all cursor-zoom-in"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img 
                    src={photo.image_url.startsWith('/') ? `${API_URL}${photo.image_url}` : photo.image_url} 
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover grayscale-0 group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-x-3 bottom-3 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {photo.caption || 'Dokumentasi'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-primary-600 dark:text-primary-400 font-extrabold uppercase tracking-widest">
                      <Maximize2 size={12} />
                      <span>Perbesar</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <ImageIcon className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={80} strokeWidth={1} />
              <h3 className="text-xl font-heading font-black text-slate-300 dark:text-slate-700">FOTO BELUM TERSEDIA</h3>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 bg-slate-950/95 backdrop-blur-xl"
          >
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 text-white hover:bg-white/25 rounded-full transition-colors z-[70]"
            >
              <X size={24} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
            >
              <div className="relative w-full aspect-video md:aspect-auto md:max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl bg-black">
                <img 
                  src={selectedPhoto.image_url.startsWith('/') ? `${API_URL}${selectedPhoto.image_url}` : selectedPhoto.image_url} 
                  alt={selectedPhoto.caption || 'Photo'}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {selectedPhoto.caption && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
                >
                  <p className="text-lg md:text-xl font-heading font-bold text-white leading-tight">
                    {selectedPhoto.caption}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  )
}
