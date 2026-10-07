export default function Arrow({ down = false }: { down?: boolean }) {
  return <svg className="arrow-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={down ? { transform: 'rotate(135deg)' } : undefined}>
    <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}
