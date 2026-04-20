'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, Trash2, CheckCircle, ChevronRight,
  ImagePlus, Loader2, Download, FileSpreadsheet, Upload,
  AlertCircle, Edit3, X
} from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { api, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { compressImage } from '@/lib/gtk-utils'
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

/* ─────────────────────────────────────────
   Generate Template Excel (client-side)
───────────────────────────────────────── */
async function downloadTemplate() {
  const XLSX = await import('xlsx')

  const header = ['Nama Lengkap', 'NIP / PegID', 'Jabatan', 'Mata Pelajaran', 'Gender (L/P)']
  const examples = [
    ['Drs. H. Ahmad Fauzi, M.Pd', '196501011990031001', 'Guru Madya', 'Matematika', 'L'],
    ['Siti Rahayu, S.Pd', '197803152005012002', 'Guru Muda', 'Bahasa Indonesia', 'P'],
    ['M. Ridwan, S.Kom', '', 'Staff IT / Tenaga Kependidikan', '', 'L'],
  ]

  const wsData = [header, ...examples]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = [
    { wch: 35 }, // Nama
    { wch: 22 }, // NIP
    { wch: 35 }, // Jabatan
    { wch: 25 }, // Mapel
    { wch: 14 }, // Gender
  ]

  // Header style (bold + background) — SheetJS CE can't style cells, but we use comment
  // Just freeze the first row for usability
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data GTK')
  XLSX.writeFile(wb, 'template_import_gtk.xlsx')
}

/* ─────────────────────────────────────────
   Parse uploaded Excel file
───────────────────────────────────────── */
async function parseExcelFile(file: File): Promise<ImportItem[]> {
  const XLSX = await import('xlsx')
  const data = await file.arrayBuffer()
  const wb = XLSX.read(data, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' })

  // Skip header row
  const dataRows = rows.slice(1)

  const items: ImportItem[] = []
  for (const row of dataRows) {
    const name = String(row[0] ?? '').trim()
    const position = String(row[2] ?? '').trim()
    if (!name || !position) continue // skip empty rows

    items.push({
      id: crypto.randomUUID(),
      name,
      nip: String(row[1] ?? '').trim(),
      position,
      subject: String(row[3] ?? '').trim(),
      gender: String(row[4] ?? '').trim().toUpperCase() === 'P' ? 'P' : 'L',
      image_url: '',
    })
  }
  return items
}

/* ═══════════════════════════════════════════
   Main Component
═══════════════════════════════════════════ */
export default function AdminGtkImportPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [items, setItems] = useState<ImportItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null)

  // ── Excel file handler ──
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Format file tidak valid. Harap upload file Excel (.xlsx atau .xls)')
      return
    }
    setParsing(true)
    setFileName(file.name)
    try {
      const parsed = await parseExcelFile(file)
      if (parsed.length === 0) {
        toast.error('Tidak ada data valid ditemukan. Pastikan menggunakan template yang benar.')
        return
      }
      setItems(parsed)
      setStep(2)
      toast.success(`${parsed.length} data berhasil dibaca dari Excel.`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal membaca file Excel. Pastikan format file sudah benar.')
    } finally {
      setParsing(false)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  // ── Drag & Drop ──
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Inline edit ──
  const updateItem = (id: string, field: keyof ImportItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // ── Photo upload ──
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    setItems(prev => prev.map(item => item.id === id ? { ...item, uploading: true } : item))
    try {
      const compressed = await compressImage(file, 600, 0.8)
      const compressedFile = new File([compressed], file.name, { type: 'image/jpeg' })
      const fd = new FormData()
      fd.append('file', compressedFile)
      const res = await api.upload<{ data: { url: string } }>('/api/upload?folder=gtk', fd)
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, image_url: res.data.url, uploading: false } : item
      ))
      toast.success('Foto berhasil diupload.')
    } catch {
      toast.error('Gagal upload foto.')
      setItems(prev => prev.map(item => item.id === id ? { ...item, uploading: false } : item))
    }
    if (photoInputRef.current) photoInputRef.current.value = ''
    setActiveUploadId(null)
  }

  // ── Submit ──
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/admin/gtk/batch', items)
      toast.success(`${items.length} data GTK berhasil disimpan!`)
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

        {/* Back */}
        <Link
          href="/admin/gtk"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Kembali ke Manajemen GTK
        </Link>

        {/* Stepper */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-center gap-4 max-w-lg mx-auto">
            <StepIndicator step={1} current={step} label="Upload Excel" />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <StepIndicator step={2} current={step} label="Review & Foto" />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <StepIndicator step={3} current={step} label="Selesai" />
          </div>
        </div>

        {/* ─── Step 1: Upload ─── */}
        {step === 1 && (
          <div className="space-y-6">

            {/* Download Template Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 shadow-xl shadow-primary-500/20 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <FileSpreadsheet size={40} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-heading font-extrabold mb-1">
                    Langkah 1: Download Template Excel
                  </h2>
                  <p className="text-primary-100 text-sm leading-relaxed">
                    Download template, isi data guru/staf sesuai kolom yang tersedia,
                    lalu upload kembali file tersebut. Kolom yang ada:
                    <strong className="text-white"> Nama, NIP/PegID, Jabatan, Mata Pelajaran, Gender (L/P)</strong>.
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-primary-600 font-bold text-sm rounded-2xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  <Download size={18} />
                  Download Template
                </button>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Upload size={20} className="text-primary-500" />
                Langkah 2: Upload File Excel yang Sudah Diisi
              </h2>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-12 text-center",
                  isDragging
                    ? "border-primary-400 bg-primary-50 dark:bg-primary-950/30 scale-[1.01]"
                    : "border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                {parsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Membaca file Excel...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <FileSpreadsheet size={40} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-base mb-1">
                        Drag & drop file Excel di sini
                      </p>
                      <p className="text-sm text-slate-500">
                        atau <span className="text-primary-500 font-bold">klik untuk memilih file</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Format: .xlsx atau .xls</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>
        )}

        {/* ─── Step 2: Review ─── */}
        {step === 2 && (
          <div className="space-y-6">

            {/* Review Header */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                    Review {items.length} Data GTK
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Dari file: <span className="font-medium text-slate-700 dark:text-slate-300">{fileName}</span>
                    &nbsp;·&nbsp; Klik nama / jabatan untuk mengedit langsung.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => { setStep(1); setItems([]) }}
                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Ganti File
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || items.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Simpan {items.length} Data
                  </button>
                </div>
              </div>
            </div>

            {/* Review Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12">#</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foto</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIP / PegID</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jabatan</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mata Pelajaran</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Gender</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* No */}
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>

                        {/* Foto */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setActiveUploadId(item.id); photoInputRef.current?.click() }}
                            disabled={item.uploading}
                            className={cn(
                              "w-10 h-14 rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center transition-all",
                              item.image_url ? "border-solid border-primary-400" : "border-slate-200 dark:border-slate-700 hover:border-primary-400"
                            )}
                            title="Upload foto"
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : item.uploading ? (
                              <Loader2 size={14} className="animate-spin text-primary-500" />
                            ) : (
                              <ImagePlus size={14} className="text-slate-300" />
                            )}
                          </button>
                        </td>

                        {/* Nama */}
                        <td className="px-4 py-3">
                          <input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="w-full min-w-[180px] bg-transparent border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:border-primary-400 focus:bg-primary-50/50 dark:focus:bg-primary-950/20 px-2 py-1 text-sm font-semibold text-slate-900 dark:text-white outline-none rounded transition-all"
                          />
                        </td>

                        {/* NIP */}
                        <td className="px-4 py-3">
                          <input
                            value={item.nip}
                            onChange={(e) => updateItem(item.id, 'nip', e.target.value)}
                            placeholder="—"
                            className="w-full min-w-[130px] bg-transparent border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:border-primary-400 focus:bg-primary-50/50 dark:focus:bg-primary-950/20 px-2 py-1 text-sm text-slate-600 dark:text-slate-300 font-mono outline-none rounded transition-all"
                          />
                        </td>

                        {/* Jabatan */}
                        <td className="px-4 py-3">
                          <input
                            value={item.position}
                            onChange={(e) => updateItem(item.id, 'position', e.target.value)}
                            className="w-full min-w-[150px] bg-transparent border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:border-primary-400 focus:bg-primary-50/50 dark:focus:bg-primary-950/20 px-2 py-1 text-sm text-slate-600 dark:text-slate-300 outline-none rounded transition-all"
                          />
                        </td>

                        {/* Mapel */}
                        <td className="px-4 py-3">
                          <input
                            value={item.subject}
                            onChange={(e) => updateItem(item.id, 'subject', e.target.value)}
                            placeholder="—"
                            className="w-full min-w-[120px] bg-transparent border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:border-primary-400 focus:bg-primary-50/50 dark:focus:bg-primary-950/20 px-2 py-1 text-sm text-slate-500 italic outline-none rounded transition-all"
                          />
                        </td>

                        {/* Gender */}
                        <td className="px-4 py-3 text-center">
                          <select
                            value={item.gender}
                            onChange={(e) => updateItem(item.id, 'gender', e.target.value)}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 border-0 outline-none text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="L">L</option>
                            <option value="P">P</option>
                          </select>
                        </td>

                        {/* Hapus */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {items.length === 0 && (
                <div className="py-16 text-center">
                  <AlertCircle size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Semua data telah dihapus.</p>
                  <button
                    onClick={() => { setStep(1); setItems([]) }}
                    className="mt-4 text-primary-500 text-sm font-bold hover:underline"
                  >
                    Upload file baru
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Save Bar */}
            {items.length > 0 && (
              <div className="sticky bottom-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">{items.length} data</span> siap disimpan.
                  Foto bersifat opsional — bisa ditambahkan nanti.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Simpan Semua Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hidden photo input */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => activeUploadId && handlePhotoUpload(e, activeUploadId)}
        />
      </div>
    </AdminLayout>
  )
}

function StepIndicator({ step, current, label }: { step: number; current: number; label: string }) {
  const active = current === step
  const completed = current > step

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all',
        active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110' :
          completed ? 'bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400' :
            'bg-slate-100 text-slate-400 dark:bg-slate-800'
      )}>
        {completed ? <CheckCircle size={18} /> : step}
      </div>
      <span className={cn(
        'text-sm font-bold tracking-tight whitespace-nowrap',
        active ? 'text-slate-900 dark:text-white' : 'text-slate-400'
      )}>
        {label}
      </span>
    </div>
  )
}
