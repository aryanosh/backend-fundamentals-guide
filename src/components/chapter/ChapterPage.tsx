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

export default function ChapterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const chapterId = Number(id)

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

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 44px)',
      position: 'relative',
    }}>
      <div style={{
        width: '45%', minWidth: 320, maxWidth: 520,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-panel)',
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
            fontFamily: 'var(--font-mono)',
            fontSize: 18, fontWeight: 700, color: 'var(--text)',
            margin: 0, lineHeight: 1.2,
          }}>
            {chapter.title}
          </h1>
          <p style={{
            fontSize: 11, color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)', margin: '6px 0 0',
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
                  flex: 1, height: 4, border: 'none', padding: 0,
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
              fontFamily: 'var(--font-mono)',
              fontSize: 14, fontWeight: 600, color: 'var(--text)',
              margin: 0,
            }}>
              {section.title}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`theory-${chapterId}-${activeSection}`}
              initial={{ opacity: 0, x: direction * 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -16 }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  fontSize: 13, lineHeight: 1.8, color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
                dangerouslySetInnerHTML={{ __html: section.text }}
              />

              {section.callout && (
                <div style={{
                  marginTop: 16,
                  padding: '10px 14px',
                  borderLeft: `3px solid ${
                    section.calloutType === 'warn' ? 'var(--accent-amber)' :
                    section.calloutType === 'tip' ? 'var(--accent-cyan)' :
                    'var(--accent-violet)'
                  }`,
                  background: 'var(--bg-surface)',
                  fontSize: 12, color: 'var(--text-muted)',
                  lineHeight: 1.6, fontFamily: 'var(--font-mono)',
                }}>
                  {section.calloutTitle && (
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontSize: 11 }}>
                      {section.calloutTitle}
                    </div>
                  )}
                  {section.callout}
                </div>
              )}

              {section.code && (
                <div style={{
                  marginTop: 16,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-code)',
                  overflow: 'hidden',
                }}>
                  {section.codeLang && (
                    <div style={{
                      padding: '4px 10px',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 9, color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {section.codeLang}
                    </div>
                  )}
                  <pre style={{
                    margin: 0, padding: 12,
                    fontSize: 12, lineHeight: 1.6,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text)',
                    overflowX: 'auto',
                  }}>
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}

              {section.detail && (
                <details style={{ marginTop: 16 }}>
                  <summary style={{
                    fontSize: 11, fontWeight: 600,
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    padding: '6px 0',
                  }}>
                    DEEP DIVE
                  </summary>
                  <div style={{
                    marginTop: 8, padding: '10px 12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    fontSize: 12, color: 'var(--text-muted)',
                    lineHeight: 1.6, fontFamily: 'var(--font-mono)',
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
              style={{
                padding: '6px 14px',
                border: `1px solid ${sectionComplete ? 'var(--complete)' : 'var(--border)'}`,
                background: sectionComplete ? 'var(--complete-dim)' : 'transparent',
                color: sectionComplete ? 'var(--complete)' : 'var(--text-muted)',
                fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
                transition: 'all 150ms',
              }}
            >
              {sectionComplete ? '✓ SECTION COMPLETE' : 'MARK COMPLETE'}
            </button>

            <button
              onClick={handleMarkChapter}
              disabled={chapterComplete}
              style={{
                padding: '6px 14px',
                border: `1px solid ${chapterComplete ? 'var(--complete)' : 'var(--border)'}`,
                background: chapterComplete ? 'var(--complete-dim)' : 'transparent',
                color: chapterComplete ? 'var(--complete)' : 'var(--text-muted)',
                fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
                transition: 'all 150ms',
                opacity: chapterComplete ? 1 : 0.6,
              }}
            >
              {chapterComplete ? '✓ CHAPTER COMPLETE' : 'COMPLETE CHAPTER'}
            </button>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {completedCount}/{totalSections} sections
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {hasPrev && (
              <button onClick={goPrev} style={navBtnStyle}>
                ← PREV
              </button>
            )}
            {hasNext && (
              <button onClick={goNext} style={navBtnStyle}>
                NEXT →
              </button>
            )}
            {!hasNext && chapterId < chapters.length && (
              <button
                onClick={() => navigate(`/chapter/${chapterId + 1}`)}
                style={{
                  ...navBtnStyle, color: 'var(--accent-cyan)',
                  borderColor: 'var(--accent-cyan)',
                }}
              >
                NEXT CH →
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`diagram-${chapterId}-${activeSection}`}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              maxWidth: 600,
            }}
          >
            {renderDiagram(section.diagram)}
            {section.caption && (
              <div style={{
                textAlign: 'center',
                padding: '0 24px',
                fontSize: 10, color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
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
          opacity: 0.5,
        }}>
          ← → ARROWS TO NAVIGATE
        </div>
      </div>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  padding: '5px 10px',
  border: '1px solid var(--border-strong)',
  background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
  letterSpacing: '0.04em',
  transition: 'all 150ms',
}
