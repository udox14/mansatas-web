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
      "pt-32 pb-16 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden",
      className
    )}>
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 text-[10px] font-black tracking-widest rounded-lg mb-4"
          >
            {badge}
          </motion.div>
        )}
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-heading font-black text-slate-900 dark:text-white mb-4 tracking-tight"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  )
}
