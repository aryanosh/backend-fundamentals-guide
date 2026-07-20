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

const COLORS = ['#00E5FF', '#FF3D8A', '#00F593', '#FFB300', '#8B5CF6']

export default function StepFlowDiagram({ steps, activeStep }: Props) {
  return (
    <div style={{ width: '100%', padding: '24px 16px' }}>
      <svg width="100%" height="120" viewBox="0 0 600 120" style={{ display: 'block' }}>
        <defs>
          <marker id="sfArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--border-strong)" />
          </marker>
        </defs>

        {steps.slice(0, -1).map((_, i) => {
          const x1 = 50 + i * (500 / Math.max(steps.length - 1, 1))
          const x2 = 50 + (i + 1) * (500 / Math.max(steps.length - 1, 1))
          const done = i < activeStep
          return (
            <line
              key={`l-${i}`}
              x1={x1} y1={60} x2={x2} y2={60}
              stroke={done ? 'var(--accent-green)' : 'var(--border-strong)'}
              strokeWidth={2}
              strokeDasharray={done ? 'none' : '4,4'}
            />
          )
        })}

        <line x1={50} y1={60} x2={550} y2={60} stroke="var(--border)" strokeWidth={1} opacity={0.3} />

        {steps.map((s, i) => {
          const cx = 50 + i * (500 / Math.max(steps.length - 1, 1))
          const isActive = i === activeStep
          const isDone = i < activeStep
          const color = s.color || COLORS[i % COLORS.length]

          return (
            <g key={`n-${i}`}>
              <motion.circle
                cx={cx} cy={60} r={isActive ? 22 : 18}
                fill={isDone ? 'var(--accent-green)' : isActive ? 'var(--bg-panel)' : 'var(--bg-panel)'}
                stroke={isActive ? color : isDone ? 'var(--accent-green)' : 'var(--border-strong)'}
                strokeWidth={isActive ? 2.5 : 1.5}
                initial={false}
                animate={{
                  r: isActive ? 22 : 18,
                  filter: isActive ? 'drop-shadow(0 0 8px ' + color + ')' : 'none',
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.text
                x={cx} y={isActive ? 65 : 64}
                textAnchor="middle"
                fill={isDone ? '#0A0C14' : isActive ? color : 'var(--text-dim)'}
                fontSize={isActive ? 13 : 11}
                fontWeight={700}
                fontFamily="var(--font-mono)"
              >
                {isDone ? '✓' : i + 1}
              </motion.text>
              <text
                x={cx} y={100}
                textAnchor="middle"
                fill={isActive ? 'var(--text)' : 'var(--text-dim)'}
                fontSize={10}
                fontFamily="var(--font-mono)"
                fontWeight={isActive ? 600 : 400}
              >
                {s.label.length > 16 ? s.label.slice(0, 16) + '…' : s.label}
              </text>
            </g>
          )
        })}
      </svg>

      <AnimatePresence mode="wait">
        {steps[activeStep]?.desc && (
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: 12, padding: '10px 14px',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              fontSize: 12, color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            {steps[activeStep].desc}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
