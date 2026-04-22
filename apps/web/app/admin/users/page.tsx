'use client'

import { useEffect, useState } from 'react'
import { Plus, UserCheck, UserX, Loader2, Edit2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const confirm = useConfirm()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: '', name: '', email: '', password: '', role: 'editor' as 'superadmin' | 'admin' | 'editor', permissions: [] as string[] })
  const [saving, setSaving] = useState(false)

  const AVAILABLE_FEATURES = [
    { value: 'hero', label: 'Hero Slider' },
    { value: 'artikel', label: 'Artikel' },
    { value: 'kategori', label: 'Kategori' },
    { value: 'program', label: 'Program Unggulan' },
    { value: 'gtk', label: 'Guru & Staf' },
    { value: 'prestasi', label: 'Prestasi' },
    { value: 'galeri', label: 'Galeri' },
    { value: 'komentar', label: 'Komentar' },
    { value: 'inbox', label: 'Pesan / Inbox' }
  ]

  const fetch = () => {
    api.get<{ data: User[] }>('/api/admin/users')
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const toggleUser = async (user: User) => {
    const isDeactivating = user.is_active
    const ok = await confirm({
      title: isDeactivating ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna',
      message: `Apakah Anda yakin ingin ${isDeactivating ? 'menonaktifkan' : 'mengaktifkan'} pengguna ${user.name}?`,
      variant: isDeactivating ? 'danger' : 'primary',
    })
    if (!ok) return

    try {
      await api.patch(`/api/admin/users/${user.id}/toggle`, {})
      toast.success(`Pengguna berhasil ${isDeactivating ? 'dinonaktifkan' : 'diaktifkan'}.`)
      fetch()
    } catch {
      toast.error('Gagal mengubah status pengguna.')
    }
  }

  const saveUser = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.role) return toast.error('Nama, Email, dan Role wajib diisi.')
    if (!form.id && form.password.length < 8) return toast.error('Password baru minimal 8 karakter.')
    setSaving(true)
    try {
      if (form.id) {
        await api.patch(`/api/admin/users/${form.id}`, form)
        toast.success('Pengguna berhasil diperbarui.')
      } else {
        await api.post('/api/auth/register', form)
        toast.success('Pengguna berhasil dibuat.')
      }
      setShowForm(false)
      setForm({ id: '', name: '', email: '', password: '', role: 'editor', permissions: [] })
      fetch()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan user.')
    } finally { setSaving(false) }
  }

  const togglePermission = (val: string) => {
    setForm(prev => {
      const perms = prev.permissions.includes(val) 
        ? prev.permissions.filter(p => p !== val)
        : [...prev.permissions, val]
      return { ...prev, permissions: perms }
    })
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Pengguna ({users.length})</h2>
          <button onClick={() => {
            setForm({ id: '', name: '', email: '', password: '', role: 'editor', permissions: [] })
            setShowForm(!showForm)
          }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600">
            <Plus size={16} /> Tambah User
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{form.id ? 'Password Baru (Kosongkan jika tidak diganti)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={form.id ? '***' : ''}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any, permissions: e.target.value === 'superadmin' ? [] : form.permissions })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  {form.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                </select>
              </div>
            </div>

            {form.role !== 'superadmin' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-medium text-slate-500 mb-3">Hak Akses Fitur</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_FEATURES.map(feat => (
                    <label key={feat.value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                      <input type="checkbox" checked={form.permissions.includes(feat.value)} onChange={() => togglePermission(feat.value)} className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                      {feat.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={saveUser} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Simpan
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Batal</button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className={cn('flex items-center gap-4 px-5 py-4', !u.is_active && 'opacity-50')}>
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-bold shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full uppercase">
                  {u.role}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">{formatDate(u.created_at)}</span>
                {u.role !== 'superadmin' && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => {
                        setForm({ id: u.id, name: u.name, email: u.email, password: '', role: u.role as any, permissions: u.permissions || [] })
                        setShowForm(true)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Edit Pengguna">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => toggleUser(u)}
                      className={cn('p-1.5 rounded-lg', u.is_active ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30')}
                      title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                      {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
