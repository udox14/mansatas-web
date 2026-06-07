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
    <section id="kontak" className="py-24 px-4 scroll-mt-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      {/* Background Cinematic */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100/50 dark:bg-primary-600/10 text-primary-600 dark:text-primary-500 mb-6 border border-primary-200 dark:border-primary-500/20 shadow-sm dark:shadow-none"
          >
            <Send size={24} className="ml-1" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white mb-6 tracking-tighter"
          >
            Mari <span className="text-primary-600 dark:text-primary-500">Terhubung</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg font-medium"
          >
            Punya pertanyaan, saran, atau sekadar ingin menyapa? Jangan ragu untuk mengirimkan pesan kepada kami.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          {status === 'success' ? (
            <div className="text-center py-16">
              <CheckCircle size={64} className="text-primary-600 dark:text-primary-500 mx-auto mb-6 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
              <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-4">
                Pesan Terkirim!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base mb-8 max-w-sm mx-auto font-medium">
                Terima kasih telah menghubungi kami. Tim kami akan segera merespons pesan Anda.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-white transition-colors"
              >
                Kirim pesan lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-2"
                >
                  Isi Pesan
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  maxLength={2000}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none font-medium text-sm"
                  placeholder="Ketik pesan Anda di sini..."
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 p-4 rounded-xl border border-red-200 dark:border-red-400/20">
                  <AlertCircle size={18} />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98]',
                  'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/30 dark:shadow-xl dark:shadow-primary-900/30',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {status === 'loading' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>{status === 'loading' ? 'Mengirim...' : 'Kirim Sekarang'}</span>
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
        className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-2"
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
        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium text-sm"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    </div>
  )
}
