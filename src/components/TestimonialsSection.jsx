import React, { useEffect, useRef, useState } from 'react'
import { Star, MessageCircleHeart, Quote } from 'lucide-react'

const bubbleStyles = [
  'bg-[#fff0f7] border-pink-200 text-[#7f315f] after:border-r-[#fff0f7]',
  'bg-[#effce2] border-[#bfe69f] text-[#315f26] after:border-l-[#effce2]',
  'bg-[#f2edff] border-purple-200 text-[#5d3f84] after:border-r-[#f2edff]',
  'bg-[#e9faff] border-cyan-200 text-[#245b70] after:border-l-[#e9faff]',
]

function TestimonialBubble({ testimonial, index }) {
  const bubbleRef = useRef(null)
  const [arrived, setArrived] = useState(false)
  const right = index % 2 === 1
  const style = bubbleStyles[index % bubbleStyles.length]
  useEffect(() => {
    const element = bubbleRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setArrived(true); observer.disconnect() } }, { threshold: 0.2 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <article ref={bubbleRef} className={`flex ${right ? 'justify-end' : 'justify-start'}`}>
    <div style={{ animationDelay: `${Math.min(index * 180, 720)}ms` }} className={`relative w-full max-w-[92%] sm:max-w-xl border-2 rounded-[1.75rem] p-4 sm:p-5 shadow-md ${style} ${right ? 'after:absolute after:right-[-11px] after:top-7 after:w-0 after:h-0 after:border-y-[10px] after:border-y-transparent after:border-l-[14px]' : 'after:absolute after:left-[-11px] after:top-7 after:w-0 after:h-0 after:border-y-[10px] after:border-y-transparent after:border-r-[14px]'} ${arrived ? (right ? 'message-arrive-right' : 'message-arrive-left') : 'opacity-0'}`}>
      <div className={`flex gap-3 sm:gap-4 ${right ? 'flex-row-reverse text-right' : ''}`}>
        {testimonial.image && <img src={testimonial.image} loading="lazy" decoding="async" alt="Foto compartida en el testimonio" className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shrink-0 border-2 border-white shadow-md" />}
        <div className="min-w-0 flex-1"><div className={`flex items-center gap-1 mb-2 ${right ? 'justify-end' : ''}`} aria-label={`${testimonial.rating} de 5 estrellas`}>{Array.from({ length: 5 }, (_, star) => <Star key={star} size={20} className={star < testimonial.rating ? 'text-amber-400 drop-shadow-sm' : 'text-white/70'} fill={star < testimonial.rating ? 'currentColor' : 'none'} />)}</div><Quote size={22} className={`opacity-40 mb-1 ${right ? 'ml-auto' : ''}`}/><p className="text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-wrap">{testimonial.comment}</p></div>
      </div>
    </div>
  </article>
}

export function TestimonialsSection({ testimonials }) {
  if (!testimonials.length) return null
  return <section className="max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 w-full">
    <div className="text-center mb-10"><span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 font-heading text-xs font-bold"><MessageCircleHeart size={15}/>Mensajes que nos alegran el día</span><h2 className="font-heading text-3xl sm:text-4xl font-bold mt-3">Lo que dicen de Mugxie 💖</h2><p className="text-gray-500 mt-3">Fotos y comentarios compartidos por quienes ya eligieron su Mug.</p></div>
    <div className="space-y-5 sm:space-y-7">{testimonials.map((testimonial, index) => <TestimonialBubble key={testimonial.id} testimonial={testimonial} index={index} />)}</div>
  </section>
}
