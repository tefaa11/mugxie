// Almacenamiento seguro en IndexedDB para videos e imágenes pesadas sin límite de LocalStorage
const DB_NAME = 'mugxie_media_db'
const DB_VERSION = 1
const STORE_NAME = 'media_files'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Guardar archivo (Blob o File) en IndexedDB
export async function saveMediaFile(key, file) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const putReq = store.put(file, key)
      putReq.onsuccess = () => resolve(`idb://${key}`)
      putReq.onerror = () => reject(putReq.error)
    })
  } catch (err) {
    console.error('Error guardando en IndexedDB:', err)
    return null
  }
}

// Obtener Blob y crear ObjectURL
export async function getMediaUrl(key) {
  try {
    const cleanKey = key.replace('idb://', '')
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const getReq = store.get(cleanKey)
      getReq.onsuccess = () => {
        const file = getReq.result
        if (file) {
          const url = URL.createObjectURL(file)
          resolve(url)
        } else {
          resolve(null)
        }
      }
      getReq.onerror = () => resolve(null)
    })
  } catch (err) {
    console.error('Error recuperando de IndexedDB:', err)
    return null
  }
}

// Helper para detectar tipo de video (Excluyendo TikTok explícitamente según requerimiento del cliente)
export function parseVideoUrl(url) {
  if (!url) return { type: 'none', src: '' }

  const trimmed = url.trim()

  // Bloqueo explícito de enlaces de TikTok
  if (/tiktok|tiktokcdn|tiktokv|musical\.ly/i.test(trimmed)) {
    return {
      type: 'blocked',
      message: 'Los enlaces de TikTok no están permitidos. Por favor sube un archivo de video MP4 directo.',
      rawUrl: trimmed,
    }
  }

  // IndexedDB URL local
  if (trimmed.startsWith('idb://')) {
    return { type: 'idb', key: trimmed, rawUrl: trimmed }
  }

  // Blob local
  if (trimmed.startsWith('blob:')) {
    return { type: 'direct', src: trimmed, rawUrl: trimmed }
  }

  // YouTube Shorts o Links normales
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'embed',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}`,
      rawUrl: trimmed,
    }
  }

  // Google Drive
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'embed',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      rawUrl: trimmed,
    }
  }

  // Video directo (MP4, WebM, etc.)
  return { type: 'direct', src: trimmed, rawUrl: trimmed }
}
