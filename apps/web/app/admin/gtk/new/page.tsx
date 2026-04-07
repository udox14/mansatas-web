'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, Trash2, CheckCircle, Info, ChevronRight, ImagePlus, User, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { api, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { parseGtkPaste, compressImage } from '@/lib/gtk-utils'
import { cn } from '@/lib/utils'

interface ImportItem {
  id: string
  name: string
  nip: string
  position: string
  subject: string
  gender: 'L' | 'P'
  image_url: string
  uploading?: boolean
}

export default function AdminGtkImportPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [pasteData, setPasteData] = useState('')
  const [items, setItems] = useState<ImportItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null)

  const handleParse = () => {
    if (!pasteData.trim()) return toast.error('Silakan paste data dari Excel terlebih dahulu.')
    const parsed = parseGtkPaste(pasteData)
    if (parsed.length === 0) return toast.error('Data tidak valid atau tidak terbaca.')
    
    setItems(parsed.map(p => ({
      ...p,
      id: crypto.randomUUID(),
      image_url: ''
    })))
    setStep(2)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    setItems(prev => prev.map(item => item.id === id ? { ...item, uploading: true } : item))
    
    try {
      // Auto compress before upload
      const compressedBlob = await compressImage(file, 600, 0.8)
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' })

      const fd = new FormData()
      fd.append('file', compressedFile)
      
      const res = await api.upload<{ data: { url: string } }>('/api/upload?folder=gtk', fd)
      setItems(prev => prev.map(item => item.id === id ? { ...item, image_url: res.data.url, uploading: false } : item))
      toast.success('Foto berhasil diupload.')
    } catch (err) {
      console.error(err)
      toast.error('Gagal upload foto.')
      setItems(prev => prev.map(item => item.id === id ? { ...item, uploading: false } : item))
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ''
    setActiveUploadId(null)
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/admin/gtk/batch', items)
      toast.success(`${items.length} data GTK berhasil disimpan.`)
      router.push('/admin/gtk')
    } catch {
      toast.error('Gagal menyimpan data massal.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-20">
        
        {/* Back Button */}
        <Link 
          href="/admin/gtk" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Kembali ke Manajemen GTK
        </Link>

        {/* Stepper Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
            <StepIndicator step={1} current={step} label="Paste Data" />
            <ChevronRight className="text-slate-300" size={20} />
            <StepIndicator step={2} current={step} label="Review & Foto" />
            <ChevronRight className="text-slate-300" size={20} />
            <StepIndicator step={3} current={step} label="Selesai" />
          </div>
        </div>

        {/* Step 1: Paste from Excel */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="mb-6 flex items-start gap-4 p-4 bg-primary-50 dark:bg-primary-950/30 rounded-2xl border border-primary-100 dark:border-primary-900/50">
              <Info className="text-primary-500 shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-bold text-primary-900 dark:text-primary-400 mb-1">Panduan Import Excel</p>
                <p className="text-primary-700 dark:text-primary-400/70 leading-relaxed">
                  Blok baris data guru di Excel Anda dengan urutan kolom: <br />
                  <span className="font-bold">Nama, NIP/PegID, Jabatan, Mapel, Gender (L/P)</span>. <br />
                  Lalu Copy dan Paste ke kotak di bawah ini.
                </p>
              </div>
            </div>

            <textarea
              rows={12}
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder="Paste data tabel Excel di sini..."
              className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
            />

            <div className="mt-8 text-right">
              <button 
                onClick={handleParse}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
              >
                Lanjutkan Review
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review & Photos */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Review {items.length} Data GTK</h2>
                <p className="text-sm text-slate-500">Silakan lengkapi pas foto untuk masing-masing guru sebelum disimpan.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  Ulangi Paste
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Simpan Semua Data
                </button>
              </div>
            </div>

            {/* List GTK parsed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="relative group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex gap-4">
                    {/* Portrait Placeholder/Upload */}
                    <button 
                      onClick={() => { setActiveUploadId(item.id); fileInputRef.current?.click(); }}
                      disabled={item.uploading}
                      className={cn(
                        "relative w-20 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1 transition-all",
                        item.image_url ? "border-solid border-primary-500" : "hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20"
                      )}
                    >
                      {item.image_url ? (
                        <img src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url} alt="G" className="w-full h-full object-cover" />
                      ) : item.uploading ? (
                        <Loader2 className="animate-spin text-primary-500" size={24} />
                      ) : (
                        <>
                          <ImagePlus className="text-slate-400" size={24} />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Pas Foto</span>
                        </>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-extrabold text-slate-900 dark:text-white text-sm truncate mb-0.5" title={item.name}>{item.name}</p>
                      <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">{item.position}</p>
                      
                      <div className="space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-800">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          NIP: {item.nip || '-'}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Mapel: {item.subject || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => activeUploadId && handleUpload(e, activeUploadId)}
        />
      </div>
    </AdminLayout>
  )
}

function StepIndicator({ step, current, label }: { step: number, current: number, label: string }) {
  const active = current === step
  const completed = current > step

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
        active ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110" : 
        completed ? "bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400" :
        "bg-slate-100 text-slate-400 dark:bg-slate-800"
      )}>
        {completed ? <CheckCircle size={20} animate-pulse /> : step}
      </div>
      <span className={cn(
        "text-sm font-bold tracking-tight",
        active ? "text-slate-900 dark:text-white" : "text-slate-400"
      )}>{label}</span>
    </div>
  )
}
