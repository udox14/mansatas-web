'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  title: string
  description?: string
  badge?: string
  className?: string
}

export default function PageHero({ title, description, badge, className }: PageHeroProps) {
  return (
    <section className={cn(
      "pt-36 pb-20 bg-gradient-to-b from-primary-50/40 via-white to-white dark:from-primary-950/10 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/50 dark:border-slate-900 relative overflow-hidden",
      className
    )}>
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 text-center space-y-4">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-3 py-1 bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-400 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-accent-100 dark:border-accent-900"
          >
            {badge}
          </motion.div>
        )}
        
        <motion.h1 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight uppercase"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base font-medium"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  )
}
