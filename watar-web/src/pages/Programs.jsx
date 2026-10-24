import { useEffect, useRef, useState } from 'react'
import { optimizedImageUrl } from '../utils/imageUrl.js'
import { fetchWatarPrograms, plainProgramText } from '../utils/watarPrograms.js'

function ArrowIcon({ direction }) {
  const left = direction === 'left'
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path
        d={left ? 'M10 3.5 5.5 8 10 12.5' : 'M6 3.5 10.5 8 6 12.5'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(true)
  const timer = useRef(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const list = await fetchWatarPrograms()
        if (!cancelled) setPrograms(list)
      } catch (err) {
        console.error('Failed to load programs:', err)
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      window.clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    if (index > programs.length - 1) setIndex(0)
  }, [programs, index])

  function step(direction) {
    if (programs.length < 2) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const advance = () => {
      setIndex((current) => {
        const next = current + direction
        if (next < 0) return programs.length - 1
        if (next >= programs.length) return 0
        return next
      })
      setShown(true)
    }
    if (reduced) {
      advance()
      return
    }
    if (!shown) return
    setShown(false)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(advance, 180)
  }

  const program = programs[index]
  const title = program?.title || 'برنامج'
  const photo = optimizedImageUrl(program?.image?.url, 1200)
  const logo = optimizedImageUrl(program?.programDetailsImage?.url, 1000)
  const description = plainProgramText(program?.description)

  const descriptionBlock = description ? (
    <p className="mt-6 max-w-[34rem] text-right font-sans text-[17px] font-medium leading-[1.45] text-white md:text-[20px] lg:mt-8">
      {description}
    </p>
  ) : null

  return (
    <main className="w-full overflow-x-hidden bg-transparent">
      {loading ? (
        <p className="watar-edge py-24 text-center font-sans text-lg font-medium text-white/85">
          جارٍ تحميل البرامج…
        </p>
      ) : null}

      {error ? (
        <p className="watar-edge py-24 text-center font-sans text-lg font-medium text-white" role="alert">
          تعذّر تحميل البرامج. حاول تحديث الصفحة.
        </p>
      ) : null}

      {!loading && !error && programs.length === 0 ? (
        <p className="watar-edge py-24 text-center font-sans text-lg font-medium text-white/85">
          لا توجد برامج متاحة حالياً.
        </p>
      ) : null}

      {program ? (
        <section
          dir="ltr"
          className="watar-programs-hero watar-edge flex items-center pb-16 pt-1 lg:min-h-[calc(100svh-124px)] lg:pb-24 lg:pt-0"
          aria-roledescription="carousel"
          aria-label="برامجنا"
        >
          <div
            className={`grid w-full grid-cols-1 items-center gap-8 transition-opacity duration-300 lg:min-h-[calc(100svh-124px)] lg:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)] lg:items-center lg:gap-x-2 lg:gap-y-3 ${
              shown ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:-translate-y-14">
              {logo ? (
                <img
                  src={logo}
                  alt={title}
                  className="watar-program-logo"
                  decoding="async"
                />
              ) : (
                <h1 className="font-mix text-4xl font-bold leading-tight text-white md:text-6xl">
                  {title}
                </h1>
              )}
              {logo ? <h1 className="sr-only">{title}</h1> : null}
              <div dir="rtl" className="hidden w-full justify-center lg:flex">
                {descriptionBlock}
              </div>
            </div>

            <div className="relative order-2 flex items-end justify-center px-11 lg:order-1 lg:self-end lg:-translate-y-8 lg:px-8">
              {programs.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous program"
                    onClick={() => step(-1)}
                    className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#F3E7D9] text-[#E66B2F] transition hover:bg-white"
                  >
                    <ArrowIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next program"
                    onClick={() => step(1)}
                    className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#F3E7D9] text-[#E66B2F] transition hover:bg-white"
                  >
                    <ArrowIcon direction="right" />
                  </button>
                </>
              ) : null}

              {photo ? (
                <img
                  src={photo}
                  alt={title}
                  className="watar-program-photo"
                  decoding="async"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center font-sans text-white/75">
                  لا تتوفر صورة
                </div>
              )}
            </div>

            <div dir="rtl" className="order-3 flex w-full justify-center lg:hidden">
              {descriptionBlock}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
