import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Hero } from './sections/Hero'
import { Corridor } from './sections/Corridor'
import { Tracks } from './sections/Tracks'
import { Process } from './sections/Process'
import { Faq } from './sections/Faq'
import { Footer } from './sections/Footer'
import { Apply } from './apply/Apply'
import { NavThemeProvider } from './components/navTheme'
import { ChatWidget } from './chat/ChatWidget'

function Home() {
  return (
    <>
      <Hero />
      <Corridor />
      <Tracks />
      <Process />
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
    <NavThemeProvider>
      <ScrollHandler />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/apply/:path" element={<Apply />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <ChatWidget />
    </NavThemeProvider>
  )
}
