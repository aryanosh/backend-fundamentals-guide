import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  label: string
  desc?: string
  color?: string
}

interface Props {
  steps: Step[]
  activeStep: number
}

interface TooltipState {
  x: number
  y: number
  text: string
}

const COLORS = ['#00E5FF', '#FF3D8A', '#00F593', '#FFB300', '#8B5CF6']

function FlowDots({ x1, x2, y, color, dotCount = 3 }: { x1: number; x2: number; y: number; color: string; dotCount?: number }) {
  const dist = x2 - x1
  return (
    <>
      {Array.from({ length: dotCount }).map((_, idx) => {
        const dur = 1.8
        const delay = (idx / dotCount) * dur
        return (
          <g key={idx}>
            <circle r={8} cx={x1} cy={y} fill={color} opacity={0.15} style={{ pointerEvents: 'none' }}>
              <animate
                attributeName="cx"
                values={`${x1};${x2}`}
                dur={`${dur}s`}
                begin={`-${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle r={5} cx={x1} cy={y} fill={color} style={{ pointerEvents: 'none' }}>
              <animate
                attributeName="cx"
                values={`${x1};${x2}`}
                dur={`${dur}s`}
                begin={`-${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;1;0"
                keyTimes="0;0.75;1"
                dur={`${dur}s`}
                begin={`-${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )
      })}
      {/* Arrival burst at the end node */}
      <circle r={5} fill={color} style={{ pointerEvents: 'none' }} cx={x2} cy={y}>
        <animate
          attributeName="opacity"
          values="0;0.6;0"
          keyTimes="0;0.5;1"
          dur="1s"
          begin={`-${0.75 * dotCount * (1.8 / dotCount)}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values="2;6;10"
          keyTimes="0;0.5;1"
          dur="1s"
          begin={`-${0.75 * dotCount * (1.8 / dotCount)}s`}
          repeatCount="indefinite"
        />
      </circle>
    </>
  )
}

export default function StepFlowDiagram({ steps, activeStep }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const handleMouseEnter = useCallback((e: React.MouseEvent, label: string) => {
    setTooltip({ x: e.clientX, y: e.clientY, text: label })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltip) {
      setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
    }
  }, [tooltip])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div style={{ width: '100%', padding: '24px 16px', position: 'relative' }}>
      <svg width="100%" height="150" viewBox="0 0 600 150" style={{ display: 'block' }}>
        <defs>
          <marker id="sfArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--border-strong)" />
          </marker>
        </defs>

        {steps.slice(0, -1).map((_, i) => {
          const x1 = 60 + i * (480 / Math.max(steps.length - 1, 1))
          const x2 = 60 + (i + 1) * (480 / Math.max(steps.length - 1, 1))
          const done = i < activeStep
          const isCurrent = i === activeStep
          const nextColor = steps[i + 1]?.color || COLORS[(i + 1) % COLORS.length]

          return (
            <g key={`conn-${i}`}>
              <motion.line
                x1={x1} y1={60} x2={x2} y2={60}
                stroke={done ? 'var(--complete)' : 'var(--border-strong)'}
                strokeWidth={2.5}
                strokeDasharray={done ? 'none' : '6,4'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ pathLength: 1 }}
              />
              {(done || isCurrent) && (
                <FlowDots
                  x1={x1} x2={x2} y={60}
                  color={done ? 'var(--complete)' : nextColor}
                  dotCount={3}
                />
              )}
            </g>
          )
        })}

        {steps.map((s, i) => {
          const cx = 60 + i * (480 / Math.max(steps.length - 1, 1))
          const isActive = i === activeStep
          const isDone = i < activeStep
          const color = s.color || COLORS[i % COLORS.length]

          return (
            <g
              key={`n-${i}`}
              onMouseEnter={(e) => handleMouseEnter(e, s.label)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => {/* informational tooltip only */}}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMouseEnter(e as any, s.label) } }}
              role="button"
              tabIndex={0}
              aria-label={`Step ${i + 1}: ${s.label}`}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <motion.circle
                cx={cx} cy={60} r={isActive ? 24 : 18}
                fill={isDone ? 'var(--complete)' : isActive ? 'var(--bg)' : 'var(--glass-bg)'}
                stroke={isActive ? color : isDone ? 'var(--complete)' : 'var(--border-strong)'}
                strokeWidth={isActive ? 3 : 1.5}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  r: isActive ? 24 : 18,
                }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: 'backOut' }}
              />
              {isActive && (
                <motion.circle
                  cx={cx} cy={60} r={28}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scale: [0.8, 1.2, 1.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <motion.text
                x={cx} y={isActive ? 65 : 64}
                textAnchor="middle"
                fill={isDone ? 'var(--bg)' : isActive ? color : 'var(--text-dim)'}
                fontSize={isActive ? 14 : 11}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
              >
                {isDone ? '✓' : i + 1}
              </motion.text>
              <text
                x={cx} y={105}
                textAnchor="middle"
                fill={isActive ? 'var(--text)' : 'var(--text-dim)'}
                fontSize={10}
                fontFamily="var(--font-mono)"
                fontWeight={isActive ? 600 : 400}
                style={{ pointerEvents: 'none' }}
              >
                {s.label.length > 18 ? s.label.slice(0, 18) + '…' : s.label}
              </text>
            </g>
          )
        })}
      </svg>

      <AnimatePresence mode="wait">
        {steps[activeStep]?.desc && (
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{
              marginTop: 12, padding: '10px 14px',
              border: '1px solid var(--border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontSize: 12, color: 'var(--text-muted)',
              lineHeight: 1.5, fontFamily: 'var(--font-sans)',
            }}
          >
            {steps[activeStep].desc}
          </motion.div>
        )}
      </AnimatePresence>

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          padding: '4px 10px',
          background: 'var(--bg-overlay)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border-hover)',
          fontSize: 11, color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
          zIndex: 9999,
          whiteSpace: 'nowrap',
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
