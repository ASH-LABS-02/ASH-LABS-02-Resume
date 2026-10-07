import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { animate, type JSAnimation } from 'animejs'
import { useMotionPreference } from '../../motion/MotionContext'
import './MagicCard.css'

export default function MagicCard({ children, className = '', tilt = 1 }: { children: ReactNode; className?: string; tilt?: number }) {
  const card = useRef<HTMLDivElement>(null)
  const animation = useRef<JSAnimation | null>(null)
  const frame = useRef(0)
  const { enabled } = useMotionPreference()
  const reset = () => {
    cancelAnimationFrame(frame.current)
    animation.current?.cancel()
    if (card.current && enabled) animation.current = animate(card.current, { rotateX: 0, rotateY: 0, duration: 650, ease: 'out(4)' })
  }
  useEffect(() => {
    if (!enabled) card.current?.style.removeProperty('transform')
    return () => { cancelAnimationFrame(frame.current); animation.current?.revert() }
  }, [enabled])
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== 'mouse') return
    const element = card.current!
    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left, y = event.clientY - rect.top
    cancelAnimationFrame(frame.current)
    animation.current?.cancel()
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--mx', `${x}px`); element.style.setProperty('--my', `${y}px`)
      element.style.transform = `perspective(1100px) rotateX(${(0.5 - y / rect.height) * 8 * tilt}deg) rotateY(${(x / rect.width - 0.5) * 10 * tilt}deg)`
    })
  }
  return <div className="depth-perspective"><div ref={card} className={`magic-card ${className}`} onPointerMove={move} onPointerLeave={reset}>
    <div className="magic-card--glow" aria-hidden="true" /><div className="magic-card--content">{children}</div>
  </div></div>
}
