import { useMemo, useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chapters } from '../../content/index'
import { useProgress } from '../../hooks/useProgress'
import { GROUP_COLORS, GROUP_NAMES, type ChapterSection } from '../../types/content'
import { StepFlowDiagram, InfoGridDiagram, ComparisonView, TimelineView, AnnotationView, SvgDiagram } from '../diagrams/index'

interface RawDiagram {
  type: string
  config: Record<string, unknown>
}

function renderDiagram(raw: unknown) {
  const diagram = raw as RawDiagram | null
  if (!diagram) return null
  switch (diagram.type) {
    case 'stepFlow':
      return <StepFlowDiagram steps={(diagram.config as any).steps} activeStep={0} />
    case 'infoGrid':
      return <InfoGridDiagram columns={(diagram.config as any).columns} items={(diagram.config as any).items} />
    case 'comparison':
      return <ComparisonView left={(diagram.config as any).left} right={(diagram.config as any).right} vsLabel={(diagram.config as any).vsLabel} />
    case 'timeline':
      return <TimelineView events={(diagram.config as any).events} />
    case 'annotation':
      return <AnnotationView elements={(diagram.config as any).elements} annotations={(diagram.config as any).annotations} />
    case 'svg':
      return <SvgDiagram svg={(diagram.config as any).svg} caption={(diagram.config as any).caption} />
    default:
      return null
  }
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

export default function ChapterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const chapterId = Number(id)
  const isMobile = useMediaQuery('(max-width: 900px)')

  const chapter = useMemo(() => {
    if (isNaN(chapterId) || chapterId < 1 || chapterId > chapters.length) return null
    return chapters[chapterId - 1]
  }, [chapterId])

  const [activeSection, setActiveSection] = useState(0)
  const [direction, setDirection] = useState(1)
  const { isChapterComplete, isSectionComplete, markSectionComplete, markChapterComplete, getCompletedSectionsForChapter } = useProgress()

  useEffect(() => {
    setActiveSection(0)
    setDirection(1)
  }, [chapterId])

  const goNext = useCallback(() => {
    if (!chapter) return
    if (activeSection < chapter.sections.length - 1) {
      setDirection(1)
      setActiveSection(s => s + 1)
    }
  }, [activeSection, chapter])

  const goPrev = useCallback(() => {
    if (activeSection > 0) {
      setDirection(-1)
      setActiveSection(s => s - 1)
    }
  }, [activeSection])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  if (!chapter) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        Chapter not found
      </div>
    )
  }

  const group = chapter.group
  const groupColor = GROUP_COLORS[group] || 'var(--accent-cyan)'
  const groupName = GROUP_NAMES[group] || group
  const section = chapter.sections[activeSection] as unknown as ChapterSection
  const totalSections = chapter.sections.length
  const hasPrev = activeSection > 0
  const hasNext = activeSection < totalSections - 1
  const chapterComplete = isChapterComplete(chapterId)
  const sectionComplete = isSectionComplete(chapterId, activeSection)
  const completedCount = getCompletedSectionsForChapter(chapterId, totalSections)

  const handleMarkSection = useCallback(() => {
    markSectionComplete(chapterId, activeSection)
  }, [chapterId, activeSection, markSectionComplete])

  const handleMarkChapter = useCallback(() => {
    markChapterComplete(chapterId)
  }, [chapterId, markChapterComplete])

  const leftPanel = (
    <div style={{
      width: '50%', minWidth: isMobile ? 0 : 360,
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
      height: isMobile ? 'auto' : 'calc(100vh - 44px)',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          color: groupColor, fontFamily: 'var(--font-mono)',
          marginBottom: 4,
        }}>
          CH-{String(chapterId).padStart(2, '0')} / {groupName.toUpperCase()}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20, fontWeight: 700, color: 'var(--text)',
          margin: 0, lineHeight: 1.15,
        }}>
          {chapter.title}
        </h1>
        <p style={{
          fontSize: 12, color: 'var(--text-dim)',
          fontFamily: 'var(--font-sans)', margin: '6px 0 0',
          lineHeight: 1.4,
        }}>
          {chapter.subtitle}
        </p>

        <div style={{
          display: 'flex', gap: 4, marginTop: 12,
        }}>
          {chapter.sections.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > activeSection ? 1 : -1)
                setActiveSection(i)
              }}
              style={{
                flex: 1, height: 4, border: 'none', padding: 0, borderRadius: 2,
                background: i === activeSection
                  ? groupColor
                  : isSectionComplete(chapterId, i)
                    ? 'var(--complete)'
                    : 'var(--border)',
                opacity: i === activeSection ? 1 : 0.5,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 14,
        }}>
          <div style={{
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${groupColor}`,
            fontSize: 11, fontWeight: 700, color: groupColor,
            fontFamily: 'var(--font-mono)',
          }}>
            {String(activeSection + 1).padStart(2, '0')}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16, fontWeight: 600, color: 'var(--text)',
            margin: 0,
          }}>
            {section.title}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`theory-${chapterId}-${activeSection}`}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div
              style={{
                fontSize: 14, lineHeight: 1.8, color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
              }}
              dangerouslySetInnerHTML={{ __html: section.text }}
            />

            {section.callout && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                borderLeft: `3px solid ${
                  section.calloutType === 'warn' ? 'var(--accent-amber)' :
                  section.calloutType === 'tip' ? 'var(--accent-cyan)' :
                  'var(--accent-violet)'
                }`,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderWidth: '1px 1px 1px 3px',
                borderStyle: 'solid',
                borderColor: 'var(--glass-border)',
                borderLeftColor: section.calloutType === 'warn' ? 'var(--accent-amber)' :
                  section.calloutType === 'tip' ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                fontSize: 13, color: 'var(--text-muted)',
                lineHeight: 1.6, fontFamily: 'var(--font-sans)',
              }}>
                {section.calloutTitle && (
                  <div style={{
                    fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontSize: 11,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                  }}>
                    {section.calloutType === 'warn' ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ verticalAlign: 'middle', marginRight: 6, marginTop: -2 }}>
                        <path d="M6 1L1 11h10L6 1z" stroke="var(--accent-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 5v3" stroke="var(--accent-amber)" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="6" cy="10" r="0.5" fill="var(--accent-amber)"/>
                      </svg>
                    ) : section.calloutType === 'tip' ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ verticalAlign: 'middle', marginRight: 6, marginTop: -2 }}>
                        <circle cx="6" cy="6" r="5" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
                        <path d="M6 4v4M4 6h4" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ verticalAlign: 'middle', marginRight: 6, marginTop: -2 }}>
                        <circle cx="6" cy="6" r="5" stroke="var(--accent-violet)" strokeWidth="1.5"/>
                        <path d="M6 5v3M6 3.5v0.01" stroke="var(--accent-violet)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {section.calloutTitle}
                  </div>
                )}
                {section.callout}
              </div>
            )}

            {section.detail && (
              <details style={{ marginTop: 16 }}>
                <summary style={{
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  padding: '8px 0',
                  letterSpacing: '0.04em',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 6, marginTop: -2 }}>
                    <path d="M3 2L7 5L3 8" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  DEEP DIVE
                </summary>
                <div style={{
                  marginTop: 8, padding: '12px 14px',
                  border: '1px solid var(--border)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  fontSize: 13, color: 'var(--text-muted)',
                  lineHeight: 1.7, fontFamily: 'var(--font-sans)',
                }}>
                  {section.detail}
                </div>
              </details>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{
          display: 'flex', gap: 8, marginTop: 24,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={handleMarkSection}
            aria-label={sectionComplete ? 'Section completed' : 'Mark section complete'}
            style={{
              padding: '6px 14px',
              border: `1px solid ${sectionComplete ? 'var(--complete)' : 'var(--border)'}`,
              background: sectionComplete ? 'var(--complete-dim)' : 'var(--glass-bg)',
              color: sectionComplete ? 'var(--complete)' : 'var(--text-muted)',
              fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { if (!sectionComplete) { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)' } }}
            onMouseLeave={e => { if (!sectionComplete) { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
          >
            {sectionComplete ? (
              <><svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M2 5L4 7L8 3" stroke="var(--complete)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> SECTION COMPLETE</>
            ) : 'MARK COMPLETE'}
          </button>

          <button
            onClick={handleMarkChapter}
            disabled={chapterComplete}
            aria-label={chapterComplete ? 'Chapter completed' : 'Complete chapter'}
            style={{
              padding: '6px 14px',
              border: `1px solid ${chapterComplete ? 'var(--complete)' : 'var(--border)'}`,
              background: chapterComplete ? 'var(--complete-dim)' : 'var(--glass-bg)',
              color: chapterComplete ? 'var(--complete)' : 'var(--text-muted)',
              fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              transition: 'all 150ms',
              opacity: chapterComplete ? 1 : 0.6,
            }}
          >
            {chapterComplete ? (
              <><svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M2 5L4 7L8 3" stroke="var(--complete)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> CHAPTER COMPLETE</>
            ) : 'COMPLETE CHAPTER'}
          </button>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '10px 16px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {completedCount}/{totalSections} sections
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {hasPrev && (
            <button onClick={goPrev} aria-label="Previous section" style={navBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> PREV
            </button>
          )}
          {hasNext && (
            <button onClick={goNext} aria-label="Next section" style={navBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}>
              NEXT <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginLeft: 4 }}><path d="M4 2L7 5L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          {!hasNext && chapterId < chapters.length && (
            <button
              onClick={() => navigate(`/chapter/${chapterId + 1}`)}
              aria-label="Next chapter"
              style={{
                ...navBtnStyle, color: 'var(--accent-cyan)',
                borderColor: 'var(--glass-border-hover)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)' }}
            >
              NEXT CH <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginLeft: 4 }}><path d="M4 2L7 5L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const rightPanel = (
    <div style={{
      flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
      height: isMobile ? 'auto' : 'calc(100vh - 44px)',
      minHeight: isMobile ? 400 : 0,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, var(--glow-cyan) 0%, transparent 70%)`,
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`diagram-${chapterId}-${activeSection}`}
          initial={{ opacity: 0, scale: 0.95, x: direction * 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: direction * -30 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{
            width: '100%',
            maxWidth: 640,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            margin: '0 16px',
          }}>
            {renderDiagram(section.diagram)}
          </div>
          {section.caption && (
            <div style={{
              textAlign: 'center',
              padding: '8px 24px 0',
              fontSize: 11, color: 'var(--text-dim)',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.5,
            }}>
              {section.caption}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div style={{
        position: 'absolute', bottom: 12, left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 9, color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        opacity: 0.4,
        zIndex: 1,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: 'middle', marginLeft: 4 }}><path d="M4 2L7 5L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> ARROWS TO NAVIGATE
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'flex', height: isMobile ? 'auto' : 'calc(100vh - 44px)',
      position: 'relative',
      flexDirection: isMobile ? 'column' : 'row',
    }}>
      {leftPanel}
      {rightPanel}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  padding: '5px 10px',
  border: '1px solid var(--border-strong)',
  background: 'var(--glass-bg)',
  color: 'var(--text-muted)',
  fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
  letterSpacing: '0.04em',
  transition: 'all 150ms',
}
