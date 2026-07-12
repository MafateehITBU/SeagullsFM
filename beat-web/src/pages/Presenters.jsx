import { useEffect, useState } from 'react'
import axiosInstance from '../axiosConfig'
import ProgramArtwork from '../components/ProgramArtwork.jsx'
import RichTextContent from '../components/RichTextContent.jsx'
import presentersHeroImg from '../assets/imgs/presenters/web-13.png'

const BEAT_CHANNEL = import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'BeatFM'

function renderProgramTitle(title) {
  const safeTitle = title || 'Untitled Show'
  const match = safeTitle.match(/\s(with)\s/i)
  if (!match || typeof match.index !== 'number') return safeTitle

  const before = safeTitle.slice(0, match.index).trimEnd()
  const withAndAfter = safeTitle.slice(match.index + 1)

  return (
      <>
          {before}
          <br />
          <span className="font-[700]">{withAndAfter}</span>
      </>
  )
}

export default function Presenters() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/program')
        const filtered = (response.data.data ?? []).filter(
          (program) => program.channelId?.name === BEAT_CHANNEL,
        )
        setPrograms(filtered)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const handlePrevProgram = () => {
    setCurrentSlide((prev) => (prev === 0 ? programs.length - 1 : prev - 1))
  }

  const handleNextProgram = () => {
    setCurrentSlide((prev) => (prev === programs.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (currentSlide > programs.length - 1) {
      setCurrentSlide(0)
    }
  }, [programs, currentSlide])

  useEffect(() => {
    if (programs.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === programs.length - 1 ? 0 : prev + 1))
    }, 9000)
    return () => clearInterval(timer)
  }, [programs.length])

  return (
    <main className="w-full overflow-x-hidden bg-[#0c0c0c]">
      {/* Section 1 — hero */}
      <section className="beat-section-x flex min-h-svh flex-col justify-center pb-12 pt-10 lg:min-h-0 lg:pb-20 lg:pt-3">
        <div className="beat-section-inset flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12">
          <h1 className="beat-gradient-text m-0 shrink-0 text-[clamp(2.75rem,10vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
            Meet
            <br />
            Our
            <br />
            Presenters
          </h1>

          <img
            src={presentersHeroImg}
            alt=""
            className="h-auto w-full max-w-[200px] shrink-0 object-contain sm:max-w-[280px] md:max-w-[360px] lg:max-w-[500px]"
            loading="eager"
          />
        </div>
      </section>

      {/* Section 2 — programs */}
      <section className="beat-section-x pb-20 md:pb-28">
        {loading ? (
          <p className="beat-section-inset font-sans text-sm font-semibold text-white/70">
            Loading programs…
          </p>
        ) : null}

        {error ? (
          <p className="beat-section-inset font-sans text-sm font-semibold text-[#d43535]">
            Failed to load programs.
          </p>
        ) : null}

        {!loading && !error && programs.length === 0 ? (
          <p className="beat-section-inset font-sans text-sm font-semibold text-white/70">
            No programs available.
          </p>
        ) : null}

        {/* Mobile — carousel (matches Home programs) */}
        {!loading && !error && programs.length > 0 ? (
          <div className="beat-section-inset lg:hidden">
            <div className="relative overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {programs.map((program, idx) => {
                  const imageUrl = program?.image?.url

                  return (
                    <div
                      key={program?._id ?? `mobile-slide-${idx}`}
                      className="w-full shrink-0 px-4 py-3"
                    >
                      <ProgramArtwork
                        imageUrl={imageUrl}
                        title={program?.title}
                        maxWidthClass="w-[70%] max-w-[500px]"
                      />
                    </div>
                  )
                })}
              </div>

              {programs.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handlePrevProgram}
                    className="absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 backdrop-blur-sm transition-colors hover:bg-black/50"
                    aria-label="Previous program"
                  >
                    <span className="beat-gradient-text text-xl leading-none">‹</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextProgram}
                    className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 backdrop-blur-sm transition-colors hover:bg-black/50"
                    aria-label="Next program"
                  >
                    <span className="beat-gradient-text text-xl leading-none">›</span>
                  </button>
                </>
              ) : null}
            </div>

            <div className="px-4 pt-5 text-center">
              <h2 className="m-0 font-sans text-2xl font-black leading-tight tracking-[-0.02em] text-white">
                {renderProgramTitle(programs[currentSlide]?.title)}
              </h2>
              {programs[currentSlide]?.description ? (
                <RichTextContent
                  html={programs[currentSlide].description}
                  className="mt-4 font-sans text-base leading-relaxed text-white/90"
                />
              ) : null}
            </div>

            {programs.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  {programs.map((program, idx) => (
                    <button
                      key={program?._id ?? `mobile-dot-${idx}`}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 w-2.5 rounded-full transition-all ${
                        idx === currentSlide ? 'w-6 bg-[#11b5db]' : 'bg-white/35'
                      }`}
                      aria-label={`Go to program ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Desktop — stacked list */}
        <div className="hidden flex-col gap-12 lg:flex lg:gap-20">
          {programs.map((program, index) => {
            const imageUrl = program?.image?.url

            return (
              <article
                key={program?._id ?? `${program?.title ?? 'program'}-${index}`}
                className="beat-section-inset grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:items-start lg:gap-12"
              >
                <div className="self-start">
                  <h1 className="m-0 font-museo-bold text-3xl font-black leading-tight tracking-[-0.02em] text-white lg:text-6xl">
                    {renderProgramTitle(program?.title)}
                  </h1>
                  {program?.description ? (
                    <RichTextContent
                      html={program.description}
                      className="mt-4 font-sans text-base leading-relaxed text-white md:mt-5 md:text-xl"
                    />
                  ) : null}
                </div>

                <div>
                  <ProgramArtwork
                    imageUrl={imageUrl}
                    title={program?.title}
                    maxWidthClass="w-full max-w-[520px] md:max-w-[640px] lg:max-w-[860px]"
                  />
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
