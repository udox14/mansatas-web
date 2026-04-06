import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface TokenPayload extends JWTPayload {
  sub: string // user id
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'editor'
}

const TOKEN_EXPIRY = '7d'

function getSecret(jwtSecret: string) {
  return new TextEncoder().encode(jwtSecret)
}

/** Generate JWT token */
export async function signToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  jwtSecret: string
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuer('man1tasik-api')
    .sign(getSecret(jwtSecret))
}

/** Verify JWT token → payload or null */
export async function verifyToken(
  token: string,
  jwtSecret: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(jwtSecret), {
      issuer: 'man1tasik-api',
    })
    return payload as TokenPayload
  } catch {
    return null
  }
}
