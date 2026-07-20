import { motion } from 'framer-motion'

interface Props {
  left: { header: string; items: string[] }
  right: { header: string; items: string[] }
  vsLabel?: string
}

export default function ComparisonView({ left, right, vsLabel = 'VS' }: Props) {
  return (
    <div style={{ display: 'flex', gap: 0, padding: 16, position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{ flex: 1, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)',
        }}>
          {left.header}
        </div>
        <div style={{ padding: '8px 12px' }}>
          {left.items.map((item, i) => (
            <div key={i} style={{
              padding: '4px 0',
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              borderBottom: i < left.items.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 2,
      }}>
        <div style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--border-strong)',
          background: 'var(--bg-panel)',
          fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          {vsLabel}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{ flex: 1, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          color: 'var(--accent-pink)', fontFamily: 'var(--font-mono)',
        }}>
          {right.header}
        </div>
        <div style={{ padding: '8px 12px' }}>
          {right.items.map((item, i) => (
            <div key={i} style={{
              padding: '4px 0',
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              borderBottom: i < right.items.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
