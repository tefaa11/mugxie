import React from 'react'
import { Sparkles, Heart, Coffee } from 'lucide-react'

export function MugPlaceholder({ name = 'Mug', category = '', colorClass = 'bg-rose-100 text-rose-500' }) {
  // Iniciales o emoji según categoría
  const getIconForCategory = (cat) => {
    if (cat.includes('Snoopy')) return '🐶'
    if (cat.includes('Anime')) return '⚡'
    if (cat.includes('Disney')) return '🏰'
    if (cat.includes('Fútbol')) return '⚽'
    if (cat.includes('Cute')) return '🌸'
    if (cat.includes('Tetera')) return '🫖'
    return '☕'
  }

  const icon = getIconForCategory(category)

  return (
    <div className={`w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none bg-gradient-to-b from-pink-50/80 via-purple-50/50 to-amber-50/60`}>
      {/* Patrones decorativos de fondo */}
      <div className="absolute top-2 left-3 text-pink-300 opacity-60">
        <Sparkles size={16} />
      </div>
      <div className="absolute bottom-3 right-4 text-purple-300 opacity-60">
        <Heart size={16} />
      </div>

      {/* Ilustración de Taza 3D Pastel */}
      <div className="relative group-hover:scale-110 transition-transform duration-300 ease-out">
        {/* Vapor flotante */}
        <div className="flex justify-center gap-1.5 -mb-1 opacity-75">
          <span className="inline-block w-1.5 h-3 bg-pink-300 rounded-full animate-bounce [animation-delay:0ms]"></span>
          <span className="inline-block w-1.5 h-4 bg-purple-300 rounded-full animate-bounce [animation-delay:150ms]"></span>
          <span className="inline-block w-1.5 h-3 bg-teal-300 rounded-full animate-bounce [animation-delay:300ms]"></span>
        </div>

        {/* Taza y oreja */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-pink-200/80 shadow-lg shadow-pink-100 flex flex-col items-center justify-center relative z-10">
            <span className="text-3xl filter drop-shadow-sm">{icon}</span>
            <span className="text-[11px] font-bold text-pink-400 mt-1 uppercase tracking-wider font-heading">
              Mugxie
            </span>
          </div>

          {/* Oreja de la taza */}
          <div className="w-7 h-14 border-4 border-pink-200 rounded-r-2xl -ml-2 z-0"></div>
        </div>
      </div>

      <span className="text-xs text-pink-400/80 font-medium mt-3 bg-white/80 px-2.5 py-0.5 rounded-full border border-pink-100 shadow-xs">
        {category || 'Mug Coleccionable'}
      </span>
    </div>
  )
}
