import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { PROJECTS } from '../../data/portfolio'
import Arrow from '../Arrow'

type Project = typeof PROJECTS[number]

function ProjectDetails({ project }: { project: Project }) {
  const [step, setStep] = useState(0)
  const selected = project.highlights[step]
  return <div className="case-study-content">
    <div className="case-study-visual">
      <img src={project.thumbnail} width="1200" height="800" alt={project.imageAlt ?? project.title + ' illustrated system overview'} />
      <p>{project.imageNote ?? 'System illustration · not a product photograph or live dashboard'}</p>
    </div>
    <div className="case-study-summary"><p className="case-study-label">The build</p><h3>{project.subtitle}</h3><p>{project.description}</p></div>
    {project.metrics ? <dl className="project-metrics case-study-metrics">{project.metrics.map(metric => <div key={metric.value}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl> : null}
    <div className="case-study-steps">
      <p className="case-study-label" id="system-focus-label">Inside the system</p>
      <div className="case-study-step-buttons" role="group" aria-labelledby="system-focus-label">{project.highlights.map((item, index) => <button key={item.title} aria-pressed={step === index} onClick={() => setStep(index)} aria-controls="system-focus-detail"><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}</div>
      <div className="case-study-step-detail" id="system-focus-detail" aria-live="polite"><h4>{selected.title}</h4><p>{selected.text}</p></div>
    </div>
    <div className="case-study-facts">
      <div><p className="case-study-label">My contribution</p><p>{project.contribution}</p></div>
      <div><p className="case-study-label">Outcome</p><p>{project.outcome}</p></div>
    </div>
    <div className="case-study-stack"><p className="case-study-label">Built with</p><div className="project-tags">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div></div>
  </div>
}

export default function ProjectPreview({ project, onClose, onNavigate }: { project: Project; onClose: () => void; onNavigate: (project: Project) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const index = PROJECTS.indexOf(project)
  const navigate = (direction: number) => onNavigate(PROJECTS[(index + direction + PROJECTS.length) % PROJECTS.length])
  useEffect(() => {
    const element = dialog.current!
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    const close = () => { if (!element.open) onClose() }
    element.addEventListener('close', close)
    return () => {
      element.removeEventListener('close', close); element.close()
      document.body.style.overflow = overflow; previous?.focus({ preventScroll: true })
    }
  }, [onClose])
  useEffect(() => { viewport.current?.scrollTo({ top: 0, behavior: 'instant' }) }, [project])
  return <dialog className="project-dialog case-study-dialog" ref={dialog} aria-labelledby="preview-title" style={{ '--project-accent': project.accent } as CSSProperties} onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="preview-shell">
      <header className="preview-header"><div><p>{project.category}</p><h2 id="preview-title">{project.title}</h2></div>
        <div className="preview-header-actions">{project.live ? <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`Launch ${project.title} app`}><span>Launch app</span><Arrow /></a> : null}{project.source && <a href={project.source} target="_blank" rel="noreferrer" aria-label="View source"><span>View source</span><Arrow /></a>}<button onClick={onClose} aria-label="Close project overview">✕</button></div>
      </header>
      <div className="case-study-scroll" ref={viewport} tabIndex={0} aria-label={project.title + ' project details'}><ProjectDetails key={project.title} project={project} /></div>
      <div className="preview-navigation"><button onClick={() => navigate(-1)} aria-label="Previous project">← <span>Previous</span></button><p aria-live="polite">{String(index + 1).padStart(2, '0')} <span>/ {String(PROJECTS.length).padStart(2, '0')}</span></p><button onClick={() => navigate(1)} aria-label="Next project"><span>Next project</span> →</button></div>
    </div>
  </dialog>
}
