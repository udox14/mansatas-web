const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://man1tasik-api.drudox.workers.dev'

interface ApiError {
  message: string
  status: number
}

class ApiClientError extends Error {
  status: number
  constructor({ message, status }: ApiError) {
    super(message)
    this.status = status
    this.name = 'ApiClientError'
  }
}

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth_token')
    : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Terjadi kesalahan' }))
    throw new ApiClientError({
      message: body.message || `Error ${res.status}`,
      status: res.status,
    })
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) =>
    fetcher<T>(path),

  post: <T>(path: string, body?: unknown) =>
    fetcher<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body: unknown) =>
    fetcher<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    fetcher<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    fetcher<T>(path, { method: 'DELETE' }),

  /** Upload file ke R2 via backend */
  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null

    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData, // no Content-Type — browser sets multipart boundary
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Upload gagal' }))
      throw new ApiClientError({
        message: body.message || `Error ${res.status}`,
        status: res.status,
      })
    }

    return res.json()
  },
}
