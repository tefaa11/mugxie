import React, { useState } from 'react'
import { X, Trash2, Plus, Minus, Copy, Check, ShoppingCart, ShieldCheck } from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon'
import { formatCOP, generateWhatsAppOrder, calculateOrderDiscount } from '../utils/whatsapp'

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onViewCatalog,
  storeConfig,
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
  const orderDetails = generateWhatsAppOrder({
    cartItems,
    storeConfig,
  })
  const discountInfo = calculateOrderDiscount(cartItems)

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderDetails.rawText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (_) {}
  }

  const handleSendWhatsApp = () => {
    window.open(orderDetails.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l-2 border-pink-200">
          {/* Header del Carrito */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-100/70 via-purple-100/50 to-pink-100/70 border-b border-pink-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-200">
                <ShoppingCart size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Tu Carrito Mugxie 🛍️
                </h2>
                <span className="text-xs text-pink-600 font-bold">
                  {totalItemsCount} {totalItemsCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-xs"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lista de Productos (SOLO vasos y cantidades, sin formularios) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
                <img src="/pipe.png" alt="Pipe" className="w-48 h-48 object-contain animate-mango" />
                <h3 className="font-heading text-xl font-bold text-gray-800 mt-2">
                  Tu carrito está vacío ✨
                </h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  Agrega tus Mugs favoritos y haz tu pedido directamente a nuestro WhatsApp con un solo clic.
                </p>
                <button
                  onClick={onViewCatalog}
                  className="mt-3 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-heading text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Ver Catálogo de Mugs ✨
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartId || item.id}
                      className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-200 flex items-center gap-3.5 hover:border-pink-300 transition-colors"
                    >
                      {/* Miniatura */}
                      <div className="w-16 h-16 rounded-xl bg-white border border-pink-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">☕</span>
                        )}
                      </div>

                      {/* Info & Cantidad */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-heading text-sm font-bold text-gray-800 truncate">
                            {item.cartLabel || item.name}
                          </h4>
                          {item.reference && (
                            <span className="bg-[#ebffd5] text-[#2c5315] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#c2ebb0] font-heading">
                              Ref: {item.reference}
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold text-[#C84E97] mt-0.5">
                          {formatCOP(item.price)} {item.purchaseType === 'couple' ? 'por pareja' : 'c/u'}
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartId || item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-pink-200 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors shadow-2xs"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-heading text-sm font-bold text-gray-800 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartId || item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-pink-200 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors shadow-2xs"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal y Eliminar */}
                      <div className="flex flex-col items-end justify-between self-stretch">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartId || item.id)}
                          className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                          title="Eliminar del carrito"
                        >
                          <Trash2 size={16} />
                        </button>
                        <span className="font-heading text-sm font-bold text-gray-900">
                          {formatCOP(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insignia de empaque protegido con #ebffd5 */}
                <div className="bg-[#ebffd5] border border-[#c2ebb0] rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#2c5315]">
                  <ShieldCheck size={18} className="text-[#2c5315] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Empaque ultra protegido:</strong> Cada Mug va embalado en plástico burbuja y caja reforzada antigolpes.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Footer del Carrito con Total y Botón de WhatsApp */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-gradient-to-b from-white to-pink-50/50 border-t border-pink-200 space-y-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600 font-bold">
                  Total a Pagar:
                </span>
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">{formatCOP(orderDetails.total)}</span>
              </div>

              {discountInfo.discount > 0 && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800"><div className="flex justify-between font-bold"><span>Descuento por {discountInfo.quantity} productos ({Math.round(discountInfo.rate * 100)}%)</span><span>-{formatCOP(discountInfo.discount)}</span></div><p className="mt-1 text-emerald-700">Aplicado al valor de los Mugs. El envío no está incluido.</p></div>}
              {discountInfo.quantity > 0 && discountInfo.quantity < 4 && <p className="text-xs text-[#2c5315] bg-[#ebffd5] rounded-xl border border-[#c2ebb0] p-2.5">Agrega {4 - discountInfo.quantity} producto{4 - discountInfo.quantity === 1 ? '' : 's'} más y recibe 5% de descuento.</p>}

              {/* Botón Principal WhatsApp */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-heading text-base font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2.5 active:scale-[0.99] transition-all"
              >
                <WhatsAppIcon size={22} />
                <span>Hacer mi pedido por WhatsApp</span>
              </button>

              {/* Botón secundario para copiar mensaje */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={15} className="text-emerald-500" />
                      <span className="text-emerald-600">¡Mensaje copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copiar para WhatsApp Web</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-gray-400 hover:text-rose-500 font-semibold transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
