/**
 * Generate bcrypt password hash untuk seed superadmin.
 * 
 * Jalankan:
 *   node scripts/hash-password.mjs admin123
 * 
 * Lalu replace placeholder di seed.sql dengan hash yang dihasilkan.
 */

import { webcrypto } from 'node:crypto'

// Simple bcrypt-like hash using Web Crypto (for seeding only)
// Di production, Worker pakai bcryptjs runtime
const password = process.argv[2] || 'admin123'

async function hashPassword(pwd) {
  const encoder = new TextEncoder()
  const data = encoder.encode(pwd)
  const hashBuffer = await webcrypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

hashPassword(password).then(hash => {
  console.log(`\nPassword : ${password}`)
  console.log(`SHA-256  : ${hash}`)
  console.log(`\n⚠️  Ini hanya untuk referensi.`)
  console.log(`   Worker akan pakai bcryptjs untuk hash & verify.`)
  console.log(`   Gunakan endpoint POST /api/auth/register untuk buat user pertama.\n`)
})
