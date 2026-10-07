import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useMotionPreference } from '../../motion/MotionContext'
import Reveal from '../../motion/Reveal'
import SceneBoundary from '../SceneBoundary'
import './Playground.css'
import { assetUrl } from '../../assetUrl'

const Sculpture = lazy(() => import('./Sculpture'))
const FORMS = ['knot', 'sphere', 'cube'] as const
export default function Playground() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [nearby, setNearby] = useState(false)
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [shape, setShape] = useState<typeof FORMS[number]>('knot')
  const [scattered, setScattered] = useState(false)
  const [automatic, setAutomatic] = useState(true)
  const [phase, setPhase] = useState<'assembled' | 'bursting' | 'reshaping' | 'rebuilding'>('assembled')
  const [revision, setRevision] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const { enabled } = useMotionPreference()
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { rootMargin: '350px' })
    observer.observe(root.current!)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= .25), { threshold: [0, .25] })
    observer.observe(stage.current!)
    const visibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  useEffect(() => {
    if (!automatic || !enabled || !inView || !pageVisible || status !== 'ready') return
    // Only phase changes enter React; the per-frame tile interpolation stays in Three.js.
    let timer: ReturnType<typeof setTimeout>
    const burst = () => {
      setScattered(true); setPhase('bursting')
      timer = setTimeout(() => {
        setShape(current => FORMS[(FORMS.indexOf(current) + 1) % FORMS.length]); setPhase('reshaping')
        timer = setTimeout(() => {
          setScattered(false); setPhase('rebuilding')
          timer = setTimeout(() => {
            setPhase('assembled'); timer = setTimeout(burst, 4200)
          }, 1500)
        }, 1600)
      }, 1600)
    }
    setScattered(false); setPhase('assembled')
    timer = setTimeout(burst, 3600)
    return () => clearTimeout(timer)
  }, [automatic, enabled, inView, pageVisible, status])
  const takeControl = () => setAutomatic(false)
  const phaseLabel = !enabled ? 'Motion paused' : !automatic ? 'You’re in control' : phase === 'bursting' ? 'Breaking apart' : phase === 'reshaping' ? 'Finding a new form' : phase === 'rebuilding' ? 'Coming together' : 'Watch it transform'
  return <section className="playground" ref={root} id="play" aria-labelledby="play-title" data-sequence={automatic && enabled ? phase : 'manual'}>
    <Reveal className="play-copy"><span className="play-eyebrow">The voxel lab / 01</span><h2 id="play-title">A little room<br /><span>to play.</span></h2>
      <p>One system. Three forms.<br />Watch it rebuild—or take control.</p>
      <div className="play-shape-picker" role="group" aria-label="Choose sculpture shape">
        <span className="play-picker-label">Choose a form</span>
        <div className="play-shape-options">
          {FORMS.map((form, index) => <button key={form} disabled={status !== 'ready'} aria-pressed={shape === form} onClick={() => { takeControl(); setShape(form) }}><span aria-hidden="true">0{index + 1}</span>{form[0].toUpperCase() + form.slice(1)}</button>)}
        </div>
      </div>
      <div className="play-auto-row"><button className="play-auto" disabled={!enabled || status !== 'ready'} aria-label="Automatic sequence" aria-pressed={automatic && enabled} onClick={() => setAutomatic(value => !value)}><span className="play-auto-icon" aria-hidden="true">{automatic && enabled ? 'Ⅱ' : '▷'}</span>Auto cycle {automatic && enabled ? 'on' : 'off'}</button><span className="play-phase" aria-hidden="true">{phaseLabel}</span></div>
      <span className="play-instruction"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4" /></svg>Drag to rotate <span className="keyboard-hint">or use <kbd>←</kbd><kbd>→</kbd></span></span>
    </Reveal>
    <div className="play-stage">
      <div className="play-stage-header"><span className="play-render-status" data-ready={status === 'ready'}>{status === 'ready' ? 'Live 3D' : status === 'loading' ? 'Loading 3D' : 'Still preview'}</span><p className="play-shape" aria-live={automatic ? 'off' : 'polite'}><span>0{FORMS.indexOf(shape) + 1}</span> / {shape.toUpperCase()}{scattered ? ' · SCATTERED' : ''}</p></div>
      <div className="sculpture-wrap" ref={stage} onPointerDownCapture={event => { if (event.target instanceof HTMLCanvasElement && event.button === 0) takeControl() }} onKeyDownCapture={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) takeControl() }}>
        <img className="sculpture-fallback" src={assetUrl('previews/sculpture-still.webp')} alt="A cyan and lavender sculpture made from hundreds of small cubes" loading="lazy" hidden={status === 'ready' && nearby} />
        {nearby && <SceneBoundary onError={() => setStatus('unavailable')}><Suspense fallback={null}><Sculpture shape={shape} scattered={scattered} resetRevision={revision} enabled={enabled} onStatus={setStatus} /></Suspense></SceneBoundary>}
        {status === 'unavailable' && <p className="play-unavailable">A still view for your browser. Interactive 3D needs WebGL.</p>}
      </div>
      <div className="play-controls" role="group" aria-label="Sculpture controls">
        <button className="play-scatter" onClick={() => { takeControl(); setScattered(value => !value) }} disabled={status !== 'ready'} aria-pressed={scattered}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={scattered ? 'M3 8h5V3m13 5h-5V3M3 16h5v5m13-5h-5v5M3 3l5 5m13-5-5 5M3 21l5-5m13 5-5-5' : 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8 3 3m13 5 5-5M8 16l-5 5m13-5 5 5'} /></svg>{scattered ? 'Assemble' : 'Scatter'}</button>
        <button onClick={() => { takeControl(); setRevision(value => value + 1) }} disabled={status !== 'ready'}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></svg>Reset view</button>
      </div>
      <p className="play-tech-note">Three.js <span aria-hidden="true">×</span> Anime.js <span className="play-note-detail">/ {status === 'unavailable' ? 'static preview' : 'rendered in real time'}</span></p>
    </div>
  </section>
}
