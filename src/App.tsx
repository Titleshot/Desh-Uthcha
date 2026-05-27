import { Fragment } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import LanguageSwitcher from './components/LanguageSwitcher'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import BhimsenThapaSeries from './pages/BhimsenThapaSeries'
import PlaceholderPage from './pages/PlaceholderPage'
import TransparencyExperience from './pages/TransparencyExperience'

function FixedLanguageSwitcherGate() {
  const { pathname } = useLocation()
  if (pathname === '/series') return null
  return <LanguageSwitcher />
}

export default function App() {
  return (
    <Fragment>
      <ScrollToTop />
      <FixedLanguageSwitcherGate />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/transparency" element={<TransparencyExperience />} />
        <Route path="/tracker" element={<PlaceholderPage page="tracker" />} />
        <Route path="/series" element={<BhimsenThapaSeries />} />
      </Routes>
    </Fragment>
  )
}
