import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { animate, createScope, onScroll, stagger } from 'animejs'
import { useMotionPreference } from '../../motion/MotionContext'
import Arrow from '../Arrow'
import SceneBoundary from '../SceneBoundary'
import { PROFILE } from '../../data/portfolio'
import './Hero.css'
import { assetUrl } from '../../assetUrl'
const VoxelScene = lazy(() => import('../VoxelScene/VoxelScene'))
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const portrait = useRef<HTMLDivElement>(null)
  const { enabled } = useMotionPreference()
  const [energized, setEnergized] = useState(true)
  useEffect(() => {
    if (!enabled) return
    const scope = createScope({ root }).add(() => {
      animate('.hero-enter', { opacity: [0, 1], translateY: [36, 0], delay: stagger(100, { start: 100 }), duration: 1100, ease: 'out(4)' })
      animate('.hero-scroll-layer', { translateY: [0, 120], scale: [1, 0.91], opacity: [1, 0.25], ease: 'linear',
        autoplay: onScroll({ target: root.current!, enter: 'top top', leave: 'top bottom', sync: 0.35 }) })
    })
    const stage = portrait.current!
    let frame = 0, x = 0, y = 0, targetX = 0, targetY = 0
    let visible = true
    const render = () => {
      frame = 0
      x += (targetX - x) * 0.075; y += (targetY - y) * 0.075
      stage.style.transform = `perspective(1200px) rotateY(${x * 7}deg) rotateX(${-y * 4}deg) translate3d(${x * 12}px,${y * 8}px,0)`
      if (visible && !document.hidden && (Math.abs(targetX - x) > .0001 || Math.abs(targetY - y) > .0001)) frame = requestAnimationFrame(render)
    }
    const start = () => { cancelAnimationFrame(frame); frame = 0; if (visible && !document.hidden) frame = requestAnimationFrame(render) }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const rect = root.current!.getBoundingClientRect()
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      if (!frame) start()
    }
    const reset = () => { targetX = 0; targetY = 0; start() }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start() })
    observer.observe(root.current!)
    const section = root.current!
    section.addEventListener('pointermove', move); section.addEventListener('pointerleave', reset)
    document.addEventListener('visibilitychange', start)
    return () => {
      scope.revert(); cancelAnimationFrame(frame); observer.disconnect()
      section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', reset)
      document.removeEventListener('visibilitychange', start); stage.style.removeProperty('transform')
    }
  }, [enabled])
  return <section className="hero" id="home" ref={root} aria-labelledby="hero-name" data-energy={energized ? 'on' : 'off'}>
    <div className="hero-orbit" aria-hidden="true" />
    <div className="hero-copy">
      <h1 id="hero-name" className="hero-name"><span className="hero-enter hero-first-name">ASHWIN</span><span className="hero-enter hero-last-name">RAGHAVENDRAN</span></h1>
      <p className="hero-headline hero-enter">{PROFILE.role}.<br />From intelligent software to connected hardware.</p>
      <p className="hero-background hero-enter">Computer Science (IoT) undergraduate<br /><span>Coimbatore, Tamil Nadu, India</span></p>
      <a className="primary-link hero-enter" href="#work">Explore my work <Arrow /></a>
    </div>
    <div className="hero-visual hero-scroll-layer">
      <div className="hero-aura" aria-hidden="true" />
      {enabled && <SceneBoundary><Suspense fallback={null}><VoxelScene energized={energized} /></Suspense></SceneBoundary>}
      <div className="portrait-tilt" ref={portrait}>
        <img className="portrait-image" src={assetUrl('transparent-base.webp')} width="1672" height="941" alt="Ashwin's voxel avatar, with swept hair, black sunglasses and a black hoodie" fetchPriority="high" />
        <img className={`portrait-image portrait-energy ${energized ? 'is-energized' : ''}`} src={assetUrl('transparent-flame.webp')} width="1672" height="941" alt="" aria-hidden="true" />
      </div>
    </div>
    <div className="hero-footer">
      <a href="#work" className="scroll-link"><Arrow down /> Scroll to explore</a>
      <button className="energy-toggle" onClick={() => setEnergized(value => !value)} aria-pressed={energized}><span className="energy-spark" aria-hidden="true">✧</span>{energized ? 'Energy on' : 'Ignite the avatar'}</button>
    </div>
  </section>
}
