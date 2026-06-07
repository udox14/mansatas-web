'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FlaskConical,
  Globe,
  Trophy,
  GraduationCap,
  Microscope,
  Palette,
  Users,
  Star,
  Laptop,
  ArrowRight,
} from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Program } from '@/types'

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  FlaskConical,
  Globe,
  Trophy,
  GraduationCap,
  Microscope,
  Palette,
  Users,
  Star,
  Laptop,
}

const GRID_CLASSES = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
]

export default function BentoGrid() {
  const [programs, setPrograms] = useState<Program[]>([])

  useEffect(() => {
    api.get<{ success: boolean; data: Program[] }>('/api/programs')
      .then((res) => setPrograms(res.data))
      .catch(() => {})
  }, [])

  return (
    <section id="program" className="py-24 px-4 scroll-mt-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-100/50 dark:bg-primary-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-slate-200/50 dark:bg-slate-800/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[2px] bg-primary-500" />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400"
            >
              Fasilitas & Program
            </motion.span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white tracking-tighter max-w-2xl">
              Program <span className="text-primary-600 dark:text-primary-500">Unggulan</span>
            </h2>
            <Link
              href="/program"
              className="group hidden md:inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
            >
              <span className="text-xs uppercase tracking-widest">Semua Program</span>
              <ArrowRight size={16} className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12">
          {programs
            .filter(p => p.is_featured)
            .map((program, i) => {
              const Icon = ICON_MAP[program.icon] || GraduationCap
              const gridClass = GRID_CLASSES[i % GRID_CLASSES.length]
              const isLarge = gridClass.includes('col-span-2') && gridClass.includes('row-span-2')
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
                  className={cn(
                    'group relative overflow-hidden bg-white dark:bg-slate-900 transition-all duration-500 hover:-translate-y-1',
                    'rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-2xl',
                    gridClass
                  )}
                >
                  {/* Background photo */}
                  {bgImage ? (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={bgImage}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-110 opacity-15 dark:opacity-40 md:group-hover:opacity-30 dark:md:group-hover:opacity-50 grayscale-0 md:grayscale md:group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-900/80 dark:to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50" />
                  )}

                  <div className={cn('relative z-10 p-8 sm:p-10 h-full flex flex-col justify-between', isLarge && 'justify-end gap-6')}>
                    <div>
                      <div className="mb-6 w-14 h-14 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-500 group-hover:bg-primary-600 group-hover:border-primary-500 group-hover:text-white group-hover:scale-110">
                        <Icon size={24} strokeWidth={2} />
                      </div>
                      <h3 className={cn(
                        'font-heading font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors',
                        isLarge ? 'text-3xl lg:text-4xl' : 'text-xl lg:text-2xl'
                      )}>
                        {program.title}
                      </h3>
                      <p className={cn(
                        'text-slate-600 dark:text-slate-400 leading-relaxed font-medium',
                        isLarge ? 'text-base max-w-md' : 'text-sm'
                      )}>
                        {program.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center md:hidden">
          <Link
            href="/program"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm dark:shadow-none"
          >
            <span className="text-xs uppercase tracking-widest">Lihat Semua Program</span>
            <ArrowRight size={16} className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {programs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 dark:text-slate-500 text-sm uppercase tracking-widest font-bold">Data program sedang diperbarui</p>
          </div>
        )}
      </div>
    </section>
  )
}
