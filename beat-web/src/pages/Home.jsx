import { useCallback, useEffect, useRef, useState } from 'react'
import heroBg from '../assets/imgs/home/hero-bg.png'
import frequencyImg from '../assets/imgs/home/frequency.png'
import mobileImg from '../assets/imgs/home/mobile.png'
import playWhite from '../assets/imgs/home/b-white.png'
import bColor from '../assets/imgs/home/b-color.png'
import bottomImg from '../assets/imgs/home/bottom.png'


import axiosInstance from '../axiosConfig'

const STREAM_URL = 'https://securestreams2.autopo.st:1242/live'

const WEEKDAY_SET = new Set([
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
])

function formatProgramDays(days) {
    if (!Array.isArray(days) || days.length === 0) return '—'
    const normalized = days.map((day) => String(day).trim().toLowerCase()).filter(Boolean)
    if (normalized.length === 5 && normalized.every((day) => WEEKDAY_SET.has(day))) {
        return 'Weekdays'
    }
    return days.join(', ')
}

function formatTimeForDisplay(time) {
    if (!time || typeof time !== 'string') return null
    const [hoursRaw, minutesRaw] = time.split(':')
    const hours = Number.parseInt(hoursRaw, 10)
    if (Number.isNaN(hours)) return null
    const minutes = Number.parseInt(minutesRaw ?? '0', 10)
    const safeMinutes = Number.isNaN(minutes) ? 0 : Math.min(59, Math.max(0, minutes))
    const twelveHour = hours % 12 || 12
    return {
        time: `${twelveHour}:${String(safeMinutes).padStart(2, '0')}`,
        period: hours >= 12 ? 'PM' : 'AM',
    }
}

function formatProgramTime(startTime, endTime) {
    const start = formatTimeForDisplay(startTime)
    const end = formatTimeForDisplay(endTime)
    if (!start && !end) return '—'
    if (start && !end) return `${start.time} ${start.period}`
    if (!start && end) return `${end.time} ${end.period}`
    if (start.period === end.period) {
        return `${start.time} - ${end.time} ${end.period}`
    }
    return `${start.time} ${start.period} - ${end.time} ${end.period}`
}

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

export default function Home() {
    const audioRef = useRef(null)
    const [playing, setPlaying] = useState(false)
    const [programs, setPrograms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        fetchPrograms()
    }, [])

    const fetchPrograms = async () => {
        try {
            const response = await axiosInstance.get('/program')
            const filteredPrograms = response.data.data.filter(
                (program) => program.channelId.name === "BeatFM"
            );
            setPrograms(filteredPrograms);
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const el = audioRef.current
        if (!el) return
        const sync = () => setPlaying(!el.paused)
        el.addEventListener('play', sync)
        el.addEventListener('pause', sync)
        el.addEventListener('ended', sync)
        return () => {
            el.removeEventListener('play', sync)
            el.removeEventListener('pause', sync)
            el.removeEventListener('ended', sync)
        }
    }, [])

    const handleListenLive = useCallback(() => {
        const el = audioRef.current
        if (!el) return
        if (!el.paused) {
            el.pause()
            return
        }
        void el.play().catch((err) => {
            console.error('Stream playback failed:', err)
        })
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
        <main className="w-full overflow-x-hidden">
            {/* Hero Section */}
            <section className="home-hero w-full py-15 md:py-20">
                {/* Hero Background-Top */}
                <div className="home-hero-top">
                    <img
                        src={heroBg}
                        alt=""
                        className="home-hero-bg-img"
                        aria-hidden="true"
                    />
                    <div className="home-hero-content">
                        <div className="home-hero-text">
                            <p className="home-hero-copy">
                                turn it up.
                                <br />
                                feel the
                                <br />
                                <span className="home-hero-beat">beat.</span>
                            </p>
                        </div>
                        <div className="home-hero-frequency">
                            <img src={frequencyImg} alt="102.5" />
                        </div>
                    </div>
                </div>


                {/* Hero Listen Live Button */}
                <div className="home-hero-listen-wrap">
                    <button
                        type="button"
                        className="flex w-[70vw] md:w-[53vw] max-w-full cursor-pointer items-stretch gap-[10px] border-0 bg-transparent p-0 font-sans font-black text-2xl md:text-6xl leading-none text-black outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b7d] focus-visible:ring-offset-2 focus-visible:ring-offset-white [&_span]:flex [&_span]:items-center"
                        onClick={handleListenLive}
                        aria-pressed={playing}
                        aria-label={playing ? 'Pause live stream' : 'Listen live'}
                    >
                        <span className="flex w-[65%] shrink-0 items-center justify-end bg-[#ff4b7d] md:px-[10px] md:py-[5px] px-2 py-1 uppercase tracking-[-0.05em]">
                            {playing ? 'PAUSE' : 'LISTEN'}
                        </span>

                        <span className="flex w-[40vw] md:w-[35%] shrink-0 items-center justify-between gap-[15px] bg-[#2d7be5] md:px-[10px] md:py-[5px] px-2 py-1 uppercase text-white">
                            <span className="flex items-center text-white tracking-[-0.05em]">LIVE</span>
                            <img
                                src={playWhite}
                                alt="Play"
                                width="60"
                                height="60"
                                className="pointer-events-none md:h-[60px] md:w-[60px] h-8 w-8 shrink-0 object-contain"
                            />
                            <audio
                                ref={audioRef}
                                className="hidden"
                                preload="none"
                                id="beat-live-stream"
                            >
                                <source src={STREAM_URL} />
                            </audio>
                        </span>
                    </button>
                </div>
            </section>

            {/* Programs Section */}
            <section className="relative mb-14 mt-5 w-full overflow-hidden px-4 md:px-6 md:mb-40">
                <img
                    src={bottomImg}
                    alt=""
                    className="pointer-events-none absolute right-0 bottom-0 z-0 hidden h-auto w-[58vw] max-w-[520px] object-contain opacity-90 md:block md:w-[90vw] md:max-w-[1500px]"
                    aria-hidden="true"
                />
                <div className="relative z-10">
                {loading ? (
                    <p className="text-center font-sans text-sm font-semibold text-white/70 md:text-left">Loading shows...</p>
                ) : null}
                {error ? (
                    <p className="text-center font-sans text-sm font-semibold text-[#d43535] md:text-left">Failed to load programs.</p>
                ) : null}

                {/* Mobile Layout - card: image top, data + button bottom */}
                {programs.length > 0 ? (
                    <div className="md:hidden">
                        <div className="relative overflow-hidden rounded-3xl">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {programs.map((program, idx) => {
                                    const displayDays = formatProgramDays(program?.days)
                                    const displayTime = formatProgramTime(program?.startTime, program?.endTime)
                                    const imageUrl = program?.image?.url

                                    return (
                                        <article key={program?._id ?? `mobile-slide-${idx}`} className="w-full shrink-0 rounded-3xl px-4 py-3">
                                            <div className="relative mx-auto mb-5 w-[70%] max-w-[500px]">
                                                <img
                                                    src={bColor}
                                                    alt=""
                                                    className="h-auto w-full object-contain"
                                                    aria-hidden="true"
                                                />
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={program?.title || 'Program artwork'}
                                                        className="absolute -inset-[1.5%] h-[103%] w-[103%] object-contain"
                                                        loading="lazy"
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="mb-2 self-start text-center">
                                                {idx === 0 ? (
                                                    <h1
                                                        className="mb-6 font-sans text-2xl font-black uppercase leading-[0.92] tracking-[-0.03em]"
                                                        style={{
                                                            fontFamily: 'Gotham',
                                                            fontWeight: 900,
                                                            backgroundImage:
                                                                'linear-gradient(90deg, #09d8c0 0%, #11b5db 30%, #179cee 62%, #1c86ff 100%)',
                                                            WebkitBackgroundClip: 'text',
                                                            backgroundClip: 'text',
                                                            color: 'transparent',
                                                        }}
                                                    >
                                                        Main
                                                        Show
                                                    </h1>
                                                ) : null}

                                                <h3 className="font-sans text-xl font-extrabold leading-tight text-white">
                                                    {program?.title}
                                                </h3>
                                                <p className="mt-5 font-sans text-base font-bold tracking-[0.03em] text-white">
                                                    {displayDays}
                                                </p>
                                                <p className="mt-1 font-sans text-base font-black text-white/90">
                                                    {displayTime}
                                                </p>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                            {programs.length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevProgram}
                                        className="absolute left-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 backdrop-blur-sm transition-colors hover:bg-black/50"
                                        aria-label="Previous program"
                                    >
                                        <span
                                            className="text-2xl font-black leading-none"
                                            style={{
                                                fontFamily: 'Gotham',
                                                fontWeight: 900,
                                                backgroundImage:
                                                    'linear-gradient(90deg, #09d8c0 0%, #11b5db 30%, #179cee 62%, #1c86ff 100%)',
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                color: 'transparent',
                                            }}
                                        >
                                            ‹
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextProgram}
                                        className="absolute right-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 backdrop-blur-sm transition-colors hover:bg-black/50"
                                        aria-label="Next program"
                                    >
                                        <span
                                            className="text-2xl font-black leading-none"
                                            style={{
                                                fontFamily: 'Gotham',
                                                fontWeight: 900,
                                                backgroundImage:
                                                    'linear-gradient(90deg, #09d8c0 0%, #11b5db 30%, #179cee 62%, #1c86ff 100%)',
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                color: 'transparent',
                                            }}
                                        >
                                            ›
                                        </span>
                                    </button>
                                </>
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

                <div className="hidden flex-col gap-8 md:flex md:gap-3">
                    {programs.map((program, index) => {
                        const isSwapped = index % 2 === 1
                        const displayDays = formatProgramDays(program?.days)
                        const displayTime = formatProgramTime(program?.startTime, program?.endTime)
                        const imageUrl = program?.image?.url

                        return (
                            <article
                                key={program?._id ?? `${program?.title ?? 'program'}-${index}`}
                                className={`grid grid-cols-1 items-start gap-6 rounded-3xl p-4 md:grid-cols-2 md:items-start md:gap-12 md:p-6 ${
                                    index === 1 ? 'relative md:-mt-10' : ''
                                }`}
                            >
                                <div
                                    className={`${
                                        isSwapped ? 'order-2 md:order-2' : 'order-2 md:order-1'
                                    } self-start text-center md:text-left ${
                                        index === 1 ? 'md:pl-10 lg:pl-14' : ''
                                    }`}
                                >
                                    {index === 0 ? (
                                        <h1
                                            className="mb-10 font-sans text-4xl font-black uppercase leading-[0.92] tracking-[-0.03em] md:text-7xl"
                                            style={{
                                                fontFamily: 'Gotham',
                                                fontWeight: 900,
                                                backgroundImage:
                                                    'linear-gradient(90deg, #09d8c0 0%, #11b5db 30%, #179cee 62%, #1c86ff 100%)',
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                color: 'transparent',
                                            }}
                                        >
                                            Main
                                            <br />
                                            Show
                                        </h1>
                                    ) : null}

                                    <h3 className="font-['Museo'] font-light text-3xl leading-tight text-white md:text-6xl tracking-[-0.03em]">
                                        {renderProgramTitle(program?.title)}
                                    </h3>
                                    <p className="mt-6 font-sans text-base font-bold tracking-[-0.03em] text-white md:text-4xl">
                                        {displayDays}
                                    </p>
                                    <p className=" font-sans text-lg font-black text-white/90 md:text-4xl">
                                        {displayTime}
                                    </p>
                                </div>

                                <div className={isSwapped ? 'order-1 self-start md:order-1' : 'order-1 self-start md:order-2'}>
                                    <div
                                        className={`relative mx-auto w-full max-w-[860px] md:max-w-[1040px] ${
                                            index === 1 ? 'md:-mt-50 lg:-mt-70 md:z-20' : ''
                                        }`}
                                    >
                                        <img
                                            src={bColor}
                                            alt=""
                                            className="h-auto w-full object-contain"
                                            aria-hidden="true"
                                        />
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={program?.title || 'Program artwork'}
                                                className="absolute -inset-[10%] h-[120%] w-[120%] object-contain"
                                                loading="lazy"
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
                </div>
            </section>


            {/* Download App Section */}
            <section
                className="home-download-app mt-5 mb-20 md:mb-70 "
                aria-labelledby="download-app-heading"
            >
                <div className="home-download-app-inner">
                    <div className="home-download-app-copy">
                        <h2 id="download-app-heading" className="home-download-app-title">
                            Download App
                        </h2>
                        <p className="home-download-app-sub text-white">& listen to it live.</p>
                    </div>
                    <img
                        src={mobileImg}
                        alt=""
                        className="home-download-app-phone"
                        aria-hidden="true"
                    />
                </div>
            </section>

        </main>
    )
}
