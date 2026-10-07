import { PROFILE, SKILL_GROUPS } from '../../data/portfolio'
import Reveal from '../../motion/Reveal'
import Arrow from '../Arrow'
import './About.css'

export default function About() {
  return <section className="about-section" aria-labelledby="about-heading" id="about">
    <Reveal className="about-intro">
      <div className="about-copy"><p className="about-eyebrow">Behind the builds</p><h2 id="about-heading">Code meets<br /><span>the real world.</span></h2><p className="about-summary">{PROFILE.summary}</p><a className="about-github" href={PROFILE.github} target="_blank" rel="noreferrer">Explore my GitHub <Arrow /></a></div>
      <div className="about-background">
        <div className="about-education"><p className="about-eyebrow">Learning & building</p><h3>{PROFILE.education.degree}</h3><p>{PROFILE.education.college}</p><dl><div><dt>Expected graduation</dt><dd>{PROFILE.education.graduation}</dd></div><div><dt>CGPA</dt><dd>{PROFILE.education.cgpa}</dd></div></dl></div>
        <div className="about-award"><span className="about-award-mark" aria-hidden="true">✧</span><div><p className="about-eyebrow">Atomberg Technologies · 2025</p><h3>Atomquest’25 semifinalist</h3><p>VacX recognized for innovation and full hardware implementation at the national hackathon.</p></div></div>
      </div>
    </Reveal>
    <Reveal className="about-skills"><div className="about-skills-heading"><h3>My working toolkit</h3><span>From firmware to the frontend</span></div><div className="skill-columns">{SKILL_GROUPS.map(group => <div key={group.title}><h4>{group.title}</h4><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div></Reveal>
  </section>
}
