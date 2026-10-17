import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  ShoppingCart,
  Heart,
  Sparkles,
  ShieldCheck,
  Check,
  Video,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { formatCOP } from '../utils/whatsapp'
import { MugPlaceholder } from './MugPlaceholder'
import { parseVideoUrl, getMediaUrl } from '../utils/mediaStorage'
import confetti from 'canvas-confetti'
import { WhatsAppIcon } from './WhatsAppIcon'

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onQuickOrder,
  isFavorite,
  onToggleFavorite,
  onSelectCategory,
}) {
  const [quantity, setQuantity] = useState(1)
  const [addedAnimation, setAddedAnimation] = useState(false)
  const [activeMedia, setActiveMedia] = useState('image') // 'image' | 'video'

  const [resolvedVideoUrl, setResolvedVideoUrl] = useState('')
  const [videoType, setVideoType] = useState('direct') // 'direct' | 'embed' | 'none'
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState('')
  const [purchaseType, setPurchaseType] = useState('single')
  const selectedVariant = useMemo(() => (product?.variants || []).find(v => v.id === selectedVariantId), [product, selectedVariantId])
  const displayedProduct = selectedVariant ? { ...product, ...selectedVariant, name: `${product.name} · ${selectedVariant.name}`, variantId: selectedVariant.id, image: selectedVariant.image || product.image } : product
  const photos = [displayedProduct?.image, ...(product?.images || [])].filter(Boolean)

  const isAvailable = displayedProduct?.isAvailable !== false
  const hasCouplePromotion = displayedProduct?.isCouplePromotion === true && Number.isSafeInteger(displayedProduct?.pairPrice)
  const selectedPrice = hasCouplePromotion && purchaseType === 'couple' ? displayedProduct.pairPrice : displayedProduct?.price
  useEffect(() => { setSelectedVariantId(product?.searchMatchedVariant?.id || product?.variants?.[0]?.id || ''); setSelectedPhoto(product?.searchMatchedVariant?.image || product?.image || ''); setPurchaseType('single') }, [product?.id, product?.searchMatchedVariant?.id])
  useEffect(() => { setSelectedPhoto(displayedProduct?.image || '') }, [selectedVariantId])

  // Resolver URL de video (YouTube, Drive, IndexedDB o MP4)
  useEffect(() => {
    if (!product?.video) {
      setResolvedVideoUrl('')
      setVideoType('none')
      return
    }

    const parsed = parseVideoUrl(product.video)
    setVideoError(false)

    if (parsed.type === 'idb') {
      setVideoLoading(true)
      getMediaUrl(parsed.key).then((blobUrl) => {
        setVideoLoading(false)
        if (blobUrl) {
          setResolvedVideoUrl(blobUrl)
          setVideoType('direct')
        } else {
          setVideoError(true)
        }
      })
    } else if (parsed.type === 'blocked') {
      setResolvedVideoUrl('')
      setVideoType('none')
      setVideoError(true)
    } else if (parsed.type === 'embed') {
      setResolvedVideoUrl(parsed.src)
      setVideoType('embed')
    } else {
      setResolvedVideoUrl(parsed.src)
      setVideoType('direct')
    }
  }, [product?.video])

  if (!product) return null

  const handleAdd = () => {
    if (!isAvailable) return

    try {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C84E97', '#FFDE59', '#ebffd5', '#5FD6FF'],
      })
    } catch (_) {}

    onAddToCart({ ...displayedProduct, price: selectedPrice, purchaseType, discountUnits: 1, cartLabel: purchaseType === 'couple' ? `${displayedProduct.name} · Promoción de pareja` : displayedProduct.name, quantity })
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  const handleAddAllStyles = () => {
    const availableVariants = (product.variants || []).filter(variant => variant.isAvailable !== false)
    if (!availableVariants.length) return
    availableVariants.forEach(variant => onAddToCart({ ...product, ...variant, name: `${product.name} · ${variant.name}`, variantId: variant.id, image: variant.image || product.image, purchaseType: 'single', discountUnits: 1, quantity: 1 }))
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="relative bg-white rounded-3xl w-full max-w-3xl h-[calc(100dvh-1rem)] md:h-[min(720px,calc(100dvh-2.5rem))] overflow-hidden shadow-2xl border-2 border-pink-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-600 hover:text-gray-900 flex items-center justify-center shadow-md transition-colors"
        >
          <X size={22} />
        </button>

        <div className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-2 md:grid-rows-none items-stretch h-full">
          {/* Media (Imagen o Video EN VIVO en el mismo contenedor) */}
          <div className="bg-gradient-to-br from-[#ffe6f3] via-[#efe6ff] to-[#e2fbf5] h-[37dvh] min-h-[240px] max-h-[300px] md:h-auto md:min-h-full md:max-h-none flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-pink-100">
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
            {activeMedia === 'video' && product.video && parseVideoUrl(product.video).type !== 'blocked' ? (
              <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
                {videoLoading && (
                  <div className="flex flex-col items-center gap-2 text-white text-xs">
                    <Loader2 size={28} className="animate-spin text-[#C84E97]" />
                    <span>Cargando video...</span>
                  </div>
                )}

                {/* Reproductor de video */}
                {videoType === 'embed' ? (
                  /* YouTube Shorts / Drive / Embeds */
                  <iframe
                    src={resolvedVideoUrl}
                    title={product.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoError ? (
                  /* Error en MP4 directo */
                  <div className="p-6 text-center text-white space-y-3">
                    <AlertCircle size={32} className="text-amber-400 mx-auto" />
                    <p className="text-xs text-gray-300">
                      El video no se pudo reproducir en este visor.
                    </p>
                    <a
                      href={product.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C84E97] text-white text-xs font-bold font-heading shadow-md"
                    >
                      <ExternalLink size={14} />
                      <span>Abrir video en nueva pestaña</span>
                    </a>
                  </div>
                ) : (
                  /* Video Directo MP4 / IndexedDB */
                  <video
                    src={resolvedVideoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : selectedPhoto ? (
              <img
                src={selectedPhoto}
                alt={displayedProduct.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <MugPlaceholder
                name={displayedProduct.name}
                category={product.category}
                colorClass={product.iconColor}
              />
            )}

            {/* Badges superiores */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.badge && (
                <div className="bg-gradient-to-r from-[#C84E97] to-[#B24185] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 font-heading">
                  <Sparkles size={13} className="text-[#FFDE59]" />
                  {product.badge}
                </div>
              )}
            </div>

            </div>

            {activeMedia === 'image' && photos.length > 1 && (
              <div className="w-full shrink-0 flex justify-center gap-2 overflow-x-auto px-4 py-3 bg-white/75 border-t border-pink-100">
                {photos.map((photo, index) => <button key={`${photo}-${index}`} type="button" onClick={() => setSelectedPhoto(photo)} className={`w-12 h-12 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${selectedPhoto === photo ? 'border-[#C84E97] shadow-sm' : 'border-white/80'}`}><img src={photo} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" /></button>)}
              </div>
            )}

            {/* Selector de cambio Foto / Video */}
            {product.video && parseVideoUrl(product.video).type !== 'blocked' && (
              <div className="w-full shrink-0 flex justify-center gap-2 px-4 py-3 bg-white/80 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setActiveMedia('image')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold font-heading flex items-center gap-1.5 shadow-md transition-all ${
                    activeMedia === 'image'
                      ? 'bg-[#C84E97] text-white scale-105'
                      : 'bg-white/95 text-gray-700 hover:bg-white'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMedia('video')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold font-heading flex items-center gap-1.5 shadow-md transition-all ${
                    activeMedia === 'video'
                      ? 'bg-[#C84E97] text-white scale-105'
                      : 'bg-white/95 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Video size={14} />
                  <span>Video</span>
                </button>
              </div>
            )}
          </div>

          {/* Información y Compra */}
          <div className="min-h-0 flex flex-col bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">{(product.categories?.length ? product.categories : [product.category]).filter(Boolean).map((category, index) => <React.Fragment key={category}>{index > 0 && <span aria-hidden="true" className="text-xs font-bold text-pink-300">/</span>}<button type="button" onClick={() => { onSelectCategory?.(category); onClose() }} className="text-left text-xs font-bold text-[#C84E97] uppercase tracking-wider font-heading hover:underline" title={`Ver ${category} en el catálogo`}>{category}</button></React.Fragment>)}</div>
                  {product.reference && (
                    <span className="bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] text-xs font-extrabold px-2.5 py-0.5 rounded-md font-heading">
                      Ref: {product.reference}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFavorite && onToggleFavorite(product.id)}
                  className={`p-2.5 rounded-full border transition-all ${
                    isFavorite
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-400 hover:text-rose-500 border-pink-200'
                  }`}
                  title="Guardar en favoritos"
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                {product.name}
              </h2>

              {(product.variants || []).length > 0 && <div className="pt-1">
                <p className="text-xs font-bold text-gray-700 mb-2">Elige color o diseño:</p>
                <div className="flex flex-wrap gap-2">{product.variants.map(variant => <button key={variant.id} type="button" onClick={() => setSelectedVariantId(variant.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${selectedVariantId === variant.id ? 'bg-[#C84E97] border-[#C84E97] text-white' : 'bg-white border-pink-200 text-gray-700'}`}>{variant.name}</button>)}</div>
                {!hasCouplePromotion && (product.variants || []).filter(variant => variant.isAvailable !== false).length > 1 && <button type="button" onClick={handleAddAllStyles} className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#fff0f7] text-[#C84E97] border border-pink-200 hover:bg-pink-100 text-xs font-heading font-extrabold transition-colors"><ShoppingCart size={15} />Pedir todos los estilos</button>}
              </div>}

              {hasCouplePromotion ? <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-2.5 sm:p-3">
                <div className="flex items-center justify-between gap-2 mb-2"><p className="font-heading font-extrabold text-sm text-amber-900">💞 Llévalos en pareja y ahorra</p><span className="text-[10px] font-bold text-amber-800 shrink-0">Promo especial</span></div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPurchaseType('single')} className={`rounded-xl border p-2.5 text-left transition-colors ${purchaseType === 'single' ? 'bg-white border-[#C84E97] ring-1 ring-pink-200' : 'bg-white/60 border-amber-200 hover:bg-white'}`}><span className="block text-[10px] font-bold text-gray-500">Uno solo</span><span className="font-heading text-base font-extrabold text-gray-900">{formatCOP(displayedProduct.price)}</span></button>
                  <button type="button" onClick={() => setPurchaseType('couple')} className={`rounded-xl border p-2.5 text-left transition-colors ${purchaseType === 'couple' ? 'bg-white border-[#C84E97] ring-1 ring-pink-200' : 'bg-white/60 border-amber-200 hover:bg-white'}`}><span className="block text-[10px] font-bold text-gray-500">La pareja</span><span className="font-heading text-base font-extrabold text-[#C84E97]">{formatCOP(displayedProduct.pairPrice)}</span></button>
                </div>
                <p className="mt-2 text-[11px] text-amber-900">Ahorras {formatCOP(Math.max(0, displayedProduct.price * 2 - displayedProduct.pairPrice))}. La pareja cuenta como 1 producto para descuentos por cantidad.</p>
              </div> : <div className="text-3xl font-extrabold text-gray-900 font-heading">{formatCOP(displayedProduct.price)}</div>}

              {Number.isSafeInteger(displayedProduct.capacityMl) && <p className="inline-flex w-fit items-center rounded-full bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-800">Capacidad: {displayedProduct.capacityMl} ml</p>}

              {displayedProduct.description && <p className="text-sm text-gray-600 leading-relaxed pt-1">{displayedProduct.description}</p>}

              {/* Estado de stock con #ebffd5 */}
              <div className="pt-1">
                {isAvailable ? (
                  <div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2c5315] bg-[#ebffd5] px-3.5 py-1.5 rounded-full border border-[#c2ebb0]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2c5315] animate-pulse"></span>
                    {displayedProduct.isImmediateDelivery ? 'Disponible para entrega inmediata' : 'Disponible para pedir'}
                  </span>{displayedProduct.isLastUnit && <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-rose-500 px-3.5 py-1.5 rounded-full animate-pulse">🔥 Última unidad disponible</span>}</div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200">
                    Agotado temporalmente (Pídelo por encargo)
                  </span>
                )}
              </div>
            </div>
            </div>

            {/* Acciones de compra */}
            <div className="shrink-0 space-y-2.5 sm:space-y-3.5 p-4 sm:px-8 sm:pb-6 border-t border-pink-100 bg-white">
              {isAvailable ? (
                <>
                  {/* Selector de cantidad con #ebffd5 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Cantidad:</span>
                    <div className="flex items-center gap-3 bg-[#ebffd5]/60 p-1.5 rounded-2xl border border-[#c2ebb0]">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold hover:bg-[#ebffd5] flex items-center justify-center transition-colors shadow-2xs"
                      >
                        -
                      </button>
                      <span className="font-heading font-bold text-base text-[#2c5315] px-2">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold hover:bg-[#ebffd5] flex items-center justify-center transition-colors shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Botón Agregar al Carrito */}
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#C84E97] via-[#D4559F] to-[#B24185] hover:from-[#B24185] hover:to-[#A93C7E] text-white font-heading text-base font-bold shadow-md shadow-pink-200 flex items-center justify-center gap-2.5 transition-all active:scale-95"
                  >
                    {addedAnimation ? (
                      <>
                        <Check size={20} />
                        <span>¡Agregado al Carrito! ✨</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>{purchaseType === 'couple' ? 'Agregar pareja' : 'Agregar al Carrito'} ({formatCOP(selectedPrice * quantity)})</span>
                      </>
                    )}
                  </button>

                  {/* Botón WhatsApp directo */}
                  <button
                    type="button"
                    onClick={() => {
                      onQuickOrder({ ...displayedProduct, price: selectedPrice, purchaseType, discountUnits: 1, cartLabel: purchaseType === 'couple' ? `${displayedProduct.name} · Promoción de pareja` : displayedProduct.name, quantity })
                      onClose()
                    }}
                    className="w-full py-2.5 sm:py-3 rounded-2xl bg-[#ebffd5] hover:bg-[#dffbbd] text-[#2c5315] font-heading text-sm font-extrabold border-2 border-[#b2e59b] flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <WhatsAppIcon size={18} />
                    <span>{purchaseType === 'couple' ? 'Pedir pareja por WhatsApp' : 'Pedir por WhatsApp ahora'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onQuickOrder(product)
                    onClose()
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-heading text-sm font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon size={18} />
                  <span>Consultar reposición por WhatsApp</span>
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Empaque reforzado antigolpes incluido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
