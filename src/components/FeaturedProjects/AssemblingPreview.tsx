import { useEffect, useRef, type CSSProperties } from 'react'
import { animate } from 'animejs'
import { useMotionPreference } from '../../motion/MotionContext'
import './AssemblingPreview.css'

const TILES = Array.from({ length: 12 }, (_, index) => ({ column: index % 4, row: Math.floor(index / 4) }))

export default function AssemblingPreview({ src, alt }: { src: string; alt: string }) {
  const root = useRef<HTMLDivElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const played = useRef(false)
  const { enabled } = useMotionPreference()

  useEffect(() => {
    const element = root.current
    const thumbnail = image.current
    if (!element || !thumbnail) return
    if (!enabled) {
      played.current = true
      element.dataset.assembly = 'settled'
      return
    }
    if (played.current) return
    element.dataset.assembly = 'ready'

    let inView = false
    let active = false
    const animations: ReturnType<typeof animate>[] = []
    const settle = () => {
      animations.forEach(animation => animation.cancel())
      active = false
      element.dataset.assembly = 'settled'
    }
    const start = () => {
      if (played.current || !inView || !thumbnail.complete || !thumbnail.naturalWidth) return
      played.current = true
      if (document.hidden) { settle(); return }
      active = true
      element.dataset.assembly = 'assembling'
      const tiles = element.querySelectorAll<HTMLElement>('.assembly-tile')
      tiles.forEach((tile, index) => {
        const { column, row } = TILES[index]
        const x = column - 1.5
        const y = row - 1
        animations.push(animate(tile, {
          translateX: [x * 20, 0],
          translateY: [y * 24, 0],
          translateZ: [70 + ((index * 7) % 5) * 14, 0],
          rotateX: [y * -12, 0],
          rotateY: [x * 10, 0],
          rotateZ: [(column - row - 0.5) * 2, 0],
          opacity: [0.3, 1],
          duration: 1050,
          delay: 50 + (Math.abs(x) + Math.abs(y)) * 40,
          ease: 'out(4)',
          onComplete: () => { if (index === tiles.length - 1) settle() },
        }))
      })
    }
    const onVisibility = () => {
      if (document.hidden && active) settle()
    }
    const onError = () => { played.current = true; settle() }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.22
      if (inView) start()
      else if (active) settle()
    }, { threshold: [0, 0.22] })
    observer.observe(element)
    thumbnail.addEventListener('load', start)
    thumbnail.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      thumbnail.removeEventListener('load', start)
      thumbnail.removeEventListener('error', onError)
      document.removeEventListener('visibilitychange', onVisibility)
      settle()
    }
  }, [enabled, src])

  return <div className="project-screen assembling-preview" ref={root}>
    <img ref={image} src={src} width="1200" height="800" loading="lazy" alt={alt} />
    {enabled && <span className="assembly-tiles" aria-hidden="true">
      {TILES.map(({ column, row }, index) => <span key={index} className="assembly-tile" style={{
        '--tile-column': column,
        '--tile-row': row,
        backgroundImage: `url("${src}")`,
        backgroundPosition: `${column / 3 * 100}% ${row / 2 * 100}%`,
      } as CSSProperties} />)}
    </span>}
  </div>
}
