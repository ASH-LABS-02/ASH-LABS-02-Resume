import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { animate, createScope, onScroll } from 'animejs'
import { useMotionPreference } from '../../motion/MotionContext'
import Reveal from '../../motion/Reveal'
import MagicCard from '../MagicCard/MagicCard'
import SceneBoundary from '../SceneBoundary'
import './CTA.css'
import { assetUrl } from '../../assetUrl'

const Constellation = lazy(() => import('./Constellation'))
const PALETTES = [{ name: 'Cyan', color: '#74e9e5' }, { name: 'Amethyst', color: '#b49aff' }, { name: 'Ember', color: '#ffb45f' }]
export default function CTA() {
  const section = useRef<HTMLElement>(null)
  const exportScene = useRef<((format?: 'desktop' | 'phone') => Promise<void>) | null>(null)
  const [nearby, setNearby] = useState(false)
  const [palette, setPalette] = useState(0)
  const [seed, setSeed] = useState(0)
  const [format, setFormat] = useState<'desktop' | 'phone'>('desktop')
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const { enabled } = useMotionPreference()
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNearby(true); observer.disconnect() } }, { rootMargin: '350px' })
    observer.observe(section.current!)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!enabled) return
    const element = section.current!
    let visible = false
    let updateVisibility = () => {}
    const scope = createScope({ root: section }).add(() => {
      animate('.cta-bg', { translateY: [-24, 24], ease: 'linear', autoplay: onScroll({ target: element, enter: 'bottom top', leave: 'top bottom', sync: .3 }) })
      const mascot = animate('.cta-mascot', { translateY: [0, -9], rotateY: [-7, 7], duration: 5000, alternate: true, loop: true, ease: 'inOutSine', autoplay: false })
      updateVisibility = () => {
        const active = visible && !document.hidden
        element.classList.toggle('is-scene-active', active)
        if (active) mascot.resume(); else mascot.pause()
      }
    })
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateVisibility() })
    observer.observe(element)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', updateVisibility); element.classList.remove('is-scene-active'); scope.revert() }
  }, [enabled])
  const save = async () => {
    if (!exportScene.current || saving) return
    setSaving(true); setNotice('')
    try { await exportScene.current(format); setNotice('A little universe, now yours. Wallpaper saved.') }
    catch { setNotice('Couldn’t save this time. Please try again.') }
    finally { setSaving(false) }
  }
  return <section className="cta-section" id="connect" ref={section} aria-labelledby="quest-heading" style={{ '--quest-color': PALETTES[palette].color } as CSSProperties}>
    <div className="cta-bg" aria-hidden="true" /><div className="cta-top-fade" aria-hidden="true" />
    <div className="cta-motes" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span key={index} style={{ '--i': index, '--row': index % 3 } as CSSProperties} />)}</div>
    <Reveal className="cta-card-wrap">
      <div className="cta-mascot-scene" aria-hidden="true"><img src={assetUrl('llama-nobg.webp')} alt="" width="1024" height="559" className="cta-mascot" loading="lazy" /></div>
      <MagicCard className="cta-card" tilt={0}>
        <div className="quest-layout">
          <div className="quest-copy">
            <p className="quest-eyebrow"><span aria-hidden="true">✧</span> A little something to keep</p>
            <h2 id="quest-heading" className="cta-headline">One last<br /><span>side quest.</span></h2>
            <p className="quest-intro">A small universe. Made by you.</p>
            <p className="cta-body">Break it apart. Find a new arrangement.<br />Choose a glow, then take it with you.</p>
            <p className="quest-control-label" id="quest-glow-label">Choose your glow</p>
            <div className="quest-palettes" role="group" aria-labelledby="quest-glow-label">
              {PALETTES.map((item, index) => <button key={item.name} aria-pressed={palette === index} disabled={status === 'unavailable' || saving} onClick={() => { setPalette(index); setNotice('') }} style={{ '--swatch': item.color } as CSSProperties}><span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 8 3 3 5-6" /></svg></span>{item.name}</button>)}
            </div>
          </div>
          <div className="quest-play">
            <div className="quest-sky-caption"><span>Constellation <b>{String(seed + 1).padStart(3, '0')}</b></span><span className="quest-live"><i aria-hidden="true" />{status === 'ready' ? PALETTES[palette].name + ' glow' : status === 'loading' ? 'Taking shape' : 'Night sky'}</span></div>
            <div className="quest-sky" aria-busy={status === 'loading'}>
              {nearby && <SceneBoundary onError={() => setStatus('unavailable')}><Suspense fallback={null}><Constellation color={PALETTES[palette].color} seed={seed} enabled={enabled} exportScene={exportScene} onStatus={setStatus} /></Suspense></SceneBoundary>}
              {status !== 'ready' && <p className="quest-loading">{status === 'loading' ? 'Gathering a few stars…' : 'This browser can’t render the stars. You can still keep the night sky.'}</p>}
            </div>
          </div>
        </div>
        <div className="quest-toolbar">
          <button className="quest-shuffle" onClick={() => { setSeed(value => value + 1); setNotice('') }} disabled={status !== 'ready' || saving}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4" /></svg>Shuffle stars</button>
          <div className="quest-export">
            {status !== 'unavailable' && <div className="quest-formats" role="group" aria-label="Wallpaper size">
              <button aria-pressed={format === 'desktop'} disabled={saving} onClick={() => { setFormat('desktop'); setNotice('') }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 21h8m-4-5v5" /></svg>Desktop</button>
              <button aria-pressed={format === 'phone'} disabled={saving} onClick={() => { setFormat('phone'); setNotice('') }}><svg width="16" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 18h4" /></svg>Phone</button>
            </div>}
            {status === 'unavailable' ? <a className="quest-save" href={assetUrl('night-sky.webp')} download="voxel-night-sky.webp">Save night sky</a> : <button className="quest-save" onClick={save} disabled={status !== 'ready' || saving}>{saving ? 'Saving…' : 'Save wallpaper'}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></svg></button>}
          </div>
        </div>
        <div className="quest-bottom-line"><span>{status === 'unavailable' ? 'The mountains are still yours to keep.' : `PNG · ${format === 'desktop' ? '2560 × 1440' : '1440 × 2560'}`}</span><p className="quest-note" role="status">{notice || 'No sign-up. Just a little stardust.'}</p></div>
      </MagicCard>
    </Reveal>
  </section>
}
