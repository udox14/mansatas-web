'use client'

import { useEffect, useState } from 'react'
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {programs.map((program, i) => {
            const Icon = ICON_MAP[program.icon] || GraduationCap
            const gridClass = GRID_CLASSES[i % GRID_CLASSES.length]
            const isLarge = gridClass.includes('col-span-2') && gridClass.includes('row-span-2')
            const bgImage = program.image_url
              ? program.image_url.startsWith('/')
                ? `${API_URL}${program.image_url}`
                : program.image_url
              : null

            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-primary-100/60 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-800',
                  gridClass
                )}
              >
                {/* Background image (jika ada) */}
                {bgImage && isLarge && (
                  <div className="absolute inset-0">
                    <img
                      src={bgImage}
                      alt={program.title}
                      className="w-full h-full object-cover opacity-15 dark:opacity-10 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className={cn('relative p-6 lg:p-8 h-full flex flex-col', isLarge && 'justify-end')}>
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                    'bg-primary-50 text-primary-600 group-hover:bg-primary-100',
                    'dark:bg-primary-950/50 dark:text-primary-400 dark:group-hover:bg-primary-900/50'
                  )}>
                    <Icon size={isLarge ? 28 : 24} />
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

        {programs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm italic">Daftar program akan segera diperbarui.</p>
          </div>
        )}
      </div>
    </section>
  )
}
