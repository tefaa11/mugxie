// Configuración de Mugxie con soporte para /logo.png automático
export const defaultStoreConfig = {
  storeName: 'Mugxie',
  slogan: 'Mugs llenos de magia y arte ✨',
  mascotName: 'Pipe',
  whatsappNumber: '573123296618',
  whatsappDisplay: '312 329 6618',
  instagram: 'mugxie_',
  facebook: '',
  tiktok: 'mugxie_',
  bannerMessage: '✨ ¡Envíos a toda Colombia! Mugs 📦',
}

export function getStoreConfig() {
  try {
    const saved = localStorage.getItem('mugxie_store_config')
    if (saved) {
      return { ...defaultStoreConfig, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('Error cargando store config:', e)
  }
  return defaultStoreConfig
}

export function saveStoreConfig(config) {
  try {
    localStorage.setItem('mugxie_store_config', JSON.stringify(config))
  } catch (e) {
    console.error('Error guardando store config:', e)
  }
}
