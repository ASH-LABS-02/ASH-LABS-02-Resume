import { useEffect, useRef } from 'react'
import { useMotionPreference } from '../motion/MotionContext'
export default function SiteHeader() {
  const { enabled, toggle } = useMotionPreference()
  const progress = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  useEffect(() => {
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const range = document.documentElement.scrollHeight - window.innerHeight
        progress.current?.style.setProperty('transform', `scaleX(${range > 0 ? window.scrollY / range : 0})`)
        header.current?.classList.toggle('is-scrolled', window.scrollY > 60)
        let active = ''
        for (const id of ['work', 'play', 'connect']) {
          const element = document.getElementById(id)
          if (element && element.getBoundingClientRect().top <= window.innerHeight * .45) active = `#${id}`
        }
        header.current?.querySelectorAll('nav a').forEach(link => {
          if (link.getAttribute('href') === active) link.setAttribute('aria-current', 'location')
          else link.removeAttribute('aria-current')
        })
      })
    }
    window.addEventListener('scroll', measure, { passive: true })
    const resize = new ResizeObserver(measure)
    resize.observe(document.body); measure()
    return () => { window.removeEventListener('scroll', measure); resize.disconnect(); cancelAnimationFrame(frame) }
  }, [])
  return <>
    <a href="#work" className="skip-link">Skip to projects</a>
    <header className="site-header" ref={header}>
      <a href="#home" aria-label="Ashwin Raghavendran, home" className="wordmark">AR<span>.</span></a>
      <nav aria-label="Main navigation">
        <a href="#work">Work</a><a href="#play">Play</a><a href="#connect">Side quest</a>
        <button className="motion-toggle" onClick={toggle} aria-pressed={!enabled}><span className="motion-dot" />{enabled ? 'Pause motion' : 'Enable motion'}</button>
      </nav>
    </header>
    <div className="reading-progress" ref={progress} aria-hidden="true" />
  </>
}
