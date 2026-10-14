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
  const [hasMoreCategories, setHasMoreCategories] = useState(false)
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
    if (favicon) favicon.setAttribute('href', admin ? '/icono2.png' : '/icono.png')
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
      const cartId = product.variantId ? `${product.id}:${product.variantId}` : product.id
      const existing = prev.find((item) => (item.variantId ? `${item.id}:${item.variantId}` : item.id) === cartId)
      if (existing) {
        return prev.map((item) =>
          (item.variantId ? `${item.id}:${item.variantId}` : item.id) === cartId
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        )
      }
      return [...prev, { ...product, quantity: qtyToAdd }]
    })
    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
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
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.categories || []).some(category => category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.variants || []).some(variant => variant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))

      // Categoría
      const matchesCat =
        selectedCategory === 'Todos' || (p.categories?.length ? p.categories : [p.category]).includes(selectedCategory)

      // Favoritos
      const matchesFav = !showOnlyFavorites || favorites.includes(p.id)

      return matchesSearch && matchesCat && matchesFav
    }).sort((a, b) => priceOrder === 'asc' ? a.price - b.price : priceOrder === 'desc' ? b.price - a.price : priceOrder === 'az' ? a.name.localeCompare(b.name, 'es') : priceOrder === 'za' ? b.name.localeCompare(a.name, 'es') : 0)
  }, [products, searchQuery, selectedCategory, showOnlyFavorites, favorites, priceOrder])

  useEffect(() => setCatalogPage(1), [searchQuery, selectedCategory, showOnlyFavorites, priceOrder])
  useEffect(() => {
    const strip = categoryStripRef.current
    if (!strip) return
    const update = () => setHasMoreCategories(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 12)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [categoriesList])
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
        categoriesList={Array.from(new Set([...categoriesList, ...products.flatMap(p => (p.categories?.length ? p.categories : [p.category]).filter(Boolean))]))}
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
            if (q.trim()) setSelectedCategory('Todos')
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
              <span className="shrink-0"><span className="hidden sm:inline">Ordenar por precio</span><span className="sm:hidden">Ordenar</span></span>
              <select value={priceOrder} onChange={e => setPriceOrder(e.target.value)} className="min-w-0 flex-1 sm:flex-none bg-white border border-pink-200 rounded-xl px-3 sm:px-4 py-3">
                <option value="default">Orden del catálogo</option><option value="asc">Menor a mayor precio</option><option value="desc">Mayor a menor precio</option><option value="az">Nombre: A a Z</option><option value="za">Nombre: Z a A</option>
              </select>
              <button type="button" onClick={() => setShowOnlyFavorites(prev => !prev)} aria-label="Ver favoritos" title="Ver Mugs favoritos" className={`relative h-11 min-w-11 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${showOnlyFavorites ? 'bg-[#C84E97] text-white border-[#C84E97] shadow-md shadow-pink-200' : 'bg-white text-[#C84E97] border-pink-200 hover:bg-pink-50'}`}><Heart size={19} fill={showOnlyFavorites ? 'currentColor' : 'none'} />{favorites.length > 0 && <span className="font-heading text-xs font-bold">{favorites.length}</span>}</button>
            </div>
            {/* Barra de Filtros por Categoría */}
            <div className="relative mb-8">
              <div ref={categoryStripRef} onScroll={(event) => setHasMoreCategories(event.currentTarget.scrollLeft + event.currentTarget.clientWidth < event.currentTarget.scrollWidth - 12)} className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 pl-1 scrollbar-none pr-24">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat)
                      if (showOnlyFavorites) setShowOnlyFavorites(false)
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
        categoriesList={Array.from(new Set([...categoriesList, ...products.flatMap(p => (p.categories?.length ? p.categories : [p.category]).filter(Boolean))]))}
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
