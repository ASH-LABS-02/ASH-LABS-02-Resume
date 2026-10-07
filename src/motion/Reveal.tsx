import { useEffect, useRef, type ReactNode } from 'react'
import { animate, createScope, onScroll } from 'animejs'
import { useMotionPreference } from './MotionContext'
export default function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const root = useRef<HTMLDivElement>(null)
  const { enabled } = useMotionPreference()
  useEffect(() => {
    if (!enabled || !root.current) return
    const scope = createScope({ root }).add(() => {
      animate(root.current!, { opacity: [0, 1], translateY: [45, 0], rotateX: [5, 0], duration: 900, delay, ease: 'out(4)',
        autoplay: onScroll({ target: root.current!, enter: 'bottom-=35 top', repeat: false }) })
    })
    return () => scope.revert()
  }, [enabled, delay])
  return <div ref={root} className={className}>{children}</div>
}
