'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      await api.post('/api/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal mengirim pesan. Coba lagi nanti.'
      )
    }
  }

  return (
    <section id="kontak" className="py-20 px-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full mb-4"
          >
            Kontak
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-3"
          >
            Hubungi Kami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
          >
            Punya pertanyaan atau saran? Kirimkan pesan kepada kami.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          {status === 'success' ? (
            <div className="text-center py-12 px-6 bg-primary-50 dark:bg-primary-950/30 rounded-2xl border border-primary-100 dark:border-primary-900">
              <CheckCircle size={48} className="text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">
                Pesan Terkirim!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Terima kasih telah menghubungi kami. Kami akan merespons secepatnya.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Kirim pesan lagi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  name="name"
                  label="Nama Lengkap"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <InputField
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <InputField
                name="subject"
                label="Subjek"
                value={form.subject}
                onChange={handleChange}
                required
              />
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Pesan
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  maxLength={2000}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors resize-none"
                  placeholder="Tulis pesan Anda..."
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
                  'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
                )}
              >
                {status === 'loading' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {status === 'loading' ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function InputField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  required,
}: {
  name: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
        placeholder={label}
      />
    </div>
  )
}
