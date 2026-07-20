import { useEffect, useState } from 'react'

export default function BootAnimation() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const already = sessionStorage.getItem('bt-booted')
    if (already) { setHidden(true); return }

    const dismiss = () => {
      sessionStorage.setItem('bt-booted', '1')
      setHidden(true)
    }

    document.addEventListener('keydown', dismiss)
    const timer = setTimeout(dismiss, 2500)

    return () => {
      document.removeEventListener('keydown', dismiss)
      clearTimeout(timer)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0A0C14',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)',
        fontSize: 13, lineHeight: 1.8, padding: 24,
        cursor: 'pointer',
      }}
      onClick={() => {
        sessionStorage.setItem('bt-booted', '1')
        setHidden(true)
      }}
    >
      <div style={{ maxWidth: 480, width: '100%' }}>
        <BootLine delay={0.1} text="╔══ BT v3.0 ═══════════════════════════╗" />
        <BootLine delay={0.3} text="║  Loading curriculum...              ║" />
        <BootLine delay={0.6} text="║  System ready.                      ║" />
        <BootLine delay={0.9} text="╚══════════════════════════════════════╝" />
        <div style={{ marginTop: 10, opacity: 0, animation: 'bootLine 0.05s 1.2s forwards' }}>
          [ Press any key ]<span style={{ animation: 'blink 0.6s step-end infinite' }}>_</span>
        </div>
      </div>
    </div>
  )
}

function BootLine({ delay, text }: { delay: number; text: string }) {
  return (
    <div style={{ opacity: 0, animation: `bootLine 0.05s ${delay}s forwards`, whiteSpace: 'pre-wrap' }}>
      {text}
    </div>
  )
}
