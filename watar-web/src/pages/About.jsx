import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { useStaticInfo } from '../context/StaticInfoContext.jsx'
import diamondsArt from '../assets/diamonds.svg'
import aboutArt from '../assets/about-2.svg'

const STATS = [
  { value: 11, suffix: '+', label: 'عاماً من الموسيقى والثقافة' },
  { value: 8, suffix: 'K+', label: 'مستمع شهرياً' },
  { value: 120, suffix: '+', label: 'برنامج ومقدم موسيقي' },
]

function plainAboutText(value) {
  if (!value) return ''
  const withBreaks = String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
  return DOMPurify.sanitize(withBreaks, { ALLOWED_TAGS: [] })
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

function StatValue({ value, suffix }) {
  const ref = useRef(null)
  const played = useRef(false)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(value)
      return undefined
    }

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return
        played.current = true
        const start = performance.now()
        const duration = 1400
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - (1 - progress) ** 3
          setDisplay(Math.round(value * eased))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.45 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <p
      ref={ref}
      dir="ltr"
      className="font-sans text-[1.65rem] font-extrabold leading-none text-[#FFC106] sm:text-[2.1rem] lg:text-[clamp(2.4rem,4.6vw,4.6rem)]"
    >
      {display}
      {suffix}
    </p>
  )
}

export default function About() {
  const { staticInfo } = useStaticInfo()
  const aboutText = plainAboutText(staticInfo?.aboutUs)

  return (
    <main className="w-full bg-transparent">
      <section className="watar-about-hero relative mb-8 lg:mb-28" aria-labelledby="about-heading">
        <div className="watar-about-diamonds-frame lg:contents">
          <img
            src={diamondsArt}
            alt=""
            aria-hidden="true"
            className="watar-about-diamonds pointer-events-none"
          />
        </div>

        <div className="relative z-[1] flex items-start lg:min-h-[calc(100svh-124px)] lg:items-center">
          <div dir="rtl" className="watar-edge ml-auto w-full pb-2 pt-6 text-right lg:w-[44%] lg:py-0">
            <h1
              id="about-heading"
              className="font-sans text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-tight text-white"
            >
              من نحن
            </h1>

            {aboutText ? (
              <p className="mt-5 max-w-[34rem] whitespace-pre-line font-sans text-[17px] font-medium leading-[1.55] text-white md:text-[20px] lg:mt-6">
                {aboutText}
              </p>
            ) : null}

            <div dir="rtl" className="mt-8 grid grid-cols-3 gap-2 lg:mt-14 lg:gap-6">
              {STATS.map((stat) => (
                <div key={stat.label} className="min-w-0 px-0.5 text-center">
                  <StatValue value={stat.value} suffix={stat.suffix} />
                  <p className="mt-2 font-sans text-[12px] font-bold leading-tight text-white md:text-[16px] lg:mt-3 lg:text-[18px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="watar-about-overview relative mb-16 lg:mb-24"
        aria-labelledby="about-overview-heading"
      >
        <img
          src={aboutArt}
          alt=""
          aria-hidden="true"
          className="watar-about-illustration pointer-events-none"
        />

        <div className="relative z-[1] flex items-start pt-2 lg:min-h-[78vh] lg:items-center lg:pt-0">
          <div dir="rtl" className="watar-edge ml-auto w-full pb-10 pt-4 text-right lg:w-[42%] lg:py-0">
            <div className="relative pr-14 lg:pr-20">
              <div className="watar-about-gems" aria-hidden="true">
                <span className="watar-about-diamond" />
                <span className="watar-about-diamond" />
              </div>
              <h2
                id="about-overview-heading"
                className="font-sans text-[clamp(1.7rem,2.8vw,2.45rem)] font-extrabold leading-snug text-white"
              >
                لمحة عامة عن "وتر"
              </h2>
            </div>
            <p className="mt-5 max-w-[34rem] pr-14 font-sans text-[16px] font-medium leading-[1.7] text-white md:text-[20px] lg:mt-8 lg:pr-20">
              وتر إف إم هي محطة إذاعية عربية أطلقت في الأردن في شهر نيسان ٢٠١٥. وتبث بشكل أساسي مزيجاً من الموسيقى العربية العصرية والكلاسيكية من الثمانينيات والتسعينيات والألفية الثانية. وقد أضافت مؤخراً فقرات «النشرة الإخبارية» إلى برامجها لتصل إلى جميع سكان محافظتي عمان وإربد.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
