import React from 'react'
import { ShoppingCart, Search, Sparkles, Info } from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon'

export function Navbar({
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  storeConfig,
  currentView,
  onNavigate,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-pink-100 shadow-sm">
      {/* Banner superior con mensaje */}
      <div className="bg-gradient-to-r from-[#C84E97] via-[#B24185] to-[#C84E97] text-white text-xs sm:text-sm py-2 px-4 text-center font-heading font-medium tracking-wide flex items-center justify-center gap-2 overflow-hidden shadow-2xs">
        <Sparkles size={14} className="animate-spin [animation-duration:8s] flex-shrink-0 text-[#ebffd5]" />
        <span className="truncate">{(storeConfig?.bannerMessage || '✨ ¡Envíos a toda Colombia! Mugs 📦').replace(/Mugs y piezas coleccionables 3D/i, 'Mugs').replace(/Mugs 3D/i, 'Mugs').replace('🐱', '')}</span>
        <Sparkles size={14} className="animate-spin [animation-duration:8s] flex-shrink-0 text-[#ebffd5]" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-6">
        {/* Logo de Mugxie (MUCHO MÁS GRANDE) */}
        <div
          onClick={() => onNavigate && onNavigate('catalog')}
          className="flex items-center cursor-pointer select-none group py-1"
          title="Mugxie - Inicio"
        >
          <img src="/logo.png" alt="Mugxie Logo" className="h-14 sm:h-24 lg:h-28 w-auto object-contain max-w-[110px] sm:max-w-[280px] transition-transform duration-300 group-hover:scale-105 drop-shadow-sm" />
        </div>

        {/* Enlaces de Navegación (Catálogo vs Quiénes Somos) */}
        <nav className="hidden lg:flex items-center gap-2 font-heading text-sm font-bold">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('catalog')}
            className={`px-4 py-2 rounded-2xl transition-all ${
              currentView === 'catalog'
                ? 'bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] shadow-2xs font-extrabold'
                : 'text-gray-600 hover:text-[#C84E97] hover:bg-pink-50'
            }`}
          >
            Catálogo de Mugs ☕
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('about')}
            className={`px-4 py-2 rounded-2xl transition-all ${
              currentView === 'about'
                ? 'bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] shadow-2xs font-extrabold'
                : 'text-gray-600 hover:text-[#C84E97] hover:bg-pink-50'
            }`}
          >
            ¿Quiénes somos & Envíos? 📦
          </button>
        </nav>

        {/* Buscador central */}
        <div className="flex-1 min-w-0 max-w-sm mx-0 sm:mx-1 relative">
          <input
            type="text"
            placeholder="Buscar por Mug o Ref (ej: MG-01)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#ebffd5]/35 hover:bg-[#ebffd5]/60 focus:bg-white border-2 border-[#d0f3b4] rounded-full focus:outline-none focus:border-[#C84E97] focus:ring-2 focus:ring-pink-200/50 transition-all placeholder:text-gray-400 text-gray-800"
          />
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C84E97]" />
        </div>

        {/* Acciones del Navbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('about')}
            aria-label="Ver información de Mugxie"
            title="Información, envíos y preguntas frecuentes"
            className="lg:hidden w-10 h-10 shrink-0 rounded-full bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] flex items-center justify-center"
          >
            <Info size={19} />
          </button>
          {/* Botón WhatsApp directo */}
          <a
            href={`https://wa.me/${storeConfig?.whatsappNumber || '573123296618'}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat directo de WhatsApp"
            className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#ebffd5] hover:bg-[#dffbbd] text-[#2c5315] text-xs sm:text-sm font-heading font-extrabold border border-[#c2ebb0] transition-all shadow-2xs"
          >
            <WhatsAppIcon size={17} />
            <span>WhatsApp</span>
          </a>

          {/* Botón Carrito */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Abrir carrito de compras"
            className="relative px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C84E97] via-[#D4559F] to-[#B24185] hover:from-[#B24185] hover:to-[#A93C7E] text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-pink-200 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#ebffd5] text-[#2c5315] font-extrabold text-[11px] flex items-center justify-center shadow-xs animate-bounce border border-[#c2ebb0]">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  )
}
