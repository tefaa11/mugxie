import { prepareImage, MAX_VIDEO_BYTES } from './imageUpload'
export async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, { credentials:'same-origin', ...options })
  let data
  try { data = await response.json() } catch { throw new Error('No se pudo conectar con la tienda. Intenta nuevamente.') }
  if (!response.ok) throw new Error(data.error || 'No se pudo conectar con la tienda.')
  return data
}
export const loadStore = () => api('store')
export const login = password => api('login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})})
export const logout = () => api('logout', {method:'POST'})
export const saveResource = (name,value,revision) => api(`resource/${name}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({value,revision})})
export const getSession = () => api('session')
export async function uploadMedia(file) {
  let prepared = file
  if (file.type.startsWith('image/')) prepared = await prepareImage(file)
  else if (!['video/mp4','video/webm','video/quicktime'].includes(file.type) || file.size > MAX_VIDEO_BYTES) throw new Error('Usa un video MP4, WebM o MOV de máximo 25 MB.')
  return (await api('media', {method:'POST',headers:{'Content-Type':prepared.type},body:prepared})).url
}
