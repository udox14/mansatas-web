/**
 * Password hashing & verification menggunakan PBKDF2 + Web Crypto API.
 * Zero dependency — native di Cloudflare Workers.
 *
 * Format hash: $pbkdf2$iterations$salt_hex$hash_hex
 */

const ITERATIONS = 100_000
const KEY_LENGTH = 64 // bytes
const ALGORITHM = 'SHA-256'

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes.buffer
}

async function deriveKey(
  password: string,
  salt: ArrayBuffer
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8 // bits
  )
}

/** Hash password → string format $pbkdf2$... */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(32))
  const hash = await deriveKey(password, salt.buffer)

  return `$pbkdf2$${ITERATIONS}$${bufferToHex(salt.buffer)}$${bufferToHex(hash)}`
}

/** Verify password against stored hash */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split('$')
  // Format: ['', 'pbkdf2', iterations, salt_hex, hash_hex]
  if (parts.length !== 5 || parts[1] !== 'pbkdf2') return false

  const iterations = parseInt(parts[2], 10)
  const salt = hexToBuffer(parts[3])
  const expectedHash = parts[4]

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedHash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8
  )

  return bufferToHex(derivedHash) === expectedHash
}
