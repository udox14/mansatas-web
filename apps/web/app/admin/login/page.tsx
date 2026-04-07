'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, LogIn, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) window.location.href = '/admin'
  }, [loading, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      window.location.href = '/admin'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal. Cek kembali email & password.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Back button */}
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="mb-6"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-primary-900/5 dark:shadow-black/50 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-12 p-8 sm:p-12">
              {/* Branding */}
              <div className="text-center mb-10">
                <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <img src="/logokemenag.png" alt="Kemenag" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                  Admin <span className="text-primary-600">Portal</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  MAN 1 Tasikmalaya — Singaparna
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                    Alamat Email
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all placeholder-slate-400"
                      placeholder="Email admin..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Kata Sandi
                    </label>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all placeholder-slate-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-500 shadow-xl shadow-primary-600/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                  {submitting ? 'Authenticating...' : 'Masuk ke Dashboard'}
                </button>
              </form>

              {/* Secure note */}
              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                 <ShieldCheck size={14} />
                 Sistem Keamanan Berlapis Aktif
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-8 uppercase tracking-widest font-bold">
           &copy; {new Date().getFullYear()} MAN 1 TASIKMALAYA — All Rights Reserved
        </p>
      </div>
    </div>
  )
}
