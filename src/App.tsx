import Hero from './components/Hero/Hero'
import Marquee from './components/Marquee/Marquee'
import FeaturedProjects from './components/FeaturedProjects/FeaturedProjects'
import CTA from './components/CTA/CTA'
import SiteHeader from './components/SiteHeader'
import MotionProvider from './motion/MotionProvider'
import Playground from './components/Playground/Playground'
import About from './components/About/About'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!['home', 'work', 'about', 'play', 'connect'].includes(id)) return
    let cancelled = false
    let frame = 0
    document.fonts.ready.then(() => {
      if (!cancelled) frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }))
    })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [])
  return (
    <MotionProvider>
      <SiteHeader />
      <main>
      <Hero />
      <Marquee direction="left" />
      <FeaturedProjects />
      <About />
      <Marquee direction="right" />
      <Playground />
      <CTA />
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} Ashwin Raghavendran</span><a href="#home">Back to the surface ↑</a></footer>
    </MotionProvider>
  )
}

export default App
