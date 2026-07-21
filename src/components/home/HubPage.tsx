import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { chapters } from '../../content/index'
import { useProgress } from '../../hooks/useProgress'
import { GROUP_NAMES, GROUP_COLORS } from '../../types/content'

const GROUP_ORDER = ['foundation', 'core', 'scale', 'devops', 'roadmap'] as const

export default function HubPage() {
  const { completedChapters, isChapterComplete } = useProgress()

  const groups = useMemo(() => {
    const map: Record<string, typeof chapters> = {}
    for (const ch of chapters) {
      if (!map[ch.group]) map[ch.group] = []
      map[ch.group].push(ch)
    }
    return map
  }, [])

  const isAvailable = (id: number) => {
    if (id === 1) return true
    if (isChapterComplete(id)) return true
    return isChapterComplete(id - 1)
  }

  return (
    <div style={{ padding: '32px 20px 80px', maxWidth: 900, margin: '0 auto' }}>
      <Link to="/flow" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          padding: '20px 24px',
          transition: 'all 250ms',
          cursor: 'pointer',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--glass-border-hover)'
            el.style.boxShadow = '0 4px 24px var(--glow-cyan)'
            el.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--glass-border)'
            el.style.boxShadow = 'none'
            el.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-cyan)10',
              border: '1px solid var(--accent-cyan)30',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <ellipse cx="12" cy="12" rx="4" ry="10"/>
                <path d="M2 12h20"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-cyan)',
                marginBottom: 4,
              }}>
                INTERACTIVE DEMO
              </div>
              <div style={{
                fontSize: 16, fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: 'var(--text)',
                marginBottom: 4,
              }}>
                How the Internet Actually Works
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.4,
              }}>
                An interactive animated journey — from typing a URL to the page loading. Follow the request through DNS, ISP, backbone, CDN, load balancer, servers, database, and back.
              </div>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              LAUNCH
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3L9 7L5 11"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>

      <header style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 40, fontWeight: 700, letterSpacing: '0.06em',
          margin: 0,
          color: 'var(--text)',
        }}>
          <span style={{ color: 'var(--accent-cyan)' }}>BACKEND</span>{' '}
          <span style={{ color: 'var(--text-muted)' }}>TERMINAL</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12, color: 'var(--text-dim)',
          marginTop: 8, letterSpacing: '0.02em',
        }}>
          17 CHAPTER CAMPAIGN &mdash; MASTER THE BACKEND
        </p>
      </header>

      {GROUP_ORDER.map(group => {
        const chs = groups[group]
        if (!chs || chs.length === 0) return null
        const groupColor = GROUP_COLORS[group] || 'var(--accent-cyan)'

        return (
          <section key={group} style={{ marginBottom: 36 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 14,
            }}>
              <div style={{
                height: 1, flex: 1,
                background: `linear-gradient(90deg, ${groupColor}, transparent)`,
              }} />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14, fontWeight: 600, letterSpacing: '0.1em',
                color: groupColor, margin: 0,
              }}>
                {GROUP_NAMES[group].toUpperCase()} SECTOR
              </h2>
              <div style={{
                height: 1, flex: 1,
                background: `linear-gradient(90deg, transparent, ${groupColor})`,
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 10,
            }}>
              {chs.map(ch => {
                const completed = isChapterComplete(ch.id)
                const available = isAvailable(ch.id)
                const color = completed ? 'var(--complete)' : available ? groupColor : 'var(--locked)'

                const card = (
                  <div style={{
                    padding: '14px 12px',
                    border: `1px solid ${completed ? 'var(--complete-dim)' : 'var(--border)'}`,
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    opacity: available ? 1 : 0.35,
                    transition: 'all 250ms',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {completed && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        width: 0, height: 0,
                        borderStyle: 'solid',
                        borderWidth: '0 28px 28px 0',
                        borderColor: `transparent var(--complete) transparent transparent`,
                      }} />
                    )}
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                      fontFamily: 'var(--font-mono)',
                      color,
                      marginBottom: 6,
                    }}>
                      CH-{String(ch.id).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--font-display)',
                      color: available ? 'var(--text)' : 'var(--text-dim)',
                      lineHeight: 1.3, marginBottom: 6,
                    }}>
                      {ch.title}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-sans)',
                      lineHeight: 1.4,
                    }}>
                      {ch.subtitle}
                    </div>
                    <div style={{
                      marginTop: 10,
                      fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                      fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                      color,
                    }}>
                      {completed ? 'COMPLETE' : available ? 'OPEN CHAPTER' : 'LOCKED'}
                    </div>
                  </div>
                )

                if (!available) {
                  return <div key={ch.id}>{card}</div>
                }

                return (
                  <Link
                    key={ch.id}
                    to={`/chapter/${ch.id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                    onMouseEnter={e => {
                      const el = e.currentTarget.firstChild as HTMLElement
                      if (el) {
                        el.style.borderColor = completed ? 'var(--complete)' : groupColor
                        el.style.boxShadow = `0 4px 24px ${completed ? 'var(--complete-dim)' : 'var(--glow-cyan)'}`
                        el.style.transform = 'translateY(-2px)'
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget.firstChild as HTMLElement
                      if (el) {
                        el.style.borderColor = completed ? 'var(--complete-dim)' : 'var(--border)'
                        el.style.boxShadow = 'none'
                        el.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    {card}
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
