import React from 'react'

// Logo Oficial de Nequi
export function NequiLogo({ className = 'h-8' }) {
  return (
    <div className={`inline-flex items-center gap-2 bg-[#20002C] text-white px-3.5 py-2 rounded-2xl shadow-sm ${className}`}>
      <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0" fill="none">
        <rect width="100" height="100" rx="22" fill="#20002C" />
        <path
          d="M26 74V26H38.5L62 60.5V26H74V74H61.5L38 39.5V74H26Z"
          fill="#FF0077"
        />
        <circle cx="74" cy="26" r="4.5" fill="#FF0077" />
      </svg>
      <span className="font-heading font-extrabold text-sm tracking-wide text-white">
        nequi
      </span>
    </div>
  )
}

// Logo Oficial de Bre-B (Sistema de Pagos Inmediatos Colombia)
export function BreBLogo({ className = 'h-8' }) {
  return (
    <div className={`inline-flex items-center gap-2 bg-[#002D3A] text-white px-3.5 py-2 rounded-2xl shadow-sm border border-[#00E5FF]/30 ${className}`}>
      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#00FFA3] flex items-center justify-center text-[#002D3A] font-extrabold text-xs">
        B
      </div>
      <div className="flex items-baseline">
        <span className="font-heading font-extrabold text-sm tracking-tight text-white">
          bre
        </span>
        <span className="text-[#00E5FF] font-extrabold text-base leading-none">
          -B
        </span>
      </div>
    </div>
  )
}
