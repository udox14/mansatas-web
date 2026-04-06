import { Hono } from 'hono'
import type { AppEnv } from '../index'

const assetsRoute = new Hono<AppEnv>()

/* ============================================
   GET /assets/*
   Public — serve images dari R2 bucket
   Dengan cache headers.
   ============================================ */
assetsRoute.get('/*', async (c) => {
  const key = c.req.path.replace('/assets/', '')

  if (!key) {
    return c.json({ success: false, message: 'Path tidak valid.' }, 400)
  }

  const object = await c.env.BUCKET.get(key)

  if (!object) {
    return c.json({ success: false, message: 'File tidak ditemukan.' }, 404)
  }

  const headers = new Headers()
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'application/octet-stream'
  )
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('ETag', object.httpEtag)

  return new Response(object.body, { headers })
})

export default assetsRoute
