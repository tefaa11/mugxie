import React from 'react'

const sparkles = [
  ['left-[1%] top-[16%]', '#ffde59', '0s'], ['right-[1%] top-[24%]', '#c84e97', '1.1s'],
  ['left-[2%] top-[47%]', '#5fd6ff', '2.4s'], ['right-[2%] top-[58%]', '#8ceda7', '0.6s'],
  ['left-[1%] bottom-[12%]', '#c84e97', '3s'], ['right-[1%] bottom-[17%]', '#ffde59', '1.7s'],
  ['left-[2%] top-[72%]', '#8ceda7', '2.1s'], ['right-[2%] top-[78%]', '#5fd6ff', '3.4s'],
]

export function SparkleField() {
  return <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden="true">
    {sparkles.map(([position, color, delay], index) => <svg key={index} style={{ color, animationDelay: delay }} className={`absolute ${position} w-3 h-3 sm:w-5 sm:h-5 sparkle-drift opacity-35`} viewBox="0 0 24 24" fill="none"><path d="M12 1.8c.74 6.36 3.84 9.46 10.2 10.2-6.36.74-9.46 3.84-10.2 10.2C11.26 15.84 8.16 12.74 1.8 12 8.16 11.26 11.26 8.16 12 1.8Z" fill="currentColor"/><circle cx="20" cy="4" r="1.2" fill="currentColor" /></svg>)}
  </div>
}
