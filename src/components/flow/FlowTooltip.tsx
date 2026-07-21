import { motion, AnimatePresence } from 'framer-motion'
import { getNode, type FlowNodeData } from './FlowData'

interface FlowTooltipProps {
  nodeId: string | null
  onClose: () => void
}

function TooltipContent({ node }: { node: FlowNodeData }) {
  return (
    <div style={{
      padding: '24px 28px',
      color: 'var(--text)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${node.color}18`,
          border: `1px solid ${node.color}40`,
          fontSize: 20, fontWeight: 700,
          color: node.color, fontFamily: 'var(--font-mono)',
        }}>
          {node.icon}
        </div>
        <div>
          <div style={{
            fontSize: 18, fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--text)',
            letterSpacing: '0.02em',
          }}>
            {node.label}
          </div>
          <div style={{
            fontSize: 12, color: node.color,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            marginTop: 2,
          }}>
            {node.description}
          </div>
        </div>
      </div>

      <div style={{
        padding: '14px 16px',
        background: 'var(--glass-bg)',
        borderRadius: 8,
        borderLeft: `3px solid ${node.color}`,
        marginBottom: 14,
        fontSize: 13, lineHeight: 1.7,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
      }}>
        {node.detail}
      </div>

      <div style={{
        padding: '12px 14px',
        background: `${node.color}0A`,
        borderRadius: 8,
        border: `1px solid ${node.color}20`,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: node.color,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}>
          WHY IT MATTERS
        </div>
        <div style={{
          fontSize: 12, lineHeight: 1.6,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
        }}>
          {node.whyMatters}
        </div>
      </div>
    </div>
  )
}

export default function FlowTooltip({ nodeId, onClose }: FlowTooltipProps) {
  const node = nodeId ? getNode(nodeId) : null

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: `1px solid var(--border)`,
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            padding: '8px 12px 0',
          }}>
            <button
              onClick={onClose}
              aria-label="Close tooltip"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontSize: 11, fontFamily: 'var(--font-mono)',
                padding: '4px 12px', borderRadius: 4,
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.color = 'var(--accent-cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              CLOSE
            </button>
          </div>
          <TooltipContent node={node} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
