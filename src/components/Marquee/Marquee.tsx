import './Marquee.css'
import { assetUrl } from '../../assetUrl'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useMotionPreference } from '../../motion/MotionContext'
import SceneBoundary from '../SceneBoundary'
const PortalScene = lazy(() => import('../VoxelScene/PortalScene'))

const KEYWORDS = [
  'C++',
  'Python',
  'JavaScript',
  'React',
  'Flask',
  'Docker',
  'ESP32-CAM',
  'Pathway',
]
const INTERESTS = ['LLM Integration', 'Edge AI', 'Embedded Systems', 'Real-Time Data', 'Performance Engineering']

interface MarqueeProps {
  direction: 'left' | 'right'
}

function TextRow({ reverse, words }: { reverse: boolean; words: string[] }) {
  return (
    <div className={`marquee--textwrapper-hold ${reverse ? 'reverse' : ''}`}>
      {[false, true].map(duplicate => <span className="marquee--text" key={String(duplicate)} aria-hidden={duplicate || undefined}>{words.map(word => <span className="marquee-word" key={word}>{word}<i aria-hidden="true" /></span>)}</span>)}
    </div>
  )
}

export default function Marquee({ direction }: MarqueeProps) {
  const reversed = direction === 'right'
  const root = useRef<HTMLElement>(null)
  const { enabled } = useMotionPreference()
  const [nearby, setNearby] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { rootMargin: '250px' })
    observer.observe(root.current!)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={root} aria-label="Tools and interests" className={`marquee-section ${reversed ? 'is--reversed-marquee' : ''} ${enabled && nearby ? 'is-active' : ''}`}>
      {enabled && nearby && <SceneBoundary><Suspense fallback={null}><PortalScene /></Suspense></SceneBoundary>}
      <img
        src={assetUrl('nether-portal-nobg.webp')}
        alt=""
        aria-hidden="true"
        className="marquee--frame marquee--frame-left"
      />
      <img
        src={assetUrl('nether-portal-nobg.webp')}
        alt=""
        aria-hidden="true"
        className="marquee--frame marquee--frame-right"
      />

      <div className="marquee--rows">
        <p className="marquee-label">{reversed ? 'Ideas into experiences' : 'The tools behind the work'}</p>
        <TextRow reverse={reversed} words={KEYWORDS} />
        <TextRow reverse={!reversed} words={INTERESTS} />
      </div>
    </section>
  )
}
