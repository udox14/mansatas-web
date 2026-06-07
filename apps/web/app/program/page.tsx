'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, BookOpen, FlaskConical, Globe, Trophy, 
  Microscope, Palette, Users, Star, Laptop 
} from 'lucide-react'
import PublicLayout from '@/components/public/public-layout'
import { api, API_URL } from '@/lib/api'
import type { Program, ApiResponse } from '@/types'
import PageHero from '@/components/public/page-hero'

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, FlaskConical, Globe, Trophy, GraduationCap, 
  Microscope, Palette, Users, Star, Laptop 
}

export default function ProgramPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<Program[]>>('/api/programs')
      .then(res => setPrograms(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <PageHero 
        title="Program & Fasilitas"
        description="Daftar lengkap program unggulan, ekstrakurikuler, dan fasilitas pendukung pendidikan di MAN 1 Tasikmalaya."
      />

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
              ))
            ) : (
              programs.map((program, i) => {
                const Icon = ICON_MAP[program.icon] || GraduationCap
                const bgImage = program.image_url 
                  ? (program.image_url.startsWith('/') ? `${API_URL}${program.image_url}` : program.image_url) 
                  : null

                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-500"
                  >
                    {bgImage && (
                      <div className="aspect-video overflow-hidden border-b border-slate-100 dark:border-slate-850">
                        <img 
                          src={bgImage} 
                          alt={program.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-2xl transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                          <Icon size={20} strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {program.title}
                        </h3>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">
                        {program.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
