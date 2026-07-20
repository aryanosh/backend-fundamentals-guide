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
      <header style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 36, fontWeight: 700, letterSpacing: '0.06em',
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
                    border: `1px solid ${completed ? 'var(--complete-dim)' : available ? 'var(--border)' : 'var(--border)'}`,
                    background: 'var(--bg-panel)',
                    opacity: available ? 1 : 0.35,
                    transition: 'all 200ms',
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
                      fontFamily: 'var(--font-mono)',
                      color: available ? 'var(--text)' : 'var(--text-dim)',
                      lineHeight: 1.3, marginBottom: 6,
                    }}>
                      {ch.title}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
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
                      {completed ? '✓ COMPLETE' : available ? '[ ENTER ]' : 'LOCKED'}
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
                        el.style.boxShadow = `0 0 16px ${completed ? 'var(--complete-dim)' : 'var(--glow-cyan)'}`
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget.firstChild as HTMLElement
                      if (el) {
                        el.style.borderColor = completed ? 'var(--complete-dim)' : 'var(--border)'
                        el.style.boxShadow = 'none'
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
