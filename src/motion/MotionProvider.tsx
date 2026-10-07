import { useEffect, useState, type ReactNode } from 'react'
import { MotionContext } from './MotionContext'

function storedMotionEnabled() {
  try { return localStorage.getItem('portfolio-motion') !== 'off' } catch { return true }
}
export default function MotionProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return storedMotionEnabled()
  })
  useEffect(() => { document.documentElement.dataset.motion = enabled ? 'on' : 'off' }, [enabled])
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(!query.matches && storedMotionEnabled())
    const sync = (event: StorageEvent) => { if (event.key === 'portfolio-motion' || event.key === null) update() }
    query.addEventListener('change', update)
    window.addEventListener('storage', sync)
    return () => { query.removeEventListener('change', update); window.removeEventListener('storage', sync) }
  }, [])
  const toggle = () => setEnabled(previous => {
    try { localStorage.setItem('portfolio-motion', previous ? 'off' : 'on') } catch { /* Storage is optional. */ }
    return !previous
  })
  return <MotionContext.Provider value={{ enabled, toggle }}>{children}</MotionContext.Provider>
}
