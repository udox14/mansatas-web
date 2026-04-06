'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, HelpCircle } from 'lucide-react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleClose = (result: boolean) => {
    setIsOpen(false)
    if (resolvePromise) resolvePromise(result)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  options.variant === 'danger' 
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' 
                    : 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400'
                }`}>
                  {options.variant === 'danger' ? <AlertCircle size={24} /> : <HelpCircle size={24} />}
                </div>
                
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">
                  {options.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {options.message}
                </p>
              </div>

              <div className="flex border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-r border-slate-100 dark:border-slate-800"
                >
                  {options.cancelText || 'Batal'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 px-4 py-4 text-sm font-semibold transition-colors ${
                    options.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                      : 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30'
                  }`}
                >
                  {options.confirmText || 'Ya, Lanjutkan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider')
  return context.confirm
}
