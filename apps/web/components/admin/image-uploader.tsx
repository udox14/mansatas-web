'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (url: string) => void
  folder?: string
  className?: string
}

export default function ImageUploader({ value, onChange, folder = 'uploads', className }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.upload<{ data: { url: string } }>(`/api/upload?folder=${folder}`, fd)
      onChange(res.data.url)
    } catch {
      alert('Gagal upload gambar.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const preview = value
    ? value.startsWith('/') ? `${API_URL}${value}` : value
    : null

  return (
    <div className={cn('relative', className)}>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-full">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          <span className="text-xs">{uploading ? 'Mengupload...' : 'Klik untuk upload gambar'}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
