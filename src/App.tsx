import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Hero } from './sections/Hero'
import { Value } from './sections/Value'
import { Values } from './sections/Values'
import { Advantages } from './sections/Advantages'
import { Club } from './sections/Club'
import { Ecosystem } from './sections/Ecosystem'
import { TrackRecord } from './sections/TrackRecord'
import { Team } from './sections/Team'
import { Portfolio } from './sections/Portfolio'
import { Apply, ApplyPage } from './sections/Apply'
import { Faq } from './sections/Faq'
import { Footer } from './sections/Footer'
import { NavThemeProvider } from './components/navTheme'
import { ChatWidget } from './chat/ChatWidget'
import { ScrollTop } from './components/ScrollTop'
import { LanguageProvider } from './i18n'

function Home() {
  return (
    <>
      <Hero />
      <Value />
      <Advantages />
      <Club />
      <Values />
      <Ecosystem />
      <TrackRecord />
      <Team />
      <Portfolio />
      <Apply />
      <Faq />
      <Footer />
    </>
  )
}

/** Honour /#anchor links arriving from another route. */
function ScrollHandler() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        requestAnimationFrame(() =>
          el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        )
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <LanguageProvider>
      <NavThemeProvider>
        <ScrollHandler />
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/apply/:path" element={<ApplyPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <ScrollTop />
        <ChatWidget />
      </NavThemeProvider>
    </LanguageProvider>
  )
}
