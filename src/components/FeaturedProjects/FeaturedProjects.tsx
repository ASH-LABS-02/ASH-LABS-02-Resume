import { useCallback, useState, type CSSProperties } from 'react'
import { PROJECTS } from '../../data/portfolio'
import Reveal from '../../motion/Reveal'
import MagicCard from '../MagicCard/MagicCard'
import Arrow from '../Arrow'
import './FeaturedProjects.css'
import ProjectPreview from './ProjectPreview'
import AssemblingPreview from './AssemblingPreview'
import { assetUrl } from '../../assetUrl'

function ProjectCard({ project, onPreview }: { project: typeof PROJECTS[number]; onPreview: (project: typeof PROJECTS[number]) => void }) {
  return <article className="project-article" style={{ '--project-accent': project.accent } as CSSProperties}>
    <MagicCard className="project-card" tilt={0.35}>
      <button className="project-preview" onClick={() => onPreview(project)} aria-label={`Explore ${project.title}`} aria-haspopup="dialog">
        <AssemblingPreview src={project.thumbnail} alt={project.imageAlt ?? `${project.title} illustrated system overview`} />
        <span className="preview-action"><span>Explore the build</span><Arrow /></span>
      </button>
      <div className="project-info">
        <p className="project-category"><span className="project-number">{project.category.split(' / ')[0]}</span>{project.category.split(' / ')[1]}</p>
        <h3>{project.title}</h3><p className="project-subtitle">{project.subtitle}</p>
        <p className="project-recognition"><span aria-hidden="true">✧</span>{project.recognition}</p>
        <p className="project-description">{project.description}</p>
        {project.metrics ? <dl className="project-metrics">{project.metrics.map(metric => <div key={metric.value}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl> : null}
        <div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        <div className="project-links"><button onClick={() => onPreview(project)} aria-haspopup="dialog">Project overview <Arrow /></button>{project.live ? <a className="project-live-link" href={project.live} target="_blank" rel="noopener noreferrer">Launch app <Arrow /></a> : null}{project.source && <a href={project.source} target="_blank" rel="noreferrer">View source <Arrow /></a>}</div>
      </div>
    </MagicCard>
  </article>
}

export default function FeaturedProjects() {
  const [preview, setPreview] = useState<typeof PROJECTS[number] | null>(null)
  const closePreview = useCallback(() => setPreview(null), [])
  return <section className="featured-projects" id="work" aria-labelledby="projects-heading">
    <Reveal className="fp-heading">
      <div><h2 id="projects-heading">Featured<br /><span>Projects</span></h2><p>Intelligence in software. Impact in the real world.</p></div>
      <img src={assetUrl('enchantedbook.webp')} alt="" width="220" height="180" className="fp-book" loading="lazy" />
    </Reveal>
    <div className="fp-grid">
      {PROJECTS.map((project, index) => <Reveal key={project.title} className={index === PROJECTS.length - 1 && PROJECTS.length % 2 !== 0 ? 'fp-extra' : ''} delay={(index % 2) * 100}><ProjectCard project={project} onPreview={setPreview} /></Reveal>)}
    </div>
    <p className="fp-caption">Hardware, data, and spatial intelligence. Built with the same curiosity.</p>
    {preview && <ProjectPreview project={preview} onClose={closePreview} onNavigate={setPreview} />}
  </section>
}
