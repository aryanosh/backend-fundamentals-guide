import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function TopNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 44,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      background: 'var(--bg-overlay)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link to="/" style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 18, letterSpacing: '0.04em',
        textDecoration: 'none', color: 'var(--accent-cyan)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26,
          border: '2px solid var(--accent-cyan)',
          fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan)',
          fontFamily: 'var(--font-mono)',
        }}>BT</span>
        BACKEND TERMINAL
      </Link>

      <div style={{ display: 'flex', gap: 4 }}>
        <NavBtn to="/" label="HUB" />
        <NavBtn to="/chapter/1" label="START" />
      </div>
    </nav>
  )
}

function NavBtn({ to, label }: { to: string; label: string }) {
  const [hover, setHover] = useState(false)
  return (
    <Link to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Navigate to ${label}`}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        color: hover ? 'var(--accent-cyan)' : 'var(--text-muted)',
        textDecoration: 'none',
        padding: '4px 10px',
        border: `1px solid ${hover ? 'var(--glass-border-hover)' : 'var(--border)'}`,
        background: hover ? 'var(--glass-bg-hover)' : 'transparent',
        transition: 'all 150ms',
      }}>
      {label}
    </Link>
  )
}
