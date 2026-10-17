import React from 'react'
import {
  Heart,
  Sparkles,
  MapPin,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle,
  Coffee,
} from 'lucide-react'
import { NequiLogo, BreBLogo } from './PaymentLogos'
import { WhatsAppIcon } from './WhatsAppIcon'
import { FaqSection } from './FaqSection'

export function AboutSection({ storeConfig }) {
  return (
    <section id="sobre-nosotros" className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#F7FFED] to-white border-t-2 border-pink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Encabezado Principal */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ebffd5] text-[#2c5315] text-xs font-heading font-extrabold shadow-2xs border border-[#c2ebb0]">
            <Sparkles size={14} />
            <span>Conoce el mundo de Mugxie</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            ¿Quiénes somos y cómo cuidamos tu pedido? 💖
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            Encuentra diseños para acompañar tu café, sorprender con un regalo o elegir ese personaje que siempre te ha gustado.
          </p>
        </div>

        {/* 1. Historia & Mascota (¿Quiénes somos y dónde nos ubicamos?) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border-2 border-pink-100 shadow-sm">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative flex flex-col items-center text-center py-4">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-pink-200/70 via-[#ebffd5]/90 to-[#5FD6FF]/50 filter blur-2xl absolute inset-0 m-auto animate-aura"></div>
              <div className="relative max-w-44 sm:max-w-52 self-end mr-1 sm:-mr-10 mb-1 bg-white/95 border-2 border-pink-200 rounded-2xl p-2.5 text-[10px] sm:text-xs font-bold text-[#C84E97] shadow-sm text-left after:absolute after:left-5 after:-bottom-2 after:w-3 after:h-3 after:bg-white after:border-r-2 after:border-b-2 after:border-pink-200 after:rotate-45">¡Hola! Qué alegría que estés aquí. ✨</div>
              <img src="/pipe.png" alt="Pipe" className="relative w-56 h-56 sm:w-72 sm:h-72 object-contain animate-mango" />
              <h3 className="relative font-heading text-xl font-bold text-gray-900 -mt-2">Pipe</h3>
              <span className="relative text-xs text-[#C84E97] font-bold">Nuestro anfitrión oficial ✨</span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
              Nuestra Historia & Esencia ✨
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Mugxie nació del cariño por esos personajes que nos hacen sonreír y nos recuerdan momentos especiales. Aquí reunimos referencias inspiradas en caricaturas, películas, anime y recuerdos de infancia, para que encuentres un Mug que se sienta tan bonito como tu personaje favorito.
            </p>

            <div className="p-4 bg-[#ebffd5]/60 rounded-2xl border border-[#c2ebb0] space-y-2">
              <div className="flex items-center gap-2 font-heading text-base font-bold text-[#2c5315]">
                <MapPin size={18} className="text-[#2c5315]" />
                <span>¿Dónde nos ubicamos?</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Somos una <strong>tienda virtual ubicada en Bogotá, Colombia</strong>. Despachamos nuestros pedidos directamente a toda Colombia con atención cercana y humana por WhatsApp. Puedes escribirnos en cualquier momento para consultar existencias, fotos o referencias especiales.
              </p>
            </div>
          </div>
        </div>

        {/* 2. ¿Cómo empacamos? & Garantías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cómo empacamos */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-pink-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Package size={24} />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
                ¿Cómo empacamos tus tazas? 📦
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Sabemos que la cerámica es delicada, por eso nuestro proceso de embalaje está pensado para soportar cualquier trayecto:
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 pt-1">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#C84E97] flex-shrink-0 mt-0.5" />
                  <span><strong>Plástico de burbujas de alta densidad:</strong> Múltiples vueltas asegurando orejas, tapas y relieves 3D.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#C84E97] flex-shrink-0 mt-0.5" />
                  <span><strong>Caja rígida protectora:</strong> Medida exacta para evitar movimientos internos durante el viaje.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#C84E97] flex-shrink-0 mt-0.5" />
                  <span><strong>Sello y sticker de Frágil:</strong> Señalizado para que la transportadora lo trate con máximo cuidado.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-[#ebffd5] rounded-2xl border border-[#c2ebb0] text-xs text-[#2c5315] font-bold">
              📦 Cada Mug se prepara con cuidado para que llegue protegido a tus manos.
            </div>
          </div>

          {/* Garantías */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-pink-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
                Garantías y Compromiso 🛡️
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Comprar en Mugxie es 100% seguro y transparente:
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 pt-1">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Garantía de llegada intacta:</strong> Si por algún imprevisto del transporte tu taza llega con alguna fractura, te respondemos de inmediato con reposición o solución.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Verificación visual previa:</strong> Antes de pagar puedes pedirnos fotos reales o videos del vaso que vas a recibir para tu total tranquilidad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Acompañamiento en WhatsApp:</strong> Estamos contigo desde el momento que eliges tu vaso hasta que lo tienes en tus manos.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-bold">
              ✨ Tu satisfacción y tranquilidad son nuestra mayor prioridad.
            </div>
          </div>
        </div>

        {/* 3. Tiempos de Entrega & Medios de Pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tiempos y Envíos */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-pink-100 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
              Manejo de Envíos y Tiempos ⏱️
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Coordinamos cada despacho de manera ágil y ordenada:
            </p>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-amber-50/70 border border-amber-200 rounded-2xl p-3">
              Enviamos a nivel nacional por <strong>Interrapidísimo</strong>. Para gran parte de Bogotá también contamos con entrega por nuestro domiciliario; confírmanos tu zona por WhatsApp.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start gap-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="font-heading font-extrabold text-amber-800 text-base">1</span>
                <div>
                  <strong>Alistamiento y Despacho:</strong> Generalmente de 24 a 48 horas hábiles después de confirmar el pedido por WhatsApp. Si la referencia está disponible para envío inmediato, puede despacharse el mismo día según el horario y la operación de la transportadora. Consúltanos por WhatsApp.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="font-heading font-extrabold text-amber-800 text-base">2</span>
                <div>
                  <strong>Tiempo de transporte nacional:</strong> Habitualmente entre 2 a 4 días hábiles dependiendo de tu ciudad o municipio.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="font-heading font-extrabold text-amber-800 text-base">3</span>
                <div>
                  <strong>Guía de Seguimiento:</strong> Tan pronto entregamos tu paquete a la transportadora, te enviamos el número de guía para que rastrees tu pedido en vivo.
                </div>
              </div>
            </div>
          </div>

          {/* Medios de Pago (SOLO NEQUI Y BRE-B, sin Bancolombia) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-pink-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#C84E97] flex items-center justify-center">
                <Coffee size={24} />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
                Medios de Pago Disponibles 💳
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Aceptamos pagos instantáneos por las plataformas líderes de Colombia:
              </p>

              {/* Logos SOLO Nequi y Bre-B */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <NequiLogo className="shadow-xs" />
                <BreBLogo className="shadow-xs" />
              </div>

              <div className="p-4 bg-[#ebffd5]/60 rounded-2xl border border-[#c2ebb0] text-xs sm:text-sm text-gray-700 space-y-1.5 leading-relaxed">
                <p className="font-bold text-[#2c5315] flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  ¿Cómo realizas el pago?
                </p>
                <p>
                  Por seguridad tuya y de nuestro negocio, <strong>no publicamos cuentas bancarias ni números en la página web</strong>. Cuando envíes tu pedido a nuestro WhatsApp, te facilitamos directamente la información para transferir por Nequi o Bre-B.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${storeConfig?.whatsappNumber || '573123296618'}?text=${encodeURIComponent('¡Hola Mugxie! 💖😺 Quisiera hacer una consulta antes de pedir:')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[#ebffd5] hover:bg-[#dcfbb8] text-[#2c5315] font-heading text-xs sm:text-sm font-extrabold border-2 border-[#b2e59b] shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <WhatsAppIcon size={17} />
              <span>¿Tienes dudas? Escríbenos a WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
      <FaqSection />
    </section>
  )
}
