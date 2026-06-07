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

// Map icon name → component
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

// Bento grid size pattern — item ke-0 dan ke-3 lebih besar
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
    <section id="program" className="py-16 px-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full mb-3"
          >
            Program Kami
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2"
          >
            Program Unggulan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
          >
            Berbagai program unggulan untuk mengembangkan potensi peserta didik secara optimal.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-14">
          {programs
            .filter(p => p.is_featured) // Only featured on home
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
                    'group relative overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1',
                    gridClass
                  )}
                >
                  {/* Background photo */}
                  {bgImage && (
                    <div className="absolute inset-0">
                      <img
                        src={bgImage}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-20 dark:opacity-10"
                      />
                      {/* Gradient for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 dark:to-transparent" />
                    </div>
                  )}

                  <div className={cn('relative p-8 h-full flex flex-col justify-between', isLarge && 'justify-end gap-4')}>
                    <div>
                      <div className="mb-6 p-3 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-2xl w-fit transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                        <Icon size={isLarge ? 28 : 22} strokeWidth={1.8} />
                      </div>
                      <h3 className={cn(
                        'font-heading font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors',
                        isLarge ? 'text-2xl lg:text-3xl' : 'text-lg md:text-xl'
                      )}>
                        {program.title}
                      </h3>
                      <p className={cn(
                        'text-slate-500 dark:text-slate-400 leading-relaxed font-medium',
                        isLarge ? 'text-base' : 'text-sm'
                      )}>
                        {program.description}
                      </p>
                    </div>
                    
                    {/* Tiny decorative link in large cards */}
                    {isLarge && (
                      <div className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-4">
                        <span>Detail Program</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
        </div>


        <div className="text-center">
          <Link
            href="/program"
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 active:scale-95"
          >
            <span>Lihat Semua Program & Fasilitas</span>
            <ArrowRight size={18} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {programs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm italic">Daftar program akan segera diperbarui.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function Icon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14m-7-7 7 7-7 7"/>
    </svg>
  )
}
