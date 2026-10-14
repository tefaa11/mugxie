import { HttpError } from './validation.js'

export async function uploadCloudinary(env, bytes, type, id, fetcher = fetch) {
  const cloud = env.CLOUDINARY_CLOUD_NAME
  if (!cloud || !/^[a-zA-Z0-9_-]+$/.test(cloud) || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw new HttpError(503, 'Falta conectar el almacenamiento de fotos y videos.')
  const timestamp = String(Math.floor(Date.now() / 1000))
  const publicId = `mugxie/${id}`
  const params = `public_id=${publicId}&timestamp=${timestamp}`
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(params + env.CLOUDINARY_API_SECRET))
  const signature = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
  const form = new FormData()
  form.set('file', new Blob([bytes], {type}), 'media')
  form.set('public_id', publicId)
  form.set('timestamp', timestamp)
  form.set('api_key', env.CLOUDINARY_API_KEY)
  form.set('signature', signature)
  const resourceType = type.startsWith('video/') ? 'video' : 'image'
  let response
  try { response = await fetcher(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`, {method:'POST',body:form,signal:AbortSignal.timeout(60000)}) }
  catch { throw new HttpError(502, 'No se pudo conectar con el almacenamiento. Intenta nuevamente.') }
  let result
  try { result = await response.json() } catch { throw new HttpError(502, 'El almacenamiento no respondió correctamente.') }
  if (!response.ok) throw new HttpError(response.status === 420 || response.status === 429 ? 429 : 502, 'No se pudo subir el archivo. Revisa el formato y la cuota de almacenamiento.')
  let url
  try { url = new URL(result.secure_url) } catch { throw new HttpError(502, 'El almacenamiento devolvió un enlace inválido.') }
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.startsWith(`/${cloud}/`)) throw new HttpError(502, 'El almacenamiento devolvió un enlace inválido.')
  return url.href
}
