import { Link } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useStaticInfo } from '../context/StaticInfoContext.jsx'
import RichTextContent from '../components/RichTextContent.jsx'
import aboutImage from '../assets/imgs/about/web-12.png'

const INTRO_GRADIENT =
  'linear-gradient(90deg, #2400de 0%, #1f23e3 25%, #137cee 50%, #08c3f7 75%, #01f5fe 100%)'

const STATS = [
  { end: 20, suffix: '+', label: 'years of music\nand culture' },
  { end: 350, suffix: 'k+', label: 'Monthly listeners' },
  { end: 20, suffix: '+', label: 'Shows and Segments' },
]

function CountUp({ end, suffix = '', duration = 2800 }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const countRef = useRef(null)

  const animateCount = useCallback(() => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutCubic = 1 - (1 - progress) ** 3
      setCount(Math.floor(end * easeOutCubic))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [duration, end])

  useEffect(() => {
    const node = countRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            animateCount()
          }
        })
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [animateCount, hasAnimated])

  return (
    <p
      className="beat-gradient-text m-0 font-sans text-2xl font-black leading-none tracking-[-0.03em] sm:text-3xl md:text-7xl"
      ref={countRef}
    >
      {count}
      {suffix}
    </p>
  )
}

const WHO_WE_ARE_COPY =
  "Beat FM is Jordan's home for the biggest hits, freshest sounds, and most engaging radio personalities. Broadcasting from Amman to listeners across the Kingdom and beyond, we deliver a dynamic mix of contemporary music, entertainment, culture, and lifestyle content that keeps our audience connected and inspired. More than just a radio station, Beat FM is a platform for trendsetters, music lovers, and communities to come together through shared experiences, unforgettable events, and a passion for great music. Whether you're tuning in on-air, online, or through our app, Beat FM is your soundtrack to what's happening now."

export default function AboutUs() {
  const { staticInfo, loading } = useStaticInfo()
  const aboutUsText = staticInfo?.aboutUs?.trim()

  return (
    <main className="w-full overflow-x-hidden bg-[#0c0c0c]">
      {/* Section 1 — hero intro */}
      <section className="beat-section-x pb-16 pt-10 md:pb-30 md:pt-5">
        {/* About Us Title Section */}
        <div className="beat-section-inset">
          <h1 className="beat-gradient-text mb-5 text-[clamp(2rem,11vw,4rem)] font-black leading-[0.92] tracking-[-0.04em] md:mb-8">
            ABOUT
            <br />
            US
          </h1>
        </div>

        {/* About Us Copy Section */}
        <div className="beat-section-bleed-x" style={{ background: INTRO_GRADIENT }}>
          <div className="beat-section-x py-5 md:py-8">
            <div className="beat-section-inset">
              {loading ? (
                <p className="m-0 max-w-6xl font-sans text-base leading-relaxed text-white/70 md:text-xl">
                  Loading…
                </p>
              ) : (
                <RichTextContent
                  html={
                    aboutUsText ||
                    'Beat FM brings the biggest hits and freshest sounds to listeners across Jordan and beyond.'
                  }
                  className="m-0 max-w-6xl font-sans text-base leading-relaxed tracking-[-0.01em] text-white md:text-xl"
                />
              )}
            </div>
          </div>
        </div>


        {/* Stats Section */}
        <div className="beat-section-inset">
          <div className="mt-8 flex flex-nowrap items-start justify-between gap-2 md:mt-14 md:justify-start md:gap-5 lg:gap-7 xl:gap-15">
            {STATS.map((stat) => (
              <div key={stat.label} className="min-w-0 flex-1 md:flex-none md:shrink-0">
                <CountUp end={stat.end} suffix={stat.suffix} />
                <p className="mt-2 whitespace-pre-line font-sans text-[10px] font-medium leading-snug tracking-wide text-white sm:text-xs md:text-xl">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — who we are */}
      <section id="who-we-are" className="beat-section-x pb-20 md:pb-28">
        <div className="beat-section-inset grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12 xl:gap-20">
          <div>
            <h1 className="font-museo-bold mb-4 text-5xl leading-[0.95] tracking-[-0.03em] text-white md:mb-3 md:text-7xl">
              WHO WE ARE
            </h1>
            <p className="mb-6 max-w-3xl font-sans text-base leading-relaxed text-white/90 md:mb-10 md:text-lg">
              {WHO_WE_ARE_COPY}
            </p>
            <div className="flex justify-between flex-wrap items-center gap-4 md:gap-8">
              <Link
                to="/programs"
                className="border-0 bg-transparent p-0 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#9fd4ff] no-underline transition-colors hover:text-[#c8e8ff] md:text-2xl"
              >
                LEARN MORE
              </Link>
              <a
                href="/mediaKitBeat.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="border-0 bg-transparent p-0 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#9fd4ff] no-underline transition-colors hover:text-[#c8e8ff] md:text-2xl"
              >
                DOWNLOAD MEDIA KIT
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={aboutImage}
              alt="Beat FM studio and team"
              className="block h-auto w-full rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
