import { useState, useCallback, useEffect } from 'react'

const COMPLETED_CHAPTERS_KEY = 'bt-chapters'
const COMPLETED_SECTIONS_KEY = 'bt-sections'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch { return fallback }
}

export function useProgress() {
  const [completedChapters, setCompletedChapters] = useState<number[]>(
    () => loadJSON<number[]>(COMPLETED_CHAPTERS_KEY, [])
  )
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>(
    () => loadJSON<Record<string, boolean>>(COMPLETED_SECTIONS_KEY, {})
  )

  useEffect(() => {
    localStorage.setItem(COMPLETED_CHAPTERS_KEY, JSON.stringify(completedChapters))
  }, [completedChapters])

  useEffect(() => {
    localStorage.setItem(COMPLETED_SECTIONS_KEY, JSON.stringify(completedSections))
  }, [completedSections])

  const markChapterComplete = useCallback((id: number) => {
    setCompletedChapters(prev => prev.includes(id) ? prev : [...prev, id])
  }, [])

  const markSectionComplete = useCallback((chapterId: number, sectionIdx: number) => {
    const key = `${chapterId}-${sectionIdx}`
    setCompletedSections(prev => prev[key] ? prev : { ...prev, [key]: true })
  }, [])

  const isChapterComplete = useCallback((id: number) => {
    return completedChapters.includes(id)
  }, [completedChapters])

  const isSectionComplete = useCallback((chapterId: number, sectionIdx: number) => {
    return !!completedSections[`${chapterId}-${sectionIdx}`]
  }, [completedSections])

  const getCompletedSectionsForChapter = useCallback((chapterId: number, totalSections: number) => {
    let count = 0
    for (let i = 0; i < totalSections; i++) {
      if (completedSections[`${chapterId}-${i}`]) count++
    }
    return count
  }, [completedSections])

  return {
    completedChapters,
    completedSections,
    markChapterComplete,
    markSectionComplete,
    isChapterComplete,
    isSectionComplete,
    getCompletedSectionsForChapter,
  }
}
