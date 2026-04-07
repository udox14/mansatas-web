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
                    'group relative overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1',
                    gridClass
                  )}
                >
                  {/* Background photo (available for all now) */}
                  {bgImage && (
                    <div className="absolute inset-0">
                      <img
                        src={bgImage}
                        alt={program.title}
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                          isLarge ? "opacity-40 dark:opacity-30" : "opacity-30 dark:opacity-20"
                        )}
                      />
                      {/* Gradient to ensure text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-slate-950 dark:via-slate-950/40 dark:to-transparent" />
                    </div>
                  )}

                  <div className={cn('relative p-6 lg:p-8 h-full flex flex-col', isLarge && 'justify-end')}>
                    <div className="mb-4 text-primary-600 dark:text-primary-400">
                      <Icon size={isLarge ? 32 : 24} strokeWidth={1.5} />
                    </div>
                    <h3 className={cn(
                      'font-heading font-bold text-slate-900 dark:text-white mb-2',
                      isLarge ? 'text-xl lg:text-2xl' : 'text-lg'
                    )}>
                      {program.title}
                    </h3>
                    <p className={cn(
                      'text-slate-500 dark:text-slate-400 leading-relaxed',
                      isLarge ? 'text-base' : 'text-sm'
                    )}>
                      {program.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/program"
            className="inline-flex items-center gap-2.5 px-7 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-lg transition-all"
          >
            Lihat Semua Program & Fasilitas
            <Icon size={18} className="text-primary-500" />
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
