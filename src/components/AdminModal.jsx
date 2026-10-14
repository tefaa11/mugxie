import { login, uploadMedia, getSession } from '../utils/api'
import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Download,
  UploadCloud,
  Lock,
  Sparkles,
  Settings,
  Coffee,
  Video,
  Loader2,
  MessageSquareQuote,
  Search,
} from 'lucide-react'
import { formatCOP } from '../utils/whatsapp'
import { ContentManager } from './ContentManager'
import { MugPlaceholder } from './MugPlaceholder'
import { parseVideoUrl } from '../utils/mediaStorage'

export function AdminModal({
  categoriesList,
  onSaveCategories,
  testimonials,
  onSaveTestimonials,
  onAuthenticated,
  isOpen,
  onClose,
  products,
  onSaveProducts,
  storeConfig,
  onSaveStoreConfig,
  fullPage = false,
}) {
  const [pinInput, setPinInput] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState(false)

  const [activeTab, setActiveTab] = useState('products') // 'products' | 'settings' | 'backup'
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todos')
  const [categorySearch, setCategorySearch] = useState('')
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  // Formulario de Producto
  const initialFormState = {
    id: '',
    reference: '',
    name: '',
    price: 55000,
    category: categoriesList.find(c => c !== 'Todos') || 'Colección Kawaii',
    categories: [categoriesList.find(c => c !== 'Todos') || 'Colección Kawaii'],
    description: '',
    badge: '',
    isAvailable: true,
    isImmediateDelivery: false,
    isLastUnit: false,
    isVisible: true,
    image: '',
    images: [],
    video: '',
    variants: [],
  }
  const [formData, setFormData] = useState(initialFormState)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Formulario de Configuración
  const [configForm, setConfigForm] = useState(storeConfig)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  useEffect(() => { setConfigForm(storeConfig) }, [storeConfig])
  useEffect(() => {
    if (!isOpen) return
    let active = true
    getSession().then(session => { if (active) setIsAuthenticated(session.authenticated) }).catch(() => {})
    return () => { active = false }
  }, [isOpen])

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    try { await login(pinInput); await onAuthenticated(); setIsAuthenticated(true); setAuthError(false); setPinInput('') }
    catch (err) { setAuthError(err.message) }
  }

  // Manejador de subida de imágenes
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploadingMedia(true)
    try { const url = await uploadMedia(file); setFormData(prev => ({ ...prev, image: url })) } catch (err) { alert(err.message) } finally { setIsUploadingMedia(false) }
  }
  const handleVariantImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploadingMedia(true)
    try {
      const url = await uploadMedia(file)
      setFormData(prev => ({ ...prev, variants: prev.variants.map((variant, position) => position === index ? { ...variant, image: url } : variant) }))
    } catch (err) { alert(err.message) } finally { setIsUploadingMedia(false) }
  }
  const handleExtraImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploadingMedia(true)
    try { const url = await uploadMedia(file); setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] })) } catch (err) { alert(err.message) } finally { setIsUploadingMedia(false) }
  }

  // Subir video al almacenamiento compartido
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('video/') || /tiktok/i.test(file.name)) { alert('Sube un archivo de video válido. No se admiten archivos identificados como TikTok.'); return }
    setIsUploadingMedia(true)
    let idbUrl
    try { idbUrl = await uploadMedia(file) } catch (err) { alert(err.message) }
    setIsUploadingMedia(false)

    if (idbUrl) {
      setFormData((prev) => ({ ...prev, video: idbUrl }))
      flashSuccess('¡Video guardado en el servidor! 🎥')
    } else {
      alert('Error guardando el video. Intenta con un archivo más ligero o pega un enlace directo.')
    }
  }

  const openNewProductForm = () => {
    const nextRefNum = products.length + 1
    const suggestedRef = `MG-${String(nextRefNum).padStart(2, '0')}`

    setFormData({
      ...initialFormState,
      id: 'mug-' + Date.now(),
      reference: suggestedRef,
    })
    setEditingProduct(null)
    setCategorySearch('')
    setIsFormOpen(true)
  }

  const openEditProductForm = (product) => {
    setFormData({ ...product, categories: product.categories?.length ? product.categories : [product.category], variants: (product.variants || []).map(variant => ({ ...variant, isImmediateDelivery: variant.isImmediateDelivery === true })) })
    setEditingProduct(product.id)
    setCategorySearch('')
    setIsFormOpen(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del mug.')
      return
    }

    if (parseVideoUrl(formData.video).type === 'blocked') { alert('TikTok no está permitido. Quita el enlace y sube un MP4, YouTube o Google Drive.'); return }
    if (isUploadingMedia) return
    const finalizedData = {
      ...formData,
      categories: (formData.categories || [formData.category]).filter(Boolean),
      category: (formData.categories || [formData.category]).filter(Boolean)[0] || formData.category,
      isImmediateDelivery: formData.isAvailable && formData.isImmediateDelivery,
      isLastUnit: formData.isAvailable && formData.isLastUnit,
      reference: formData.reference?.trim() || `MG-${Date.now().toString().slice(-3)}`,
    }

    let updatedList = []
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct ? finalizedData : p))
    } else {
      updatedList = [finalizedData, ...products]
    }

    try { await onSaveProducts(updatedList) } catch (err) { alert(err.message); return }
    setIsFormOpen(false)
    setFormData(initialFormState)
    setEditingProduct(null)
    flashSuccess('¡Mug guardado exitosamente! ✨')
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm('¿Estás seguro/a de eliminar este vaso del catálogo?')) {
      const updatedList = products.filter((p) => p.id !== productId)
      try { await onSaveProducts(updatedList) } catch (err) { alert(err.message); return }
      flashSuccess('Mug eliminado del catálogo.')
    }
  }

  const toggleStock = async (productId) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, isAvailable: !p.isAvailable, isImmediateDelivery: p.isAvailable ? false : p.isImmediateDelivery } : p
    )
    try { await onSaveProducts(updated) } catch (err) { alert(err.message); return }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    try { await onSaveStoreConfig(configForm) } catch (err) { alert(err.message); return }
    flashSuccess('¡Ajustes de la tienda actualizados! ✨')
  }

  const flashSuccess = (msg) => {
    setSaveSuccessMsg(msg)
    setTimeout(() => setSaveSuccessMsg(''), 3000)
  }

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `catalogo_mugxie_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleImportBackup = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (Array.isArray(parsed)) {
          if (parsed.some(p => parseVideoUrl(p.video).type === 'blocked')) { alert('El respaldo contiene enlaces de TikTok. Retíralos antes de importarlo.'); return }
          try { await onSaveProducts(parsed) } catch (err) { alert(err.message); return }
          flashSuccess('¡Catálogo importado exitosamente!')
        } else {
          alert('El archivo no tiene el formato válido de catálogo.')
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.')
      }
    }
    reader.readAsText(file)
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categories || []).some(category => category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.variants || []).some(variant => variant.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const productCategories = p.categories?.length ? p.categories : [p.category]
    const matchesCat = filterCategory === 'Todos' ||
      (filterCategory === '__agotados__' ? p.isAvailable === false : productCategories.includes(filterCategory))
    return matchesSearch && matchesCat
  })

  return (
    <div className={fullPage ? 'min-h-screen bg-[#fff8fa] flex flex-col' : 'fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6'}>
      <div className={fullPage ? 'bg-white min-h-screen w-full flex flex-col' : 'bg-white rounded-3xl w-full max-w-[1500px] h-[94vh] max-h-[94vh] flex flex-col shadow-2xl border-2 border-pink-200 overflow-hidden'}>
        {/* Header Admin */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-100 via-purple-100 to-pink-100 border-b border-pink-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#C84E97] shadow-sm flex items-center justify-center font-bold text-lg">
              👑
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-gray-900">
                Panel de Administración Mugxie
              </h2>
              <span className="text-xs text-[#C84E97] font-bold">
                Administración privada · fotos, diseños, referencias y disponibilidad
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors shadow-xs"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notificación flotante de éxito */}
        {saveSuccessMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 size={16} />
            {saveSuccessMsg}
          </div>
        )}

        {/* Pantalla de autenticación si no ha ingresado el PIN */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
            <img src="/logo.png" alt="Mugxie" className="w-32 h-32 object-contain" />
            <h3 className="font-heading text-xl font-bold text-gray-800">
              Acceso Administrador
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ingresa la contraseña del administrador para gestionar tu tienda.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3 pt-2">
              <div className="relative">
                <input
                  type="password"
                  maxLength={128}
                  placeholder="Contraseña del administrador"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-left tracking-[0.12em] text-base sm:text-lg font-bold py-3 pl-12 pr-4 rounded-2xl border-2 border-pink-200 focus:border-[#C84E97] focus:outline-none"
                  autoFocus
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 pointer-events-none" />
              </div>

              {authError && (
                <p className="text-xs text-rose-500 font-bold flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C84E97] to-[#A93C7E] text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                Ingresar al Panel ✨
              </button>
            </form>
          </div>
        ) : (
          /* Contenido del Panel Autenticado */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navegación de pestañas */}
            <div className="flex border-b border-pink-100 bg-pink-50/40 px-4 sm:px-6 gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('products')
                  setIsFormOpen(false)
                }}
                className={`py-3 px-4 font-heading text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-[#C84E97] text-[#C84E97] bg-white/70'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Coffee size={16} />
                Mugs y catálogo ({products.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings')
                  setIsFormOpen(false)
                }}
                className={`py-3 px-4 font-heading text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-[#C84E97] text-[#C84E97] bg-white/70'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Settings size={16} />
                Ajustes de tienda
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('backup')
                  setIsFormOpen(false)
                }}
                className={`py-3 px-4 font-heading text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'backup'
                    ? 'border-[#C84E97] text-[#C84E97] bg-white/70'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Download size={16} />
                Copias & Respaldos
              </button>
              <button type="button" onClick={() => { setActiveTab('content'); setIsFormOpen(false) }} className={`py-3 px-4 font-heading text-xs sm:text-sm whitespace-nowrap font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'content' ? 'border-[#C84E97] text-[#C84E97] bg-white/70' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><MessageSquareQuote size={16} />Categorías y testimonios</button>
            </div>

            {/* CUERPO DE LA PESTAÑA */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === 'content' && <ContentManager categories={categoriesList} onSaveCategories={onSaveCategories} testimonials={testimonials} onSaveTestimonials={onSaveTestimonials} products={products} onSaveProducts={onSaveProducts} />}
              {/* TAB 1: PRODUCTOS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {!isFormOpen ? (
                    <>
                      {/* Barra superior de acciones */}
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <div className="flex flex-1 gap-2">
                          <input
                            type="text"
                            placeholder="Buscar por nombre, referencia (MG-01) o categoría..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                          />
                          <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none text-gray-700"
                          >
                            <option value="__agotados__">Solo agotados</option>
                            {categoriesList.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={openNewProductForm}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C84E97] to-[#A93C7E] text-white font-heading text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Plus size={18} />
                          <span>Crear nuevo mug</span>
                        </button>
                      </div>

                      {/* Catálogo visual de Mugs */}
                      <div className="border border-pink-100 rounded-2xl overflow-hidden shadow-xs">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-5 p-2 sm:p-4">
                          {filteredProducts.map((p) => (
                            <div
                              key={p.id}
                              className={`p-2.5 sm:p-4 flex flex-col items-stretch gap-2.5 sm:gap-4 rounded-2xl border border-pink-100 hover:bg-pink-50/30 transition-colors ${
                                !p.isVisible ? 'bg-gray-50/80 opacity-60' : ''
                              }`}
                            >
                              {/* Miniatura */}
                              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#ffe6f3] via-[#efe6ff] to-[#e2fbf5] border border-pink-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <MugPlaceholder name={p.name} category={p.category} colorClass={p.iconColor} />
                                )}
                                {p.video && (
                                  <span className="absolute bottom-0 inset-x-0 bg-[#C84E97] text-white text-[8px] font-bold text-center">
                                    VIDEO
                                  </span>
                                )}
                              </div>

                              {/* Info con Referencia */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="bg-pink-100 text-[#C84E97] font-heading text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                                    Ref: {p.reference || 'S/R'}
                                  </span>
                                  <h4 className="font-heading text-sm sm:text-base font-bold text-gray-900 truncate">
                                    {p.name}
                                  </h4>
                                  {p.badge && (
                                    <span className="hidden sm:inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      {p.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs mt-1">
                                  <span className="font-bold text-[#C84E97]">
                                    {formatCOP(p.price)}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500">{p.category}</span>
                                </div>
                              </div>

                              {/* Acciones Rápidas */}
                              <div className="flex items-center gap-2">
                                {/* Toggle Stock */}
                                <button
                                  type="button"
                                  onClick={() => toggleStock(p.id)}
                                  title={p.isAvailable ? 'En Stock (Clic para marcar Agotado)' : 'Agotado (Clic para marcar En Stock)'}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                    p.isAvailable
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  }`}
                                >
                                  {p.isAvailable ? '✓ Disponible' : '✕ Agotado'}
                                </button>

                                {/* Editar */}
                                <button
                                  type="button"
                                  onClick={() => openEditProductForm(p)}
                                  className="w-8 h-8 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#C84E97] flex items-center justify-center transition-colors"
                                  title="Editar información, foto o video"
                                >
                                  <Edit2 size={16} />
                                </button>

                                {/* Eliminar */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-rose-100 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                                  title="Eliminar vaso"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* FORMULARIO DE AGREGAR / EDITAR VASO */
                    <form onSubmit={handleSaveProduct} className="bg-pink-50/40 p-5 rounded-3xl border border-pink-200 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-pink-200">
                        <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Sparkles size={18} className="text-[#C84E97]" />
                          {editingProduct ? 'Editar información del mug' : 'Crear nuevo mug'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsFormOpen(false)}
                          className="text-xs text-gray-500 hover:text-gray-800 font-bold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Nombre del Mug *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Mug Snoopy con Sombrero"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Número de Referencia *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. MG-01"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 font-bold text-[#C84E97]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Precio en COP ($) *
                          </label>
                          <input
                            type="number"
                            required
                            step="1000"
                            placeholder="70000"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({ ...formData, price: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Categorías: busca y marca una o varias</label>
                          <div className="rounded-xl border border-pink-200 bg-white p-2 space-y-2">
                            <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C84E97] pointer-events-none" /><input type="search" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} placeholder="Buscar categoría aquí…" className="w-full pl-8 pr-2.5 py-2.5 text-xs bg-pink-50 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-[#C84E97]" /></div>
                            <div className="max-h-24 overflow-y-auto space-y-1">
                            {categoriesList.filter(c => c !== 'Todos' && c.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => {
                              const checked = (formData.categories || []).includes(cat)
                              return <label key={cat} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"><input type="checkbox" checked={checked} onChange={() => setFormData(prev => { const categories = checked ? prev.categories.filter(item => item !== cat) : [...(prev.categories || []), cat]; return { ...prev, categories, category: categories[0] || prev.category } })} /><span>{cat}</span></label>
                            })}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">Elige una o varias categorías.</p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            Etiqueta (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. ¡Más pedido! ⭐"
                            value={formData.badge}
                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                          />
                        </div>
                      </div>

                      {/* SECCIÓN DE FOTO */}
                      <div className="bg-white p-4 rounded-2xl border border-pink-200 space-y-2">
                        <label className="text-xs font-bold text-gray-800 block">
                          📸 Foto del Mug
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[#ffe6f3] via-[#efe6ff] to-[#e2fbf5] border-2 border-dashed border-pink-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {formData.image ? (
                              <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-xs text-[#C84E97] font-bold text-center p-2">
                                Sin foto
                              </span>
                            )}
                          </div>

                          <div className="flex-1 space-y-2 w-full">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-pink-100 hover:bg-pink-200 text-[#C84E97] text-xs font-bold rounded-xl transition-colors">
                              <Upload size={15} />
                              <span>Subir foto desde tu dispositivo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>

                            <input
                              type="text"
                              placeholder="O pega el enlace de la foto (https://...)"
                              value={formData.image}
                              disabled={isUploadingMedia}
                              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-pink-200 space-y-3">
                        <div><h4 className="text-xs font-bold text-gray-800">Fotos adicionales del Mug (opcionales)</h4><p className="text-[11px] text-gray-500">Sirven para mostrar diferentes ángulos del mismo diseño.</p></div>
                        <div className="flex flex-wrap gap-3">
                          {(formData.images || []).map((image, index) => <div key={`${image}-${index}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#ffe6f3] via-[#efe6ff] to-[#e2fbf5] border border-pink-200"><img src={image} alt={`Foto adicional ${index + 1}`} className="w-full h-full object-contain" /><button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, position) => position !== index) }))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white text-rose-600 text-xs font-bold">×</button></div>)}
                          <label className="w-20 h-20 cursor-pointer rounded-xl border-2 border-dashed border-pink-300 bg-pink-50 text-[#C84E97] text-[11px] font-bold flex items-center justify-center text-center p-2">+ Añadir foto<input type="file" accept="image/*" onChange={handleExtraImageUpload} className="hidden" /></label>
                        </div>
                      </div>

                      {/* SECCIÓN DE VIDEO CON SOPORTE DE INDEXEDDB Y URL */}
                      <div className="bg-white p-4 rounded-2xl border border-purple-200 space-y-2">
                        <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <Video size={16} className="text-[#C84E97]" />
                          <span>🎥 Video del Mug (Opcional)</span>
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <div className="w-24 h-24 rounded-2xl bg-purple-50 border-2 border-dashed border-purple-300 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                            {isUploadingMedia ? (
                              <Loader2 size={24} className="animate-spin text-[#C84E97]" />
                            ) : formData.video ? (
                              <span className="text-xs text-[#C84E97] font-bold text-center p-2">
                                ✓ Video listo
                              </span>
                            ) : (
                              <span className="text-[11px] text-purple-400 font-bold text-center p-2">
                                Sin video
                              </span>
                            )}
                          </div>

                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-xl transition-colors">
                                <Upload size={15} />
                                <span>Subir video (máximo 25 MB)</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={handleVideoUpload}
                                  className="hidden"
                                />
                              </label>

                              {formData.video && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, video: '' })}
                                  className="text-xs text-rose-500 hover:underline font-bold"
                                >
                                  Quitar video
                                </button>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-500">
                              YouTube Shorts, Google Drive o MP4. No se permiten enlaces de TikTok:
                            </p>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={formData.video.startsWith('idb://') ? 'Archivo de video cargado localmente' : formData.video}
                              disabled={formData.video.startsWith('idb://')}
                              onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Descripción o detalles del producto
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Descripción breve: material, capacidad, acabados..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-pink-200 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div><h4 className="text-sm font-bold text-gray-800">Variantes: color o diseño</h4><p className="text-[11px] text-gray-500">Agrupa, por ejemplo, Mickey, Minnie y sus amigos en la misma publicación.</p></div>
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), { id: `var-${Date.now()}`, name: '', image: '', price: '', isAvailable: true, isImmediateDelivery: false, isLastUnit: false }] }))} className="px-3 py-2 rounded-xl bg-pink-100 text-[#C84E97] text-xs font-bold">+ Añadir opción</button>
                        </div>
                        {(formData.variants || []).map((variant, index) => <div key={variant.id} className="grid grid-cols-1 sm:grid-cols-[1fr_130px_1fr_auto] gap-2 items-center bg-pink-50/50 p-3 rounded-xl">
                          <input required placeholder="Ej. Minnie rosada" value={variant.name} onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, name: e.target.value } : v) }))} className="px-3 py-2 text-xs bg-white border border-pink-200 rounded-lg" />
                          <input type="number" step="1000" min="0" placeholder="Precio opcional" value={variant.price} onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, price: e.target.value === '' ? '' : Number(e.target.value) } : v) }))} className="px-3 py-2 text-xs bg-white border border-pink-200 rounded-lg" />
                          <div className="space-y-2"><div className="flex gap-1"><input placeholder="URL foto opcional" value={variant.image || ''} onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, image: e.target.value } : v) }))} className="min-w-0 flex-1 px-3 py-2 text-xs bg-white border border-pink-200 rounded-lg" /><label className="cursor-pointer px-2 py-2 rounded-lg bg-pink-100 text-[#C84E97] text-xs font-bold">Foto<input type="file" accept="image/*" onChange={e => handleVariantImageUpload(e, index)} className="hidden" /></label></div><label className="flex items-center gap-1.5 text-[11px] font-bold text-[#2c5315] cursor-pointer"><input type="checkbox" checked={variant.isImmediateDelivery === true} onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, isImmediateDelivery: e.target.checked } : v) }))} />Entrega inmediata</label><label className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 cursor-pointer"><input type="checkbox" checked={variant.isLastUnit === true} onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, isLastUnit: e.target.checked } : v) }))} />Última unidad</label></div>
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }))} className="text-rose-600 text-xs font-bold px-2">Quitar</button>
                        </div>)}
                      </div>

                      {/* Switches de Estado */}
                      <div className="flex flex-wrap gap-5 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold text-gray-800">
                          <input
                            type="checkbox"
                            checked={formData.isAvailable}
                            onChange={(e) =>
                              setFormData({ ...formData, isAvailable: e.target.checked })
                            }
                            className="w-4 h-4 text-[#C84E97] rounded-sm focus:ring-[#C84E97]"
                          />
                          <span>En Stock / Disponible para pedir</span>
                        </label>

                        <label className={`flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold ${formData.isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                          <input
                            type="checkbox"
                            checked={Boolean(formData.isImmediateDelivery)}
                            disabled={!formData.isAvailable}
                            onChange={(e) => setFormData({ ...formData, isImmediateDelivery: e.target.checked })}
                            className="w-4 h-4 text-[#C84E97] rounded-sm focus:ring-[#C84E97] disabled:opacity-40"
                          />
                          <span>Disponible para entrega inmediata</span>
                        </label>

                        <label className={`flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold ${formData.isAvailable ? 'text-rose-700' : 'text-gray-400'}`}>
                          <input type="checkbox" checked={Boolean(formData.isLastUnit)} disabled={!formData.isAvailable} onChange={(e) => setFormData({ ...formData, isLastUnit: e.target.checked })} className="w-4 h-4 text-[#C84E97] rounded-sm focus:ring-[#C84E97] disabled:opacity-40" />
                          <span>Última unidad disponible</span>
                        </label>

                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-pink-200">
                        <button
                          type="button"
                          onClick={() => setIsFormOpen(false)}
                          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isUploadingMedia}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C84E97] to-[#A93C7E] text-white font-heading text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <Save size={16} />
                          <span>Guardar Mug</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: AJUSTES */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl">
                  <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-200 space-y-3">
                    <h3 className="font-heading text-base font-bold text-gray-800">
                      WhatsApp para recibir pedidos
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Número con código país 57
                        </label>
                        <input
                          type="text"
                          value={configForm.whatsappNumber}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, whatsappNumber: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none"
                          placeholder="573123296618"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Número a mostrar visible
                        </label>
                        <input
                          type="text"
                          value={configForm.whatsappDisplay}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, whatsappDisplay: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none"
                          placeholder="312 329 6618"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={configForm.instagram}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, instagram: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          TikTok
                        </label>
                        <input
                          type="text"
                          value={configForm.tiktok}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, tiktok: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Facebook
                        </label>
                        <input
                          type="text"
                          value={configForm.facebook || ''}
                          onChange={(e) => setConfigForm({ ...configForm, facebook: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-pink-200 rounded-xl focus:outline-none"
                          placeholder="usuario o enlace de Facebook"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C84E97] to-[#A93C7E] text-white font-heading text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Save size={16} />
                    <span>Guardar Cambios de Tienda</span>
                  </button>
                </form>
              )}

              {/* TAB 3: BACKUP */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-xl">
                  <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-200 space-y-3">
                    <h3 className="font-heading text-base font-bold text-gray-800 flex items-center gap-2">
                      <Download size={18} className="text-[#C84E97]" />
                      Descargar Copia de Seguridad (Backup)
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Descarga un archivo JSON con todos los vasos, precios, fotos, referencias y enlaces para respaldar tu catálogo.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="px-4 py-2 rounded-xl bg-[#C84E97] hover:bg-[#A93C7E] text-white font-heading text-xs font-bold shadow-md flex items-center gap-2"
                    >
                      <Download size={15} />
                      <span>Descargar Catálogo (JSON)</span>
                    </button>
                  </div>

                  <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-200 space-y-3">
                    <h3 className="font-heading text-base font-bold text-gray-800 flex items-center gap-2">
                      <UploadCloud size={18} className="text-purple-600" />
                      Restaurar Catálogo desde Archivo
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Si tu hermano editó el catálogo en otro equipo, súbelo aquí para sincronizarlo.
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading text-xs font-bold shadow-md">
                      <UploadCloud size={15} />
                      <span>Seleccionar archivo .JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
