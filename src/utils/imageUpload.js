export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024
export async function prepareImage(file) {
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) throw new Error('Usa una foto JPG, PNG, WebP o GIF.')
  if (file.size > 20 * 1024 * 1024) throw new Error('La foto original debe pesar menos de 20 MB.')
  if (file.type === 'image/gif') {
    if(file.size>MAX_IMAGE_BYTES)throw new Error('El GIF debe pesar menos de 5 MB.')
    return file
  }
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82))
    if(!blob || blob.size>MAX_IMAGE_BYTES)throw new Error('No se pudo optimizar la foto. Usa una imagen más pequeña.')
    return blob
  } finally { bitmap.close() }
}
