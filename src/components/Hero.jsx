import React from 'react'
import { Sparkles, Heart, ArrowDown, Package, ShieldCheck, BadgePercent } from 'lucide-react'

export function Hero({ onExploreClick, storeConfig, onFaqClick }) {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16 bg-gradient-to-b from-[#FFF0F6] via-[#F7FFED] to-[#FFF8FA]">
      {/* Elementos decorativos de fondo flotantes */}
      <div className="absolute top-6 left-10 text-pink-300 opacity-60 animate-float">
        <Sparkles size={28} />
      </div>
      <div className="absolute bottom-12 left-1/4 text-[#8CEDA7] opacity-60 animate-float [animation-delay:1s]">
        <Heart size={24} />
      </div>
      <div className="absolute top-14 right-16 text-[#FFDE59] opacity-80 animate-float [animation-delay:2s]">
        <Sparkles size={32} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Texto y llamado a la acción */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ebffd5] border border-[#c2ebb0] shadow-xs text-xs sm:text-sm font-heading font-extrabold text-[#2c5315]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2c5315] animate-ping"></span>
              <span>¡Nuevas referencias disponibles en catálogo! ✨</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Mugs 3D de tus personajes{' '}
              <span className="bg-gradient-to-r from-[#C84E97] via-[#B24185] to-[#5FD6FF] bg-clip-text text-transparent">
                favoritos
              </span>
            </h1>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#ebffd5] border border-[#c2ebb0] text-sm font-heading font-extrabold text-[#2c5315] shadow-2xs">
              <span className="w-7 h-[18px] rounded-sm overflow-hidden border border-[#2c5315]/20 shadow-xs flex flex-col" aria-label="Bandera de Colombia"><i className="h-1/2 bg-[#FCD116]" /><i className="h-1/4 bg-[#003893]" /><i className="h-1/4 bg-[#CE1126]" /></span>
              Pago contraentrega a nivel nacional en Colombia
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto lg:mx-0">
              <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-[#B24185] text-white p-3.5 shadow-md text-left"><div className="flex items-center gap-2 font-heading font-extrabold"><BadgePercent size={20} className="text-[#FFDE59]" />Lleva 4 a 7 Mugs</div><p className="text-xs mt-1 text-white/90">Recibe 5% de descuento en tus Mugs.</p></div>
              <div className="rounded-2xl bg-gradient-to-br from-[#5a3f9e] to-[#8b5cc7] text-white p-3.5 shadow-md text-left"><div className="flex items-center gap-2 font-heading font-extrabold"><BadgePercent size={20} className="text-[#FFDE59]" />Lleva 8 o más</div><p className="text-xs mt-1 text-white/90">Recibe 10% de descuento en tus Mugs.</p></div>
            </div>

            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Descubre Mugs inspirados en tus personajes favoritos. Elige tu diseño y pide fácil por WhatsApp, con envío seguro a toda Colombia.
            </p>

            {/* Badges de confianza (con #ebffd5 y sin Bancolombia) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs sm:text-sm text-gray-700 font-medium">
              <span className="inline-flex items-center gap-1.5 bg-[#ebffd5]/70 px-3.5 py-1.5 rounded-full border border-[#c2ebb0] text-[#2c5315] font-bold shadow-2xs">
                <Package size={15} className="text-[#C84E97]" />
                Envíos a toda Colombia
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#ebffd5]/70 px-3.5 py-1.5 rounded-full border border-[#c2ebb0] text-[#2c5315] font-bold shadow-2xs">
                <ShieldCheck size={15} className="text-emerald-700" />
                Empaque seguro antigolpes
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#ebffd5]/70 px-3.5 py-1.5 rounded-full border border-[#c2ebb0] text-[#2c5315] font-bold shadow-2xs">
                💳 Nequi / Bre-B
              </span>
            </div>

            {/* Botones principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3">
              <button
                type="button"
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C84E97] via-[#D4559F] to-[#B24185] hover:from-[#B24185] hover:to-[#A93C7E] text-white font-heading font-bold text-sm sm:text-base shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5"
              >
                <span>Ver Catálogo de Mugs</span>
                <ArrowDown size={17} />
              </button>
            </div>
          </div>

          {/* Mascota / Tarjeta lateral */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-pink-200/60 via-[#ebffd5]/80 to-[#5FD6FF]/30 filter blur-2xl absolute inset-0 -m-4 animate-aura"></div>

              <div className="relative bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border-2 border-pink-200 shadow-xl shadow-pink-100 flex flex-col items-center text-center">
                <button type="button" onClick={onFaqClick} className="absolute -top-9 -left-5 sm:-left-16 max-w-44 bg-[#fff0f7] border-2 border-pink-200 rounded-2xl p-2.5 text-[10px] sm:text-xs font-bold text-[#C84E97] shadow-sm text-left hover:scale-105 transition-transform after:absolute after:right-5 after:-bottom-2 after:w-3 after:h-3 after:bg-[#fff0f7] after:border-r-2 after:border-b-2 after:border-pink-200 after:rotate-45">Estas son las dudas más frecuentes. ¡Tócalas y te ayudo! 💬</button>
                <img src="/mango.png" alt="Mango" className="w-48 h-48 sm:w-60 sm:h-60 object-contain animate-mango" />
                <div className="mt-3">
                  <h3 className="font-heading text-xl font-bold text-gray-900">
                    ¡Hola, soy Mango! 🥭
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C84E97] font-bold">
                    Tu compañero para los mejores Mugs
                  </p>
                </div>
                <div className="mt-4 px-3.5 py-1.5 bg-[#ebffd5] rounded-xl border border-[#c2ebb0] text-xs text-[#2c5315] font-extrabold">
                  ⭐ +25 referencias disponibles para despacho inmediato
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
