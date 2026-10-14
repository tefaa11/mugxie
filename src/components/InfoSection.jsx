import React from 'react'
import { Truck, Clock, CreditCard, ShieldCheck } from 'lucide-react'

export function InfoSection({ storeConfig }) {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-[#F7FFED] to-white border-y border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-[#2c5315] tracking-wider uppercase font-heading bg-[#ebffd5] px-3.5 py-1 rounded-full border border-[#c2ebb0]">
            Todo lo que necesitas saber
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            ¿Cómo manejamos tus pedidos en Mugxie? ✨
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Cuidamos cada detalle para que tu experiencia sea perfecta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Envíos */}
          <div className="bg-gradient-to-b from-pink-50/50 to-white p-6 rounded-3xl border-2 border-pink-100 hover:border-pink-300 transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#C84E97] flex items-center justify-center mb-4">
                <Truck size={24} />
              </div>
              <h3 className="font-heading text-base font-bold text-gray-800">
                Envíos a toda Colombia 🇨🇴
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Despachamos a cualquier rincón del país con transportadoras certificadas. También coordinamos entregas locales.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-pink-100 text-[11px] font-bold text-[#C84E97]">
              Tarifa ajustada a tu ciudad
            </div>
          </div>

          {/* Card 2: Empaque Seguro */}
          <div className="bg-gradient-to-b from-[#ebffd5]/40 to-white p-6 rounded-3xl border-2 border-[#c2ebb0] hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ebffd5] text-[#2c5315] flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-heading text-base font-bold text-gray-800">
                Empaque Antigolpes 📦
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Nuestros vasos son de cerámica fina, por eso los envolvemos con plástico de burbujas reforzado y cajas resistentes para que lleguen intactos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#c2ebb0] text-[11px] font-bold text-[#2c5315]">
              Garantía de entrega en perfecto estado
            </div>
          </div>

          {/* Card 3: Tiempos de Entrega */}
          <div className="bg-gradient-to-b from-amber-50/50 to-white p-6 rounded-3xl border-2 border-amber-100 hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="font-heading text-base font-bold text-gray-800">
                Tiempos de Entrega ⏱️
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Despacho rápido en 24 a 48 horas hábiles tras la confirmación de pago. Los envíos nacionales tardan generalmente de 2 a 4 días hábiles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100 text-[11px] font-bold text-amber-700">
              Te enviamos tu número de guía
            </div>
          </div>

          {/* Card 4: Medios de Pago */}
          <div className="bg-gradient-to-b from-emerald-50/50 to-white p-6 rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CreditCard size={24} />
              </div>
              <h3 className="font-heading text-base font-bold text-gray-800">
                Medios de Pago 💳
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Pagos 100% seguros por <strong>Nequi</strong> y <strong>Bre-B</strong>. Te enviamos los datos de transferencia directo al WhatsApp para tu seguridad.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] font-bold text-emerald-700">
              Coordinado por WhatsApp
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
