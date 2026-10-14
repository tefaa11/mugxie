// Formateador de moneda colombiana con espacio limpio: $ 70.000
export function formatCOP(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$ 0'
  const formatted = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `$ ${formatted}`
}

export function calculateOrderDiscount(cartItems) {
  const quantity = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
  const subtotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
  const rate = quantity >= 8 ? 0.10 : quantity >= 4 ? 0.05 : 0
  const discount = Math.round(subtotal * rate)
  return { quantity, subtotal, rate, discount, total: subtotal - discount }
}

// Generador de enlace y mensaje para WhatsApp según formato exacto solicitado
export function generateWhatsAppOrder({ cartItems, storeConfig }) {
  const order = calculateOrderDiscount(cartItems)
  const phone = storeConfig?.whatsappNumber?.replace(/\D/g, '') || '573123296618'

  let text = `¡Hola ${storeConfig?.storeName || 'Mugxie'}! 💖😺 Me encantaría hacer el siguiente pedido:\n\n`
  text += `🛒 DETALLE DE MI PEDIDO:\n`

  cartItems.forEach((item, index) => {
    const qty = item.quantity || 1
    const subtotal = (item.price || 0) * qty
    const refText = item.reference ? ` (Ref: ${item.reference})` : ''

    text += `${index + 1}. ${item.name}${refText}\n`
    text += `   • Cantidad: ${qty}\n`
    text += `   • Valor: ${formatCOP(item.price)} c/u (Subtotal: ${formatCOP(subtotal)})\n\n`
  })

  if (order.discount) text += `Descuento por ${order.quantity} Mugs (${Math.round(order.rate * 100)}%): -${formatCOP(order.discount)}\n\n`
  text += `*💰 TOTAL A PAGAR: ${formatCOP(order.total)}*\n\n`

  text += `¿Tienen disponibilidad para despacho? ¡Quedo muy atento/a para coordinar el pago! ✨🐱`

  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`

  return {
    url,
    rawText: text,
    ...order,
  }
}
