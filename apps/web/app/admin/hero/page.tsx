'use client'

import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, Loader2, GripVertical } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import ImageUploader from '@/components/admin/image-uploader'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import type { HeroSlide, HeroSettings } from '@/types'

export default function AdminHeroPage() {
  const confirm = useConfirm()
  const [settings, setSettings] = useState<HeroSettings>({
    id: 'default',
    text_mode: 'static',
    static_title: '',
    static_description: '',
    static_button_text: '',
    static_button_url: '',
    updated_at: '',
})
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get<{ data: { settings: HeroSettings; slides: HeroSlide[] } }>('/api/admin/hero')
      .then((res) => {
        if (res.data.settings) setSettings(res.data.settings)
        setSlides(res.data.slides)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await api.put('/api/admin/hero/settings', settings)
      toast.success('Pengaturan hero berhasil disimpan!')
    } catch { toast.error('Gagal menyimpan pengaturan.') }
    finally { setSaving(false) }
  }

  const addSlide = async () => {
    try {
      const res = await api.post<{ data: { id: string } }>('/api/admin/hero/slides', {
        image_url: '',
        title: 'Slide Baru',
        sort_order: slides.length,
      })
      setSlides([...slides, {
        id: res.data.id, image_url: '', title: 'Slide Baru', description: null,
        button_text: null, button_url: null, order: slides.length, is_active: true,
        sort_order: slides.length, created_at: new Date().toISOString(),
      } as any])
      toast.success('Slide berhasil ditambahkan.')
    } catch { toast.error('Gagal menambah slide.') }
  }

  const updateSlide = async (id: string, data: Partial<HeroSlide>) => {
    try {
      await api.put(`/api/admin/hero/slides/${id}`, data)
      setSlides(slides.map((s) => s.id === id ? { ...s, ...data } : s))
    } catch { alert('Gagal update slide.') }
  }

  const deleteSlide = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Slide',
      message: 'Apakah Anda yakin ingin menghapus slide hero ini?',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/api/admin/hero/slides/${id}`)
      setSlides(slides.filter((s) => s.id !== id))
      toast.success('Slide berhasil dihapus.')
    } catch { toast.error('Gagal menghapus slide.') }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white mb-4">Pengaturan Teks Hero</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              {(['static', 'dynamic'] as const).map((mode) => (
                <label key={mode} className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors text-sm',
                  settings.text_mode === mode
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                )}>
                  <input type="radio" name="text_mode" value={mode} checked={settings.text_mode === mode}
                    onChange={() => setSettings({ ...settings, text_mode: mode })} className="hidden" />
                  {mode === 'static' ? 'Teks Statis (Global)' : 'Teks Dinamis (Per Slide)'}
                </label>
              ))}
            </div>
            {settings.text_mode === 'static' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Judul" value={settings.static_title || ''} onChange={(v) => setSettings({ ...settings, static_title: v })} />
                <Input label="Deskripsi" value={settings.static_description || ''} onChange={(v) => setSettings({ ...settings, static_description: v })} />
                <Input label="Teks Tombol" value={settings.static_button_text || ''} onChange={(v) => setSettings({ ...settings, static_button_text: v })} />
                <Input label="URL Tombol" value={settings.static_button_url || ''} onChange={(v) => setSettings({ ...settings, static_button_url: v })} />
              </div>
            )}
            <button onClick={saveSettings} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Pengaturan
            </button>
          </div>
        </div>

        {/* Slides */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-slate-900 dark:text-white">Slides ({slides.length})</h3>
            <button onClick={addSlide}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-all">
              <Plus size={16} /> Tambah Slide
            </button>
          </div>
          <div className="space-y-4">
            {slides.map((slide) => (
              <div key={slide.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <GripVertical size={16} className="text-slate-300 mt-2 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <ImageUploader value={slide.image_url} folder="hero"
                      onChange={(url) => updateSlide(slide.id, { image_url: url })} />
                    {settings.text_mode === 'dynamic' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input label="Judul" value={slide.title || ''} onChange={(v) => updateSlide(slide.id, { title: v })} />
                        <Input label="Deskripsi" value={slide.description || ''} onChange={(v) => updateSlide(slide.id, { description: v })} />
                        <Input label="Teks Tombol" value={slide.button_text || ''} onChange={(v) => updateSlide(slide.id, { button_text: v })} />
                        <Input label="URL Tombol" value={slide.button_url || ''} onChange={(v) => updateSlide(slide.id, { button_url: v })} />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <input type="checkbox" checked={slide.is_active}
                          onChange={(e) => updateSlide(slide.id, { is_active: e.target.checked })}
                          className="rounded" />
                        Aktif
                      </label>
                      <button onClick={() => deleteSlide(slide.id)}
                        className="ml-auto flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {slides.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Belum ada slide. Klik "Tambah Slide" untuk memulai.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
    </div>
  )
}
