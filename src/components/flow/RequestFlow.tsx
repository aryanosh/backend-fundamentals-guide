import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowScene from './FlowScene'
import FlowTooltip from './FlowTooltip'
import { PHASES, NODES } from './FlowData'

export default function RequestFlow() {
  const navigate = useNavigate()
  const [activePhase, setActivePhase] = useState(0)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [completedPhases, setCompletedPhases] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastScrollTimeRef = useRef(0)

  const maxPhase = PHASES.length - 1

  const advancePhase = useCallback(() => {
    setActivePhase(prev => {
      if (prev >= maxPhase) {
        setIsPlaying(false)
        return prev
      }
      setCompletedPhases(cp => {
        if (!cp.includes(prev)) {
          return [...cp, prev]
        }
        return cp
      })
      return prev + 1
    })
  }, [maxPhase])

  const goToPhase = useCallback((phase: number) => {
    const clamped = Math.max(0, Math.min(phase, maxPhase))
    setActivePhase(clamped)
    setCompletedPhases(prev => {
      const next: number[] = []
      for (let i = 0; i < clamped; i++) {
        next.push(i)
      }
      return next
    })
  }, [maxPhase])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      if (prev) {
        if (playRef.current) clearInterval(playRef.current)
        playRef.current = null
        return false
      } else {
        if (activePhase >= maxPhase) goToPhase(0)
        playRef.current = setInterval(() => advancePhase(), 2800)
        return true
      }
    })
  }, [activePhase, maxPhase, advancePhase, goToPhase])

  const pausePlay = useCallback(() => {
    if (playRef.current) clearInterval(playRef.current)
    playRef.current = null
    setIsPlaying(false)
  }, [])

  const handleScroll = useCallback((e: WheelEvent) => {
    const now = Date.now()
    if (now - lastScrollTimeRef.current < 400) return
    lastScrollTimeRef.current = now
    if (e.deltaY > 0) {
      goToPhase(activePhase + 1)
    } else {
      goToPhase(activePhase - 1)
    }
    if (isPlaying) pausePlay()
  }, [activePhase, goToPhase, isPlaying, pausePlay])

  const handleNodeClick = useCallback((id: string) => {
    if (isPlaying) pausePlay()
    setSelectedNode(prev => prev === id ? null : id)
  }, [isPlaying, pausePlay])

  const handleCloseTooltip = useCallback(() => {
    setSelectedNode(null)
  }, [])

  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: true })
    return () => window.removeEventListener('wheel', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToPhase(activePhase + 1)
        if (isPlaying) pausePlay()
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPhase(activePhase - 1)
        if (isPlaying) pausePlay()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activePhase, goToPhase, isPlaying, pausePlay])

  useEffect(() => {
    return () => {
      if (playRef.current) clearInterval(playRef.current)
    }
  }, [])

  const phase = PHASES[activePhase]
  const isComplete = activePhase >= maxPhase

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      top: 44,
      background: 'var(--bg-gradient)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 20px 0',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, rgba(0,229,255,0.06) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          top: 20, left: 20,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <button
            onClick={() => navigate('/')}
            aria-label="Back to Hub"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-dim)',
              fontSize: 10, fontFamily: 'var(--font-mono)',
              padding: '4px 10px', borderRadius: 4,
              letterSpacing: '0.04em',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.color = 'var(--accent-cyan)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
              <path d="M7 2L3 6L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            HUB
          </button>
          <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
            HOW THE INTERNET WORKS
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: 20, right: 20,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          {isComplete && (
            <div style={{
              padding: '6px 12px',
              background: 'var(--complete-dim)',
              border: '1px solid var(--complete-dim)',
              borderRadius: 6,
              color: 'var(--complete)',
              fontSize: 10, fontFamily: 'var(--font-mono)',
              fontWeight: 600, letterSpacing: '0.06em',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M2 5L4 7L8 3" stroke="var(--complete)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              COMPLETE
            </div>
          )}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause animation' : isComplete ? 'Replay animation' : 'Play animation'}
            style={{
              padding: '6px 14px',
              border: `1px solid ${isPlaying ? 'var(--accent-pink)' : 'var(--accent-cyan)'}`,
              background: isPlaying ? 'var(--accent-pink)15' : 'var(--accent-cyan)12',
              borderRadius: 6,
              color: isPlaying ? 'var(--accent-pink)' : 'var(--accent-cyan)',
              fontSize: 10, fontFamily: 'var(--font-mono)',
              fontWeight: 600, letterSpacing: '0.06em',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isPlaying ? 'var(--accent-pink)25' : 'var(--accent-cyan)20' }}
            onMouseLeave={e => { e.currentTarget.style.background = isPlaying ? 'var(--accent-pink)15' : 'var(--accent-cyan)12' }}
          >
            {isPlaying ? (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                  <rect x="2" y="1" width="2" height="8" rx="1" fill="currentColor"/>
                  <rect x="6" y="1" width="2" height="8" rx="1" fill="currentColor"/>
                </svg>
                PAUSE
              </>
            ) : isComplete ? (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                  <path d="M1 5C1 2.8 2.8 1 5 1C7.2 1 9 2.8 9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 5C9 7.2 7.2 9 5 9C2.8 9 1 7.2 1 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
                  <path d="M5 3V5L6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                REPLAY
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                  <path d="M3 1.5L8 5L3 8.5V1.5Z" fill="currentColor"/>
                </svg>
                PLAY
              </>
            )}
          </button>
        </div>

        <div style={{
          width: '100%',
          maxWidth: 1100,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <FlowScene
            activePhase={activePhase}
            selectedNode={selectedNode}
            completedPhases={completedPhases}
            onNodeClick={handleNodeClick}
          />
        </div>

        <div style={{
          textAlign: 'center',
          padding: '12px 0 4px',
          position: 'relative',
          zIndex: 1,
          maxWidth: 700,
        }}>
          <div style={{
            fontSize: 22, fontWeight: 700,
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
          }}>
            {phase.label}
          </div>
          <div style={{
            fontSize: 13, color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            marginTop: 4,
            opacity: 0.6,
            letterSpacing: '0.08em',
          }}>
            {phase.subtitle}
          </div>
          <div style={{
            fontSize: 14, color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
            marginTop: 8, lineHeight: 1.6,
            maxWidth: 650, marginLeft: 'auto', marginRight: 'auto',
          }}>
            {phase.description}
          </div>
        </div>
      </div>

      <div style={{
        padding: '10px 24px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        position: 'relative',
        zIndex: 1,
      }}>
        {PHASES.map((p, i) => {
          const isActive = i === activePhase
          const isCompleted = completedPhases.includes(i)
          const color = isActive ? 'var(--accent-cyan)' : isCompleted ? 'var(--complete)' : 'var(--text-dim)'
          const size = isActive ? 14 : isCompleted ? 10 : 8
          return (
            <button
              key={p.index}
              onClick={() => {
                if (isPlaying) pausePlay()
                goToPhase(i)
              }}
              style={{
                width: size + 12, height: size + 12, padding: 0, border: 'none',
                background: 'transparent',
                position: 'relative',
                cursor: 'pointer',
              }}
              title={`Phase ${i + 1}: ${p.label}`}
            >
              <div style={{
                width: size, height: size,
                borderRadius: '50%',
                background: isActive
                  ? 'transparent'
                  : isCompleted
                    ? color
                    : 'var(--glass-bg)',
                border: isActive ? `2px solid ${color}` : isCompleted ? 'none' : '1px solid var(--border)',
                transition: 'all 300ms',
                margin: 'auto',
                boxShadow: isActive ? `0 0 8px ${color}` : 'none',
              }} />
              <div style={{
                position: 'absolute', top: '100%', left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 7, color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                marginTop: 2,
                whiteSpace: 'nowrap',
                opacity: isActive ? 1 : 0.3,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </button>
          )
        })}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '2px 0 12px',
        fontSize: 8, color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        opacity: 0.25,
      }}>
        SCROLL OR USE ARROWS TO NAVIGATE · CLICK A NODE TO LEARN MORE
      </div>

      {selectedNode && (
        <FlowTooltip
          nodeId={selectedNode}
          onClose={handleCloseTooltip}
        />
      )}
    </div>
  )
}
