import { useEffect, useState } from 'react'
import axiosInstance from '../../axiosConfig'
import ProgramShowcase from './ProgramShowcase.jsx'
import {
  formatProgramDays,
  formatProgramTime,
} from '../../utils/programSchedule.js'

const CHANNEL =
  import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'WatarFM'

function MobileProgramCard({ program }) {
  const imageUrl = program?.image?.url
  const detailsUrl = program?.programDetailsImage?.url
  const displayDays = formatProgramDays(program?.days)
  const displayTime = formatProgramTime(program?.startTime, program?.endTime)
  const title = program?.title || 'برنامج'

  return (
    <article
      dir="rtl"
      className="box-border flex w-full shrink-0 grow-0 basis-full items-center gap-3 px-1 py-2"
    >
      <div className="flex w-[48%] shrink-0 items-end justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-auto max-h-[220px] w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center text-sm text-white/70">
            لا تتوفر صورة
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center text-center">
        {detailsUrl ? (
          <img
            src={detailsUrl}
            alt=""
            className="mb-3 h-auto w-full max-w-[9.5rem] object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <h3 className="mb-2 font-mix text-xl font-bold leading-tight text-white">
            {title}
          </h3>
        )}
        {detailsUrl ? <h3 className="sr-only">{title}</h3> : null}
        <p className="font-sans text-sm font-bold text-white sm:text-base">
          {displayDays}
        </p>
        <p className="mt-0.5 font-latin text-xs font-medium text-white sm:text-sm">
          {displayTime}
        </p>
      </div>
    </article>
  )
}

export default function ProgramsSection() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetchPrograms = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/program')
        const list = Array.isArray(response.data?.data) ? response.data.data : []
        const filtered = list.filter(
          (program) =>
            program?.isActive !== false &&
            program?.channelId?.name === CHANNEL,
        )
        if (!cancelled) setPrograms(filtered)
      } catch (err) {
        console.error('Failed to load programs:', err)
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPrograms()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (currentSlide > programs.length - 1) {
      setCurrentSlide(0)
    }
  }, [programs, currentSlide])

  useEffect(() => {
    if (programs.length <= 1) return undefined
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === programs.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [programs.length])

  return (
    <section
      id="programs"
      className="mx-auto w-full max-w-[1400px] scroll-mt-28 px-5 pb-6 pt-6 md:px-10 md:pt-8 lg:px-14"
      aria-labelledby="programs-heading"
    >
      {loading ? (
        <p className="py-16 text-center text-lg font-medium text-white/80">
          جارٍ تحميل البرامج…
        </p>
      ) : null}

      {error ? (
        <p className="py-16 text-center text-lg font-medium text-white" role="alert">
          تعذّر تحميل البرامج. حاول تحديث الصفحة.
        </p>
      ) : null}

      {!loading && !error && programs.length === 0 ? (
        <p className="py-16 text-center text-lg font-medium text-white/85">
          لا توجد برامج متاحة حالياً.
        </p>
      ) : null}

      {/* Mobile — auto carousel (RTL), image + details side by side, no arrows */}
      {!loading && !error && programs.length > 0 ? (
        <div className="py-10 lg:hidden">
          <div
            dir="rtl"
            className="relative overflow-hidden"
            aria-roledescription="carousel"
            aria-live="polite"
          >
            <div
              className="flex w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(${currentSlide * 100}%)` }}
            >
              {programs.map((program, index) => (
                <MobileProgramCard
                  key={program?._id ?? `mobile-slide-${index}`}
                  program={program}
                />
              ))}
            </div>
          </div>

          {programs.length > 1 ? (
            <div
              className="mt-8 flex items-center justify-center gap-2"
              role="tablist"
              aria-label="برامج"
            >
              {programs.map((program, idx) => (
                <button
                  key={program?._id ?? `mobile-dot-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentSlide}
                  aria-label={`البرنامج ${idx + 1}`}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-6 bg-[#FFC20E]'
                      : 'w-2.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Desktop — existing stacked / alternating layout */}
      {!loading && !error && programs.length > 0 ? (
        <div className="hidden flex-col lg:flex">
          {programs.map((program, index) => (
            <ProgramShowcase
              key={program?._id ?? `${program?.title}-${index}`}
              program={program}
              index={index}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
