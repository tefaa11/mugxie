import React, { useRef, useState } from 'react'
import { ChevronDown, MessageCircleQuestion, Sparkles } from 'lucide-react'

const questions = [
  ['¿De qué están hechos los Mugs?', '☕ Nuestros Mugs están elaborados en cerámica importada de alta calidad, ideales para acompañarte en tus bebidas favoritas.'],
  ['¿Qué pasa si mi Mug llega en mal estado?', '💖 No te preocupes. Si tu Mug llega averiado, escríbenos con fotos o video apenas lo recibas y coordinaremos un nuevo envío sin costos adicionales para ti.'],
  ['¿Qué tipos de pago puedo elegir?', '📦 Para envíos por transportadora Inter Rapidísimo contamos con 2 alternativas de pago:\n\n1️⃣ Pago contra entrega:\nAntes de realizar el envío, cancelas el valor del envío + una pequeña comisión por el servicio de pago contra entrega. Al recibir tu pedido, únicamente cancelas el valor del Mug en efectivo.\n\n👉 Esta comisión es cobrada directamente por la transportadora, no por nosotros.\n\n2️⃣ Pago anticipado (sin costos adicionales):\nPuedes cancelar previamente el valor total del Mug por Nequi o Bre-B. Al recibir tu pedido, únicamente cancelas el valor del envío en efectivo. 😊\n\n💵 Ten presente que los cobros de Inter Rapidísimo se manejan únicamente en efectivo.\n\n🏍️ Si enviamos tu pedido con nuestro domiciliario, primero cancelas el costo del domicilio. Al recibirlo, puedes pagarle el valor del Mug al domiciliario por Nequi, Bre-B o en efectivo.'],
  ['¿Cómo sé cuánto cuesta mi envío?', '📍 Escríbenos por WhatsApp e indícanos dónde estás ubicado/a. Te contamos el valor del envío según tu zona y el método de entrega que elijas.'],
  ['No puedo pagar todo todavía, ¿puedo apartar?', '🌟 ¡Sí! Puedes apartar tu Mug con $10.000 y tendrás una semana para completar el pago del valor de los Mugs. Escríbenos para confirmar que la referencia esté disponible.'],
]

function Answer({ text, right }) {
  return <div className={`mt-2 rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed font-medium shadow-sm ${right ? 'bg-[#e9faff] text-[#245b70] border border-cyan-200 message-arrive-right' : 'bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] message-arrive-left'}`}><div className="flex gap-2 items-start"><Sparkles size={17} className="shrink-0 mt-0.5 text-[#C84E97]"/><span className="whitespace-pre-line">{text}</span></div></div>
}

export function FaqSection() {
  const [open, setOpen] = useState(0)
  const questionRefs = useRef([])
  const handleQuestion = (index, selected) => {
    setOpen(selected ? -1 : index)
    if (!selected) {
      window.setTimeout(() => {
        const question = questionRefs.current[index]
        if (!question) return
        const isMobile = window.matchMedia('(max-width: 639px)').matches
        const offset = isMobile ? Math.min(190, window.innerHeight * 0.25) : Math.min(240, window.innerHeight * 0.28)
        const top = window.scrollY + question.getBoundingClientRect().top - offset
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      }, 80)
    }
  }
  return <section id="preguntas-frecuentes" className="py-16 sm:py-24 bg-gradient-to-b from-[#fff8fa] via-[#eefbe4] to-white border-t-2 border-pink-100">
    <div className="max-w-5xl mx-auto px-4 sm:px-8">
      <div className="text-center max-w-2xl mx-auto mb-9"><span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ebffd5] text-[#2c5315] border border-[#c2ebb0] text-xs font-heading font-extrabold"><MessageCircleQuestion size={15}/>Mango responde tus dudas</span><h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">Preguntas frecuentes 💬</h2><p className="text-sm text-gray-600 mt-3">Toca una pregunta y Mango te responderá.</p></div>
      <div className="space-y-4">{questions.map(([question, answer], index) => { const selected=open===index; const right=index%2===1; return <div key={question} className={`flex ${right?'justify-end':'justify-start'} gap-3 items-start`}>
        {!right && <img src="/mango.png" alt="Mango" className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 animate-mango"/>}
        <div className="w-full max-w-2xl"><button ref={node => { questionRefs.current[index] = node }} type="button" onClick={() => handleQuestion(index, selected)} className={`w-full text-left rounded-3xl border-2 p-4 sm:p-5 flex items-center gap-3 transition-all ${selected?'bg-white border-[#C84E97] shadow-lg shadow-pink-100':'bg-[#fff0f7] border-pink-200 hover:border-pink-400 hover:-translate-y-0.5'}`}><span className="w-8 h-8 shrink-0 rounded-full bg-[#C84E97] text-white flex items-center justify-center font-heading font-bold text-sm">{index+1}</span><span className="font-heading text-sm sm:text-base font-bold text-gray-900 flex-1">{question}</span><ChevronDown size={20} className={`text-[#C84E97] transition-transform ${selected?'rotate-180':''}`}/></button>{selected&&<div className="scroll-mt-20"><Answer text={answer} right={right}/></div>}</div>
        {right && <img src="/mango.png" alt="Mango" className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 animate-mango"/>}
      </div>})}</div>
    </div>
  </section>
}
