import { HashRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import TopNav from './components/layout/TopNav'
import BootAnimation from './components/layout/BootAnimation'
import HubPage from './components/home/HubPage'
import ChapterPage from './components/chapter/ChapterPage'
import RequestFlow from './components/flow/RequestFlow'

export default function App() {
  return (
    <HashRouter>
      <MotionConfig reducedMotion="user">
        <BootAnimation />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TopNav />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HubPage />} />
              <Route path="/chapter/:id" element={<ChapterPage />} />
              <Route path="/flow" element={<RequestFlow />} />
            </Routes>
          </main>
        </div>
      </MotionConfig>
    </HashRouter>
  )
}
