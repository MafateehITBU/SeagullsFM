import { useCallback, useEffect, useRef, useState } from 'react'
import watarIcon from '../../assets/icon.svg'

export const STREAM_URL = 'https://securestreams2.autopo.st:1243/live'

export default function LiveStreamButton() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const audio = new Audio(STREAM_URL)
    audio.preload = 'none'
    audioRef.current = audio

    const onPlaying = () => {
      setLoading(false)
      setPlaying(true)
      setError(null)
    }
    const onPause = () => {
      setPlaying(false)
      setLoading(false)
    }
    const onWaiting = () => setLoading(true)
    const onError = () => {
      setPlaying(false)
      setLoading(false)
      setError('تعذّر تشغيل البث. حاول مرة أخرى.')
    }

    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('error', onError)
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused) {
      audio.pause()
      return
    }

    setError(null)
    setLoading(true)
    try {
      if (!audio.src || audio.src === window.location.href) {
        audio.src = STREAM_URL
      }
      await audio.play()
    } catch (err) {
      console.error('Stream playback failed:', err)
      setLoading(false)
      setPlaying(false)
      setError('تعذّر تشغيل البث. حاول مرة أخرى.')
    }
  }, [])

  const label = loading
    ? 'جارٍ التحميل…'
    : playing
      ? 'إيقاف البث'
      : 'إستمع مباشرة'

  return (
    <section className="w-full pt-8 md:pt-10" aria-label="البث المباشر والبرامج">
      {/* Live button left (~42% width) · برامجنا right — no outer margins */}
      <div dir="ltr" className="flex w-full items-stretch justify-between gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-busy={loading}
          aria-label={label}
          className="watar-live-btn relative flex w-[42%] max-w-xl min-w-0 cursor-pointer items-stretch overflow-hidden rounded-none p-0 shadow-none"
        >
          <span className="flex flex-1 items-center justify-center px-3 py-3 text-center font-sans text-base font-bold tracking-wide sm:text-lg md:py-4 md:text-2xl lg:text-3xl">
            {label}
          </span>
          <span
            className="watar-live-mark flex w-12 shrink-0 items-center justify-center p-0 sm:w-14 md:w-16"
            aria-hidden="true"
          >
            <img
              src={watarIcon}
              alt=""
              className="h-7 w-7 object-contain sm:h-8 sm:w-8 md:h-10 md:w-10"
            />
          </span>
        </button>

        <h2
          id="programs-heading"
          className="flex shrink-0 items-center px-4 font-mix text-[clamp(1.75rem,4.5vw,3.5rem)] font-bold leading-none text-white sm:px-6 md:px-8 lg:px-14"
        >
          <a href="#programs" className="text-white no-underline">
            برامجنا
          </a>
        </h2>
      </div>

      {error ? (
        <p className="mt-3 px-5 text-sm font-medium text-white/90 md:px-10" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
