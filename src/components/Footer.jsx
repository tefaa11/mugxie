import React from 'react'
import { Heart, Shield, Sparkles } from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon'
import { NequiLogo, BreBLogo } from './PaymentLogos'

export function Footer({ storeConfig, onOpenAdmin, onNavigate }) {
  return (
    <footer className="bg-gradient-to-b from-[#FFF5F8] via-[#F7FFED] to-[#ebffd5]/40 pt-12 pb-8 border-t-2 border-pink-100 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-pink-200/80">
          {/* Col 1: Marca & Mascota */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Mugxie" className="w-14 h-14 object-contain" />
              <div>
                <span className="font-heading text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#C84E97] to-[#B24185] bg-clip-text text-transparent">
                  {storeConfig?.storeName || 'Mugxie'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 max-w-sm leading-relaxed">
              Tu lugar para encontrar Mugs diferentes, bonitos y llenos de tus personajes favoritos.
            </p>

            {/* Redes Sociales */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={`https://instagram.com/${storeConfig?.instagram || 'mugxie_'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white hover:bg-[#C84E97] text-[#C84E97] hover:text-white flex items-center justify-center transition-all shadow-xs border border-pink-200"
                title="Instagram @mugxie_"
              >
                <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href={storeConfig?.facebook ? `https://facebook.com/${storeConfig.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}` : 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center transition-all shadow-xs border border-pink-200 font-extrabold"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.75l.41-3h-3.16V8.09c0-.87.24-1.46 1.49-1.46H16.6V3.95c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.06V10H7.65v3h2.65v8h3.2Z" /></svg>
              </a>

              <a
                href={`https://tiktok.com/@${storeConfig?.tiktok || 'mugxie_'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white hover:bg-black text-gray-800 hover:text-white flex items-center justify-center transition-all shadow-xs border border-pink-200"
                title="TikTok @mugxie_"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.79 4.79 0 0 1-3.77-3.77h-3.1v12.3a2.8 2.8 0 1 1-2.8-2.8c.23 0 .45.03.66.08V9.35a6.12 6.12 0 1 0 5.24 6.05v-6.24a7.84 7.84 0 0 0 4.6 1.49V7.56a4.8 4.8 0 0 1-.83-.87Z" /></svg>
              </a>

              <a
                href={`https://wa.me/${storeConfig?.whatsappNumber || '573123296618'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white hover:bg-[#2c5315] text-[#2c5315] hover:text-white flex items-center justify-center transition-all shadow-xs border border-pink-200"
                title="WhatsApp de Atención"
              >
                <WhatsAppIcon size={20} />
              </a>
            </div>
          </div>

          {/* Col 2: Medios de Pago (SOLO NEQUI Y BRE-B) */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm sm:text-base font-bold text-gray-900 tracking-wide uppercase">
              Medios de Pago 💳
            </h4>
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <NequiLogo />
                <BreBLogo />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 italic pt-1">
                *Los datos de transferencia se comparten directamente en el chat de WhatsApp por seguridad.
              </p>
            </div>
          </div>

          {/* Col 3: Secciones y Enlaces */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm sm:text-base font-bold text-gray-900 tracking-wide uppercase">
              Enlaces Útiles 📦
            </h4>
            <ul className="text-xs sm:text-sm space-y-2 text-gray-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('catalog')}
                  className="hover:text-[#C84E97] font-semibold text-left"
                >
                  ☕ Catálogo de Mugs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('about')}
                  className="hover:text-[#C84E97] font-semibold text-left"
                >
                  📍 ¿Quiénes somos y dónde estamos?
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('about')}
                  className="hover:text-[#C84E97] font-semibold text-left"
                >
                  🚚 Tiempos y Envíos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('about')}
                  className="hover:text-[#C84E97] font-semibold text-left"
                >
                  🛡️ Empaque y Garantías
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="pt-6 flex items-center justify-center text-xs sm:text-sm text-gray-500">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center leading-relaxed">
            <span className="inline-flex items-center gap-1">Hecho con <Heart size={15} className="text-[#C84E97] fill-[#C84E97] shrink-0" /> para Mugxie</span>
            <span className="whitespace-nowrap">© {new Date().getFullYear()} • Todos los derechos reservados.</span>
          </p>


        </div>
      </div>
    </footer>
  )
}
