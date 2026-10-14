import { parseVideoUrl } from '../utils/mediaStorage'
import React, { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, Heart, Sparkles, Video } from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon'
import { formatCOP } from '../utils/whatsapp'
import { MugPlaceholder } from './MugPlaceholder'
import confetti from 'canvas-confetti'

export function ProductCard({
  product,
  onAddToCart,
  onQuickOrder,
  isFavorite = false,
  onToggleFavorite,
  onViewDetails,
}) {
  const [imageError, setImageError] = useState(false)
  const isAvailable = product.isAvailable !== false
  const gallery = useMemo(() => Array.from(new Set([
    product.image,
    ...(product.images || []),
    ...(product.variants || []).map(variant => variant.image),
  ].filter(Boolean))), [product])
  const [previewIndex, setPreviewIndex] = useState(0)
  const previewImage = gallery[previewIndex % Math.max(gallery.length, 1)]

  useEffect(() => { setPreviewIndex(0); setImageError(false) }, [product.id])
  useEffect(() => {
    if (gallery.length < 2) return undefined
    const interval = window.setInterval(() => setPreviewIndex(index => (index + 1) % gallery.length), 4000)
    return () => window.clearInterval(interval)
  }, [gallery.length])
  useEffect(() => setImageError(false), [previewImage])

  const handleAdd = (e) => {
    e.stopPropagation()
    if (!isAvailable) return

    try {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x, y },
        colors: ['#C84E97', '#FFDE59', '#ebffd5', '#5FD6FF'],
        disableForReducedMotion: true,
      })
    } catch (_) {}

    onAddToCart(product)
  }

  const handleQuickWhatsApp = (e) => {
    e.stopPropagation()
    onQuickOrder(product)
  }

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(product)}
      className="group relative bg-white rounded-2xl sm:rounded-3xl border-2 border-pink-100 hover:border-pink-300 shadow-xs hover:shadow-xl hover:shadow-pink-100/70 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Badges superiores */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 items-start">
        {product.badge && (
          <div className="bg-gradient-to-r from-[#C84E97] to-[#B24185] text-white text-[9px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md flex items-center gap-1 font-heading">
            <Sparkles size={11} className="text-[#FFDE59]" />
            <span>{product.badge}</span>
          </div>
        )}
        {product.video && parseVideoUrl(product.video).type !== 'blocked' && (
          <div className="bg-[#C84E97] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Video size={10} />
            <span>Video</span>
          </div>
        )}
        {product.isImmediateDelivery && isAvailable && (
          <div className="bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
            Entrega inmediata
          </div>
        )}
        {(product.variants || []).length > 1 && (
          <div className="bg-white/90 text-[#C84E97] border border-pink-200 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
            {product.variants.length} estilos
          </div>
        )}
      </div>

      {/* Botón Favorito / Corazón */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite && onToggleFavorite(product.id)
        }}
        aria-label="Guardar en favoritos"
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
          isFavorite
            ? 'bg-rose-500 text-white shadow-md scale-110'
            : 'bg-white/90 backdrop-blur-xs text-pink-300 hover:text-rose-500 hover:bg-white border border-pink-100'
        }`}
      >
        <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Contenedor de Imagen */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-[#ffe6f3] via-[#efe6ff] to-[#e2fbf5] overflow-hidden flex items-center justify-center">
        {previewImage && !imageError ? (
          <img
            key={previewImage}
            src={previewImage}
            alt={product.name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${
              !isAvailable ? 'grayscale opacity-60' : ''
            }`}
            loading="lazy"
          />
        ) : (
          <div className={!isAvailable ? 'grayscale opacity-60 w-full h-full' : 'w-full h-full'}>
            <MugPlaceholder name={product.name} category={product.category} colorClass={product.iconColor} />
          </div>
        )}

        {gallery.length > 1 && <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">{gallery.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === previewIndex ? 'w-4 bg-[#C84E97]' : 'w-1.5 bg-white/90 border border-pink-200'}`} />)}</div>}

        {/* Overlay Agotado */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-2 sm:p-4 text-center">
            <span className="bg-rose-500 text-white font-heading text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wide uppercase">
              Agotado
            </span>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1 font-medium hidden sm:block">
              Consultar por WhatsApp
            </p>
          </div>
        )}
      </div>

      {/* Información del Vaso */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#C84E97] uppercase font-heading truncate">
              {product.category || 'Mug 3D'}
            </span>
            {product.reference && (
              <span className="bg-[#ebffd5] text-[#2c5315] text-[9px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md border border-[#c2ebb0] font-heading flex-shrink-0">
                Ref: {product.reference}
              </span>
            )}
          </div>

          <h3 className="font-heading text-sm sm:text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-[#C84E97] transition-colors">
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Mug 3D de cerámica de alta calidad con acabados prémium.'}
          </p>
        </div>

        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-pink-100 flex items-center justify-between gap-1">
          <div>
            <span className="text-[9px] sm:text-[11px] text-gray-400 block font-medium">Precio</span>
            <span className="font-heading text-sm sm:text-2xl font-extrabold text-gray-900">
              {formatCOP(product.price)}
            </span>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {isAvailable ? (
              <>
                <button
                  type="button"
                  onClick={handleQuickWhatsApp}
                  title="Pedir directamente este Mug por WhatsApp"
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#ebffd5] text-[#2c5315] hover:bg-[#d9f9b5] transition-all flex items-center justify-center border border-[#c2ebb0]"
                >
                  <WhatsAppIcon size={15} className="sm:w-[19px] sm:h-[19px]" />
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  title="Añadir al carrito"
                  className="px-2.5 sm:px-4 h-7 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#C84E97] via-[#D4559F] to-[#B24185] hover:from-[#B24185] hover:to-[#A93C7E] text-white font-heading text-[11px] sm:text-sm font-bold shadow-md shadow-pink-200 hover:shadow-lg transition-all flex items-center gap-1 sm:gap-1.5 active:scale-95"
                >
                  <ShoppingCart size={13} className="sm:w-[16px] sm:h-[16px]" />
                  <span className="hidden xs:inline">Agregar</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleQuickWhatsApp}
                className="px-2 sm:px-3.5 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] sm:text-xs font-bold transition-all border border-rose-200"
              >
                Consultar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
