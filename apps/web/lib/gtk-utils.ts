/**
 * Mengompres gambar menggunakan HTML5 Canvas
 * @param file File gambar asli
 * @param maxWidth Lebar maksimal (default: 800)
 * @param quality Kualitas JPEG (0-1, default: 0.8)
 * @returns Promise<Blob>
 */
export async function compressImage(file: File, maxWidth = 800, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Hitung ratio untuk resize
        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Gagal mengompres gambar'))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('Gagal memuat gambar'))
    }
    reader.onerror = () => reject(new Error('Gagal membaca file'))
  })
}

/**
 * Parsing data "Paste dari Excel" (Tab-Separated Values)
 * Format expected: Nama | NIP | Jabatan | Mapel | Gender (L/P)
 */
export function parseGtkPaste(text: string) {
  const lines = text.trim().split(/\r?\n/)
  return lines.map((line) => {
    // Split by tab (Excel paste default) or comma
    const cols = line.split(/\t|,/).map((c) => c.trim())
    
    return {
      name: cols[0] || '',
      nip: cols[1] || '',
      position: cols[2] || '',
      subject: cols[3] || '',
      gender: (cols[4]?.toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P',
    }
  }).filter(item => item.name && item.position) // Minimal ada nama & jabatan
}
