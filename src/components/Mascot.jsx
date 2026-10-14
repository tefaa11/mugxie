import React from 'react'

export function Mascot({ size = 'md', className = '', animated = true }) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size] || sizeClasses.md} ${animated ? 'animate-float' : ''} ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mugGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
          <linearGradient id="steamGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Aura / Brillo pastel */}
        <circle cx="100" cy="100" r="90" fill="#FDF2F8" />
        <circle cx="100" cy="100" r="82" fill="#FCE7F3" opacity="0.6" />

        {/* Estrellitas mágicas flotantes */}
        <path d="M42 40 L45 32 L48 40 L56 43 L48 46 L45 54 L42 46 L34 43 Z" fill="#FDE047" />
        <path d="M158 55 L160 48 L162 55 L169 57 L162 59 L160 66 L158 59 L151 57 Z" fill="#F472B6" />
        <path d="M165 140 L167 134 L169 140 L175 142 L169 144 L167 150 L165 144 L159 142 Z" fill="#67E8F9" />

        {/* Orejitas de gato */}
        <polygon points="62,65 42,20 85,42" fill="#2D2A32" />
        <polygon points="64,60 50,30 80,45" fill="#FBCFE8" />

        <polygon points="138,65 158,20 115,42" fill="#2D2A32" />
        <polygon points="136,60 150,30 120,45" fill="#FBCFE8" />

        {/* Cabeza del gatito */}
        <ellipse cx="100" cy="85" rx="54" ry="46" fill="#2D2A32" />

        {/* Máscara blanca del rostro */}
        <path d="M72 100 C72 82 84 72 100 72 C116 72 128 82 128 100 C128 116 115 125 100 125 C85 125 72 116 72 100 Z" fill="#FFFFFF" />

        {/* Manchas y flequillo blanco */}
        <path d="M96 55 L100 74 L104 55 Z" fill="#FFFFFF" />

        {/* Cachetes sonrojados kawaii */}
        <ellipse cx="68" cy="98" rx="8" ry="5" fill="#F472B6" opacity="0.65" />
        <ellipse cx="132" cy="98" rx="8" ry="5" fill="#F472B6" opacity="0.65" />

        {/* Ojos grandes tiernos con destellos */}
        <ellipse cx="80" cy="88" rx="7" ry="9" fill="#1E1B24" />
        <circle cx="78" cy="85" r="3" fill="#FFFFFF" />
        <circle cx="82" cy="91" r="1.5" fill="#FFFFFF" />

        <ellipse cx="120" cy="88" rx="7" ry="9" fill="#1E1B24" />
        <circle cx="118" cy="85" r="3" fill="#FFFFFF" />
        <circle cx="122" cy="91" r="1.5" fill="#FFFFFF" />

        {/* Naricita rosada y boquita */}
        <polygon points="98,96 102,96 100,100" fill="#F43F5E" />
        <path d="M96 101 Q100 106 104 101" stroke="#2D2A32" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M92 101 Q96 106 100 101" stroke="#2D2A32" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Bigotitos */}
        <line x1="50" y1="92" x2="66" y2="95" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="48" y1="102" x2="65" y2="101" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="150" y1="92" x2="134" y2="95" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="152" y1="102" x2="135" y2="101" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />

        {/* Cuerpo del gatito */}
        <ellipse cx="100" cy="145" rx="44" ry="34" fill="#2D2A32" />
        <ellipse cx="100" cy="148" rx="26" ry="24" fill="#FFFFFF" />

        {/* Tacita de café que sostiene el gatito */}
        <g transform="translate(74, 126)">
          {/* Vapor de café en forma de corazón */}
          <path d="M26 -8 C22 -18 32 -18 26 -26" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
          <path d="M34 -6 C30 -14 40 -14 34 -22" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

          {/* Oreja de la taza */}
          <path d="M48 10 C58 10 58 26 48 26" stroke="#6EE7B7" strokeWidth="4.5" fill="none" strokeLinecap="round" />

          {/* Cuerpo de la taza */}
          <path d="M8 6 L44 6 C42 32 10 32 8 6 Z" fill="url(#mugGradient)" stroke="#34D399" strokeWidth="1.5" />
          {/* Corazón en la taza */}
          <path d="M26 15 Q26 12 23 12 Q20 12 20 15 Q20 19 26 23 Q32 19 32 15 Q32 12 29 12 Q26 12 26 15 Z" fill="#FFFFFF" />
        </g>

        {/* Patitas del gatito abrazando la taza */}
        <circle cx="78" cy="134" r="8" fill="#FFFFFF" stroke="#F3E8FF" strokeWidth="1" />
        <circle cx="122" cy="134" r="8" fill="#FFFFFF" stroke="#F3E8FF" strokeWidth="1" />
      </svg>
    </div>
  )
}
