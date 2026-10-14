import { parseVideoUrl } from '../src/utils/mediaStorage.js'

export const resourceNames = ['products', 'categories', 'testimonials', 'config']
const configKeys = ['storeName','slogan','mascotName','whatsappNumber','whatsappDisplay','instagram','facebook','tiktok','bannerMessage']
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
const fail = message => { throw new HttpError(400, message) }
const text = (value, max = 500, required = false) => {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail('Texto inválido o demasiado largo.')
  return value.trim()
}
export function mediaUrl(value, required = false) {
  const url = text(value || '', 2048, required)
  if (!url) return ''
  if (/^\/api\/media\/[a-f0-9]{40}$/.test(url) || url === '/logo.png') return url
  try { if (new URL(url).protocol === 'https:') return url } catch { /* invalid URL */ }
  fail('Usa un archivo subido o un enlace HTTPS válido.')
}
export function validateResource(name, value) {
  if (name === 'config') {
    if (!value || Array.isArray(value) || typeof value !== 'object') fail('Configuración inválida.')
    const config = Object.fromEntries(configKeys.filter(k => value[k] !== undefined).map(k => [k, text(value[k], 1000)]))
    return config
  }
  if (!Array.isArray(value) || value.length > 2000) fail('Lista inválida o demasiado grande.')
  if (name === 'categories') {
    const categories = value.map(c => text(c,80,true))
    if (new Set(categories.map(c => c.toLocaleLowerCase())).size !== categories.length) fail('Hay categorías repetidas.')
    if (!categories.includes('Todos')) categories.unshift('Todos')
    return categories
  }
  const ids = new Set()
  return value.map(item => {
    if (!item || typeof item !== 'object') fail('Registro inválido.')
    const id = text(item.id, 128, true)
    if (ids.has(id)) fail('Hay identificadores repetidos.')
    ids.add(id)
    if (name === 'testimonials') {
      if (!Number.isInteger(item.rating) || item.rating < 1 || item.rating > 5) fail('La calificación debe ser de 1 a 5 estrellas.')
      return { id, comment:text(item.comment,3000,true), image:mediaUrl(item.image,true), rating:item.rating }
    }
    if (name !== 'products') fail('Tipo de datos inválido.')
    if (!Number.isSafeInteger(item.price) || item.price < 0) fail('Precio inválido.')
    if (item.video !== undefined && typeof item.video !== 'string') fail('Video inválido.')
    if (parseVideoUrl(item.video).type === 'blocked') fail('Los enlaces de TikTok no están permitidos.')
    const variants = item.variants === undefined ? [] : item.variants
    if (!Array.isArray(variants) || variants.length > 30) fail('Las variantes son inválidas.')
    const variantIds = new Set()
    const safeVariants = variants.map(variant => {
      if (!variant || typeof variant !== 'object') fail('Variante inválida.')
      const variantId = text(variant.id, 128, true)
      if (variantIds.has(variantId)) fail('Hay variantes repetidas.')
      variantIds.add(variantId)
      if (variant.video !== undefined && parseVideoUrl(variant.video).type === 'blocked') fail('Los enlaces de TikTok no están permitidos.')
      return { id: variantId, name: text(variant.name, 100, true), image: mediaUrl(variant.image || ''), price: variant.price === undefined || variant.price === '' ? undefined : Number(variant.price), isAvailable: variant.isAvailable !== false, isImmediateDelivery: variant.isAvailable !== false && variant.isImmediateDelivery === true, isLastUnit: variant.isAvailable !== false && variant.isLastUnit === true }
    })
    if (safeVariants.some(v => v.price !== undefined && (!Number.isSafeInteger(v.price) || v.price < 0))) fail('Precio de variante inválido.')
    const images = item.images === undefined ? [] : item.images
    if (!Array.isArray(images) || images.length > 12) fail('Las fotos adicionales son inválidas.')
    const categories = item.categories === undefined ? [item.category || ''] : item.categories
    if (!Array.isArray(categories) || categories.length > 8) fail('Las categorías del producto son inválidas.')
    const safeCategories = [...new Set(categories.map(category => text(category, 80)).filter(Boolean))]
    return {
      id, reference:text(item.reference,80,true), name:text(item.name,200,true), price:item.price,
      category:safeCategories[0] || '', categories:safeCategories, description:text(item.description || '',4000), badge:text(item.badge || '',100),
      isAvailable:item.isAvailable !== false, isImmediateDelivery:item.isAvailable !== false && item.isImmediateDelivery === true, isLastUnit:item.isAvailable !== false && item.isLastUnit === true, isVisible:item.isVisible !== false,
      image:mediaUrl(item.image), images: images.map(image => mediaUrl(image, true)), video:mediaUrl(item.video), iconColor:text(item.iconColor || '',200),
      variants: safeVariants,
    }
  })
}

export function parseRange(header, size) {
  if (!header) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(header)
  if (!match || (!match[1] && !match[2]) || size === 0) throw new HttpError(416,'Rango inválido.')
  let start, end
  if (!match[1]) { const suffix = Number(match[2]); if (!suffix) throw new HttpError(416,'Rango inválido.'); start = Math.max(0,size-suffix); end=size-1 }
  else { start=Number(match[1]); end=match[2] ? Math.min(Number(match[2]),size-1) : size-1 }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) throw new HttpError(416,'Rango inválido.')
  return { offset:start, length:end-start+1 }
}
