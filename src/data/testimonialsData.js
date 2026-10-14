// Datos iniciales de testimonios de clientes de Mugxie
export const defaultTestimonials = []

export function getStoredTestimonials() {
  try {
    const saved = localStorage.getItem('mugxie_testimonials')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error cargando testimonios:', e)
  }
  return defaultTestimonials
}

export function saveStoredTestimonials(testimonials) {
  try {
    localStorage.setItem('mugxie_testimonials', JSON.stringify(testimonials))
  } catch (e) {
    console.error('Error guardando testimonios:', e)
  }
}
