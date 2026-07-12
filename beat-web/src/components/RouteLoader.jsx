import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const MIN_VISIBLE_MS = 500
const FADE_MS = 280

export default function RouteLoader() {
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)
  const [phase, setPhase] = useState('hidden')

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return undefined
    }

    setPhase('visible')
    const startedAt = Date.now()

    const fadeTimer = window.setTimeout(() => {
      setPhase('fading')
    }, MIN_VISIBLE_MS)

    const hideTimer = window.setTimeout(() => {
      setPhase('hidden')
    }, MIN_VISIBLE_MS + FADE_MS)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [pathname])

  if (phase === 'hidden') return null

  return (
    <div
      className={`beat-route-loader fixed inset-0 z-[200] flex items-center justify-center bg-[#0c0c0c] transition-opacity duration-300 ${
        phase === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-8 px-6">
        <p className="beat-gradient-text m-0 font-sans text-3xl font-black uppercase tracking-[0.2em] md:text-4xl">
          Beat
        </p>

        <div className="beat-route-loader-track h-1.5 w-48 overflow-hidden rounded-full bg-white/10 md:w-56">
          <div className="beat-route-loader-bar h-full w-1/2 rounded-full" />
        </div>
      </div>
    </div>
  )
}
