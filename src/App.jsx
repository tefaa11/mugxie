import { loadStore, saveResource, logout } from './utils/api'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  defaultStoreConfig,
} from './data/storeConfig'
import { TestimonialsSection } from './components/TestimonialsSection'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProductCard } from './components/ProductCard'
import { ProductDetailModal } from './components/ProductDetailModal'
import { CartDrawer } from './components/CartDrawer'
import { AdminModal } from './components/AdminModal'
import { AboutSection } from './components/AboutSection'
import { Footer } from './components/Footer'
import { Sparkles, Heart, Search, Filter, ShoppingBag, ArrowLeft } from 'lucide-react'
import { WhatsAppIcon } from './components/WhatsAppIcon'
import { SparkleField } from './components/SparkleField'
import { formatCOP, generateWhatsAppOrder } from './utils/whatsapp'
import { matchesSearch as textMatches } from './utils/search'

export default function App() {
  // Estados de datos
  const [categoriesList, setCategories] = useState(['Todos'])
  const [testimonials, setTestimonials] = useState([])
  const [priceOrder, setPriceOrder] = useState('default')
  const [catalogPage, setCatalogPage] = useState(1)
  const [products, setProducts] = useState([])
  const [storeConfig, setStoreConfig] = useState(defaultStoreConfig)
  const [currentView, setCurrentView] = useState('catalog') // 'catalog' | 'about'

  // Carrito persistido
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mugxie_cart_items')
      return saved ? JSON.parse(saved) : []
    } catch (_) {
      return []
    }
  })

  // Favoritos persistidos
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('mugxie_favorites')
      return saved ? JSON.parse(saved) : []
    } catch (_) {
      return []
    }
  })

  // Filtros y búsquedas
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [showImmediateDelivery, setShowImmediateDelivery] = useState(false)
  const [showLastUnits, setShowLastUnits] = useState(false)
  const [hasMoreCategories, setHasMoreCategories] = useState(false)
  const [hasPreviousCategories, setHasPreviousCategories] = useState(false)
  const categoryStripRef = useRef(null)

  // Modales
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(/^\/admin\/?$/.test(window.location.pathname))
  const [selectedProductDetail, setSelectedProductDetail] = useState(null)

  // Persistir cambios
  useEffect(() => {
    try {
      localStorage.setItem('mugxie_cart_items', JSON.stringify(cartItems))
    } catch (_) {}
  }, [cartItems])

  useEffect(() => {
    try {
      localStorage.setItem('mugxie_favorites', JSON.stringify(favorites))
    } catch (_) {}
  }, [favorites])

  const revisions = useRef({})
  const [databaseError, setDatabaseError] = useState('')
  const [databaseReady, setDatabaseReady] = useState(false)
  const refreshStore = async () => {
    const data = await loadStore()
    setProducts(data.products.value); setCategories(data.categories.value)
    setTestimonials(data.testimonials.value); setStoreConfig(data.config.value)
    revisions.current = Object.fromEntries(Object.entries(data).map(([k,v]) => [k,v.revision]))
    setDatabaseReady(true); setDatabaseError('')
  }
  useEffect(() => { refreshStore().catch(() => setDatabaseError('No se pudo conectar con la tienda. Intenta recargar en unos minutos.')) }, [])
  useEffect(() => {
    const admin = /^\/admin\/?$/.test(window.location.pathname)
    document.title = admin ? 'Mugxie Admin' : 'Mugxie'
    const favicon = document.querySelector("link[rel='icon']")
    if (favicon) favicon.setAttribute('href', admin ? '/icono2.png?v=20261014' : '/icono.png?v=20261014')
  }, [])
  const persist = async (name, updated, setter) => {
    if (!databaseReady) throw new Error('La base de datos no está conectada.')
    const result = await saveResource(name, updated, revisions.current[name])
    revisions.current[name] = result.revision; setter(result.value)
  }
  const handleSaveProducts = updated => persist('products', updated, setProducts)
  const handleSaveStoreConfig = updated => persist('config', updated, setStoreConfig)

  // Gestión de Carrito
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const qtyToAdd = product.quantity || 1
      const baseId = product.variantId ? `${product.id}:${product.variantId}` : product.id
      const cartId = product.cartId || `${baseId}:${product.purchaseType === 'couple' ? 'couple' : 'single'}`
      const itemCartId = item => item.cartId || `${item.variantId ? `${item.id}:${item.variantId}` : item.id}:${item.purchaseType === 'couple' ? 'couple' : 'single'}`
      const existing = prev.find(item => itemCartId(item) === cartId)
      if (existing) {
        return prev.map((item) =>
          itemCartId(item) === cartId
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        )
      }
      return [...prev, { ...product, cartId, quantity: qtyToAdd }]
    })
    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        (item.cartId || item.id) === cartId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (cartId) => {
    setCartItems((prev) => prev.filter((item) => (item.cartId || item.id) !== cartId))
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  // Pedido rápido de 1 solo vaso a WhatsApp
  const handleQuickOrder = (product) => {
    const qty = product.quantity || 1
    const { url } = generateWhatsAppOrder({
      cartItems: [{ ...product, quantity: qty }],
      storeConfig,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Favoritos
  const handleToggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  // Filtrado de productos visibles para el cliente
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Si está marcado como oculto por el admin, no se muestra
      if (p.isVisible === false || p.isAvailable === false) return false

      // Búsqueda por texto (nombre, categoría o referencia)
      const matchesText =
        textMatches(p.name, searchQuery) ||
        textMatches(p.reference, searchQuery) ||
        textMatches(p.category, searchQuery) ||
        (p.categories || []).some(category => textMatches(category, searchQuery)) ||
        (p.variants || []).some(variant => textMatches(variant.name, searchQuery)) ||
        textMatches(p.description, searchQuery)

      // Categoría
      const productCategories = p.categories?.length ? p.categories : [p.category]
      const matchesCat = selectedCategory === 'Todos' ||
        (selectedCategory === 'Parejas'
          ? p.isCouplePromotion === true || productCategories.includes('Parejas')
          : productCategories.includes(selectedCategory))

      // Favoritos
      const matchesFav = !showOnlyFavorites || favorites.includes(p.id)

      // Estado de disponibilidad: también revisa cada estilo del mismo mug.
      const matchesImmediate = !showImmediateDelivery || p.isImmediateDelivery ||
        (p.variants || []).some(variant => variant.isAvailable !== false && variant.isImmediateDelivery)
      const matchesLastUnit = !showLastUnits || p.isLastUnit ||
        (p.variants || []).some(variant => variant.isAvailable !== false && variant.isLastUnit)

      return matchesText && matchesCat && matchesFav && matchesImmediate && matchesLastUnit
    }).flatMap(p => {
      const matchedVariants = searchQuery.trim()
        ? (p.variants || []).filter(variant => textMatches(variant.name, searchQuery))
        : []
      // Solo fijamos la foto si la búsqueda identifica un único estilo.
      // Si coincide con varios (por ejemplo, “dragon”), conservamos una sola
      // publicación general y su galería seguirá mostrando los diseños.
      return matchedVariants.length === 1
        ? [{ ...p, searchMatchedVariant: matchedVariants[0] }]
        : [p]
    }).sort((a, b) => {
      if (priceOrder === 'asc') return a.price - b.price
      if (priceOrder === 'desc') return b.price - a.price
      if (priceOrder === 'az') return a.name.localeCompare(b.name, 'es')
      if (priceOrder === 'za') return b.name.localeCompare(a.name, 'es')
      if (priceOrder === 'capacityAsc' || priceOrder === 'capacityDesc') {
        const aCapacity = Number.isSafeInteger(a.capacityMl) ? a.capacityMl : null
        const bCapacity = Number.isSafeInteger(b.capacityMl) ? b.capacityMl : null
        if (aCapacity === null && bCapacity === null) return 0
        if (aCapacity === null) return 1
        if (bCapacity === null) return -1
        return priceOrder === 'capacityAsc' ? aCapacity - bCapacity : bCapacity - aCapacity
      }
      const referenceNumber = reference => Number((String(reference || '').match(/\d+/g) || []).at(-1))
      const aReference = referenceNumber(a.reference)
      const bReference = referenceNumber(b.reference)
      if (Number.isFinite(aReference) && Number.isFinite(bReference) && aReference !== bReference) return aReference - bReference
      if (Number.isFinite(aReference)) return -1
      if (Number.isFinite(bReference)) return 1
      return String(a.reference || '').localeCompare(String(b.reference || ''), 'es', { numeric: true })
    })
  }, [products, searchQuery, selectedCategory, showOnlyFavorites, showImmediateDelivery, showLastUnits, favorites, priceOrder])

  const allCategories = useMemo(() => Array.from(new Set([
    ...categoriesList,
    'Parejas',
    ...products.flatMap(p => (p.categories?.length ? p.categories : [p.category]).filter(Boolean)),
  ])), [categoriesList, products])

  const immediateReferences = useMemo(() => products.filter(product =>
    product.isVisible !== false && product.isAvailable !== false && (
      product.isImmediateDelivery ||
      (product.variants || []).some(variant => variant.isAvailable !== false && variant.isImmediateDelivery)
    )
  ).length, [products])

  useEffect(() => setCatalogPage(1), [searchQuery, selectedCategory, showOnlyFavorites, showImmediateDelivery, showLastUnits, priceOrder])
  useEffect(() => {
    const strip = categoryStripRef.current
    if (!strip) return
    const update = () => {
      setHasPreviousCategories(strip.scrollLeft > 12)
      setHasMoreCategories(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 12)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [allCategories])
  const productsPerPage = 24
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const visibleProducts = filteredProducts.slice((catalogPage - 1) * productsPerPage, catalogPage * productsPerPage)
  const totalCartCount = cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)

  const handleNavigate = (view) => {
    setCurrentView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isAdminRoute = /^\/admin\/?$/.test(window.location.pathname)
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8FA] text-[#3f3348] selection:bg-pink-200 selection:text-pink-900 font-sans">
      {databaseError && <p role="alert" className="bg-rose-50 text-rose-800 text-center p-4">{databaseError}</p>}
      {isAdminRoute ? <AdminModal
        isOpen
        fullPage
        onClose={() => { logout().finally(() => window.location.assign('/')) }}
        onAuthenticated={refreshStore}
        categoriesList={allCategories}
        onSaveCategories={updated => persist('categories', updated, setCategories)}
        testimonials={testimonials}
        onSaveTestimonials={updated => persist('testimonials', updated, setTestimonials)}
        products={products}
        onSaveProducts={handleSaveProducts}
        storeConfig={storeConfig}
        onSaveStoreConfig={handleSaveStoreConfig}
      /> : <><SparkleField />
      {/* Barra de Navegación */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          if (q.trim()) {
            setSelectedCategory('Todos')
            if (currentView !== 'catalog') setCurrentView('catalog')
            window.setTimeout(() => {
              const target = window.matchMedia('(max-width: 1023px)').matches
                ? document.getElementById('resultados-catalogo')
                : document.getElementById('catalogo')
              target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 80)
            return
          }
          if (currentView !== 'catalog') setCurrentView('catalog')
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        storeConfig={storeConfig}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Vista de Catálogo Principal */}
      {currentView === 'catalog' ? (
        <>
          {/* Hero / Banner de Bienvenida */}
          <Hero
            onExploreClick={() => {
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
            }}
            storeConfig={storeConfig}
            immediateReferences={immediateReferences}
            onFaqClick={() => {
              setCurrentView('about')
              window.setTimeout(() => document.getElementById('preguntas-frecuentes')?.scrollIntoView({ behavior: 'smooth' }), 80)
            }}
          />

          {/* Sección del Catálogo */}
          <main id="catalogo" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
            {/* Encabezado del catálogo */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] text-xs font-heading font-extrabold mb-2">
                  <Sparkles size={14} />
                  <span>Explora nuestros Mugs</span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Catálogo de Mugs Coleccionables ☕✨
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Cada mug incluye su número de referencia para identificarlo fácilmente en tu pedido.
                </p>
              </div>

              {/* Contador de resultados */}
              <div className="text-xs sm:text-sm font-semibold text-gray-700 bg-[#ebffd5]/50 px-4 py-2 rounded-2xl border border-[#c2ebb0] shadow-2xs self-start md:self-auto">
                Mostrando <strong>{visibleProducts.length}</strong> de {filteredProducts.length} Mugs disponibles
              </div>
            </div>

            <div className="flex flex-nowrap items-center gap-2 sm:gap-3 mb-5 text-sm font-bold">
              <span className="shrink-0"><span className="hidden sm:inline">Ordenar catálogo</span><span className="sm:hidden">Ordenar</span></span>
              <select value={priceOrder} onChange={e => setPriceOrder(e.target.value)} className="min-w-0 flex-1 sm:flex-none bg-white border border-pink-200 rounded-xl px-3 sm:px-4 py-3">
                <option value="default">Orden del catálogo</option><option value="asc">Menor a mayor precio</option><option value="desc">Mayor a menor precio</option><option value="capacityAsc">Menor a mayor capacidad</option><option value="capacityDesc">Mayor a menor capacidad</option><option value="az">Nombre: A a Z</option><option value="za">Nombre: Z a A</option>
              </select>
              <button type="button" onClick={() => setShowOnlyFavorites(prev => !prev)} aria-label="Ver favoritos" title="Ver Mugs favoritos" className={`relative h-11 min-w-11 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${showOnlyFavorites ? 'bg-[#C84E97] text-white border-[#C84E97] shadow-md shadow-pink-200' : 'bg-white text-[#C84E97] border-pink-200 hover:bg-pink-50'}`}><Heart size={19} fill={showOnlyFavorites ? 'currentColor' : 'none'} />{favorites.length > 0 && <span className="font-heading text-xs font-bold">{favorites.length}</span>}</button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-gray-600 mr-1">Filtrar:</span>
              <button type="button" onClick={() => setShowImmediateDelivery(prev => !prev)} aria-pressed={showImmediateDelivery} className={`min-h-10 px-3.5 rounded-xl border text-xs sm:text-sm font-heading font-bold transition-all ${showImmediateDelivery ? 'bg-[#e5ffd3] text-[#285417] border-[#8dcc69] shadow-sm' : 'bg-white text-gray-700 border-pink-200 hover:bg-[#e5ffd3]/50'}`}>⚡ Entrega inmediata</button>
              <button type="button" onClick={() => setShowLastUnits(prev => !prev)} aria-pressed={showLastUnits} className={`min-h-10 px-3.5 rounded-xl border text-xs sm:text-sm font-heading font-bold transition-all ${showLastUnits ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-white text-gray-700 border-pink-200 hover:bg-rose-50'}`}>🔥 Última unidad</button>
            </div>
            {/* Barra de Filtros por Categoría */}
            <div className="relative mb-8">
              <div ref={categoryStripRef} onScroll={(event) => { const strip = event.currentTarget; setHasPreviousCategories(strip.scrollLeft > 12); setHasMoreCategories(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 12) }} className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 pl-1 pr-14 scrollbar-none">
              {allCategories.map((cat) => {
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat)
                      setSearchQuery('')
                      if (showOnlyFavorites) setShowOnlyFavorites(false)
                      window.setTimeout(() => document.getElementById('resultados-catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#C84E97] to-[#B24185] text-white shadow-md shadow-pink-200 scale-105'
                        : 'bg-white hover:bg-[#ebffd5]/50 text-gray-700 border border-pink-200/90 hover:text-[#C84E97]'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                )
              })}
              </div>
              {hasPreviousCategories && <button type="button" onClick={() => categoryStripRef.current?.scrollBy({ left: -Math.max(220, categoryStripRef.current.clientWidth * 0.7), behavior: 'smooth' })} aria-label="Ver categorías anteriores" title="Ver categorías anteriores" className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-[#FFF8FA] via-[#FFF8FA] to-transparent flex items-center justify-start"><span className="w-8 h-8 rounded-full bg-white border border-pink-200 shadow-md text-[#C84E97] flex items-center justify-center font-bold hover:bg-pink-50 transition-colors">‹</span></button>}
              {hasMoreCategories && <button type="button" onClick={() => categoryStripRef.current?.scrollBy({ left: Math.max(220, categoryStripRef.current.clientWidth * 0.7), behavior: 'smooth' })} aria-label="Ver más categorías" title="Ver más categorías" className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#FFF8FA] via-[#FFF8FA] to-transparent flex items-center justify-end"><span className="w-8 h-8 rounded-full bg-white border border-pink-200 shadow-md text-[#C84E97] flex items-center justify-center font-bold hover:bg-pink-50 transition-colors">›</span></button>}
            </div>

            {/* Si está activo el filtro de favoritos */}
            {showOnlyFavorites && (
              <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm text-rose-700 font-bold flex items-center gap-2">
                  <Heart size={18} fill="currentColor" />
                  Mostrando solo tus Mugs favoritos guardados ({favorites.length})
                </span>
                <button
                  onClick={() => setShowOnlyFavorites(false)}
                  className="text-xs sm:text-sm text-rose-600 hover:underline font-bold"
                >
                  Ver todo el catálogo
                </button>
              </div>
            )}

            {/* Cuadrícula de Productos (2 por fila en celular) */}
            <div id="resultados-catalogo" className="scroll-mt-20">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickOrder={handleQuickOrder}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={(prod) => setSelectedProductDetail(prod)}
                  />
                ))}
              </div>
            ) : (
              /* Estado Vacío */
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-pink-200 p-8">
                <img src="/pipe.png" alt="Pipe" className="w-40 h-40 object-contain animate-mango" />
                <h3 className="font-heading text-xl font-bold text-gray-800">
                  No encontramos Mugs con esa búsqueda
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                  Intenta buscar por otro nombre, referencia (ej. MG-01) o escríbenos a WhatsApp si buscas un diseño específico.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('Todos')
                    setShowOnlyFavorites(false)
                  }}
                  className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-heading text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}
            </div>
            {filteredProducts.length > productsPerPage && <nav aria-label="Páginas del catálogo" className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(page => <button key={page} type="button" onClick={() => { setCatalogPage(page); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }) }} className={`w-10 h-10 rounded-xl font-bold ${page === catalogPage ? 'bg-[#C84E97] text-white' : 'bg-white border border-pink-200 text-gray-700'}`}>{page}</button>)}
            </nav>}
          </main>
        </>
      ) : (
        /* Vista Exclusiva "Quiénes Somos" */
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => handleNavigate('catalog')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-pink-200 text-pink-600 font-heading text-xs sm:text-sm font-bold shadow-2xs hover:bg-pink-50 transition-all"
            >
              <ArrowLeft size={16} />
              <span>Volver al Catálogo de Mugs</span>
            </button>
          </div>

          <AboutSection storeConfig={storeConfig} />
          <TestimonialsSection testimonials={testimonials} />
        </main>
      )}

      {/* Pie de Página */}
      <Footer
        storeConfig={storeConfig}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Modal de Detalle de Producto (con video 360°) */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
          onAddToCart={handleAddToCart}
          onQuickOrder={handleQuickOrder}
          isFavorite={favorites.includes(selectedProductDetail.id)}
          onToggleFavorite={handleToggleFavorite}
          onSelectCategory={(category) => {
            setSearchQuery('')
            setSelectedCategory(category)
            setCurrentView('catalog')
            window.setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }), 80)
          }}
        />
      )}

      {/* Carrito Lateral (Drawer sin preguntas de envío) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onViewCatalog={() => {
          setIsCartOpen(false)
          setCurrentView('catalog')
          window.setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }), 80)
        }}
        storeConfig={storeConfig}
      />

      {isAdminOpen && <AdminModal
        isOpen={isAdminOpen}
        onClose={() => { logout().finally(() => { setIsAdminOpen(false); window.location.assign('/') }) }}
        onAuthenticated={refreshStore}
        categoriesList={allCategories}
        onSaveCategories={updated => persist('categories', updated, setCategories)}
        testimonials={testimonials}
        onSaveTestimonials={updated => persist('testimonials', updated, setTestimonials)}
        products={products}
        onSaveProducts={handleSaveProducts}
        storeConfig={storeConfig}
        onSaveStoreConfig={handleSaveStoreConfig}
      />}

      {/* Botón flotante móvil para WhatsApp */}
      <a
        href={`https://wa.me/${storeConfig?.whatsappNumber || '573123296618'}?text=${encodeURIComponent('¡Hola Mugxie! 💖😺 Quisiera hacer una consulta sobre los mugs:')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir WhatsApp"
        className="fixed bottom-5 right-5 z-40 sm:hidden w-14 h-14 rounded-full bg-emerald-500 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white"
      >
        <WhatsAppIcon size={28} />
      </a></>}
    </div>
  )
}
