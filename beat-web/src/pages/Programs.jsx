import { useEffect, useState } from 'react'
import axiosInstance from '../axiosConfig'
import ProgramArtwork from '../components/ProgramArtwork.jsx'
import RichTextContent from '../components/RichTextContent.jsx'
import bottomImg from '../assets/imgs/home/bottom.png'

const BEAT_CHANNEL = import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'BeatFM'

const WEEKDAY_SET = new Set([
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
])

const PROGRAM_SEGMENTS = {
  diana: {
    match: /diana/i,
    blocks: [
      {
        label: '7 o’clock hour',
        segments: [
          {
            title: 'What’s the Tea?',
            description: 'Rundown of latest entertainment news.',
          },
          {
            title: 'Looking For An Answer',
            description:
              'A different quiz question every day, usually a riddle tailor made by Diana, sometimes movie/music trivia, and games like what’s the missing lyric!',
          },
        ],
      },
      {
        label: '8 o’clock hour',
        segments: [
          {
            title: 'Bop or Flop?',
            description:
              'Brand new song that listeners vote on whether or not it should be played on Beat FM.',
          },
          {
            title: 'Random Morning Question',
            description:
              'A different debate/discussion type question for listeners to respond to — typically observational and related to social dynamics, lifestyle or relationship talk.',
          },
          {
            title: 'Mental Health Mondays',
            note: 'Mondays only',
            description:
              'Dr. Yazan joins the show to discuss a different mental health related topic, which often feels like free therapy.',
          },
          {
            title: 'Beauty and the Beat',
            description: 'Beauty, style, and fashion tips and tricks.',
          },
        ],
      },
      {
        label: '9 o’clock hour',
        segments: [
          {
            title: 'Convos Over Coffee',
            description:
              'Topic of the Day, local news, and interviews all fall in this segment.',
          },
          {
            title: 'Morning Moment of Motivation',
            description: 'A motivational quote to carry into the day.',
          },
        ],
      },
    ],
  },
  ibz: {
    match: /ibz/i,
    blocks: [
      {
        label: 'Show segments',
        segments: [
          {
            title: 'The Daily Debate',
            note: 'Opening Question',
            description:
              'Starting the show with a bang! Hilarious hypotheticals to insane dilemmas, all with the purpose of getting listeners thinking, laughing, and sharing their opinions as we kick off the show.',
          },
          {
            title: 'Weatherify',
            note: 'Weather Report',
            description:
              'Stay updated with today’s weather that probably will change as we go into the night… but I also gotchu covered for tomorrow’s weather!',
          },
          {
            title: 'Trifecta Trivia Tournament',
            description:
              'We got games to keep you company: a riddle, a song, and a scene from a movie/TV show. Your objective is to get all 3 correct to become the champion of the day. Who knows — you might win something too.',
          },
          {
            title: 'CWW',
            note: 'Classroom without Walls',
            description:
              'You the audience vote for a month-long observance to learn about. We have a lot of fun, but we have a responsibility to seek knowledge and learn.',
          },
          {
            title: 'Welcome to the Gulag',
            note: 'Gaming',
            description:
              'You found yourself at the Gulag with your cellmate… me. We are bringing you the latest gaming news, major announcements, new releases, and entertaining discussions from across the gaming community.',
          },
          {
            title: 'Fitness Pitstop',
            description:
              'Your go-to stop for all things health and fitness! From workouts and gym tips to nutrition, sleep, recovery, and healthy habits, Fitness Pitstop explores the essentials of living a healthier, more balanced lifestyle through informative and engaging conversations.',
          },
          {
            title: 'LeeWufufu',
            note: 'Game',
            description:
              'Who deserves the top spot? Crown the Champion takes us through LeeWufufu tournaments filled with exciting matchups, entertaining debates, and unexpected results as we narrow down the competition to one deserving winner. You could very easily find yourself debating with everyone on who has more aura — Charles Darwin or Eminem?',
          },
          {
            title: 'Traffic Tales',
            note: 'Rush Hour Confessions · Bumper to Bumper',
            description:
              'When the traffic gets to be a little too much, it calls for a little excitement for your day. Join in by sharing your most embarrassing stories along with the host to add laughter and smiles to your day. You might even miss a turn on the way home.',
          },
        ],
      },
    ],
  },
}

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

function startTimeMinutes(value) {
  if (!value || typeof value !== 'string') return Number.POSITIVE_INFINITY
  const [hoursRaw, minutesRaw] = value.split(':')
  const hours = Number.parseInt(hoursRaw, 10)
  const minutes = Number.parseInt(minutesRaw ?? '0', 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.POSITIVE_INFINITY
  return hours * 60 + minutes
}

function segmentsForProgram(title) {
  const entry = Object.values(PROGRAM_SEGMENTS).find((item) => item.match.test(title ?? ''))
  return entry?.blocks ?? []
}

function SegmentsDivider({ label }) {
  return (
    <div className="flex items-center gap-4">
      <p className="beat-gradient-text m-0 shrink-0 font-sans text-xs font-black uppercase tracking-[0.28em] sm:text-sm">
        {label}
      </p>
      <span className="h-px flex-1 bg-gradient-to-r from-[#11b5db]/55 to-transparent" aria-hidden="true" />
    </div>
  )
}

function SegmentBlock({ block }) {
  return (
    <div className="space-y-5">
      {block.label ? <SegmentsDivider label={block.label} /> : null}

      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
        {block.segments.map((segment) => (
          <li
            key={segment.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 transition-colors hover:border-[#11b5db]/35 hover:bg-white/[0.05]"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="m-0 font-sans text-lg font-black leading-tight text-white sm:text-xl">
                {segment.title}
              </h4>
              {segment.note ? (
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[#11b5db]">
                  {segment.note}
                </span>
              ) : null}
            </div>
            <p className="mt-3 m-0 font-sans text-sm font-medium leading-relaxed text-white/70 sm:text-[15px]">
              {segment.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/program')
        const filtered = (response.data?.data ?? [])
          .filter(
            (program) =>
              program?.isActive !== false && program?.channelId?.name === BEAT_CHANNEL,
          )
          .sort(
            (a, b) => startTimeMinutes(a?.startTime) - startTimeMinutes(b?.startTime),
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

  return (
    <main className="relative w-full overflow-x-hidden bg-[#0c0c0c]">
      <img
        src={bottomImg}
        alt=""
        className="pointer-events-none absolute right-0 top-[18%] z-0 hidden h-auto w-[58vw] max-w-[520px] object-contain opacity-40 md:block md:w-[70vw] md:max-w-[1100px]"
        aria-hidden="true"
      />

      <section className="beat-section-x relative z-10 pb-8 pt-10 md:pb-12 md:pt-14">
        <div className="beat-section-inset mx-auto max-w-[1400px] text-center md:text-left">
          <p className="m-0 font-sans text-xs font-bold uppercase tracking-[0.32em] text-[#11b5db]">
            Beat FM
          </p>
          <h1 className="main-show-title mt-4 text-[clamp(2.75rem,8vw,5.5rem)]">
            Our
            <br />
            Programs
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-base font-medium leading-relaxed text-white/70 md:mx-0 md:text-lg">
            Meet the daily shows that keep Beat loud — from Diana’s morning energy to IBZ’s
            drive-home chaos, segment by segment.
          </p>
        </div>
      </section>

      <section className="beat-section-x relative z-10 pb-20 md:pb-28">
        {loading ? (
          <p className="beat-section-inset font-sans text-sm font-semibold text-white/70">
            Loading shows…
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

        <div className="mx-auto flex max-w-[1400px] flex-col gap-20 lg:gap-28">
          {programs.map((program, index) => {
            const isSwapped = index % 2 === 1
            const displayDays = formatProgramDays(program?.days)
            const displayTime = formatProgramTime(program?.startTime, program?.endTime)
            const imageUrl = program?.image?.url
            const blocks = segmentsForProgram(program?.title)

            return (
              <article
                key={program?._id ?? `${program?.title ?? 'program'}-${index}`}
                className="beat-section-inset"
              >
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <div
                    className={`${
                      isSwapped ? 'order-2 lg:order-2' : 'order-2 lg:order-1'
                    } self-center text-center md:text-left`}
                  >
                    <h2 className="m-0 font-['Museo'] text-3xl font-light leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                      {renderProgramTitle(program?.title)}
                    </h2>
                    <p className="mt-5 font-sans text-base font-bold tracking-[-0.03em] text-white sm:text-2xl lg:text-3xl">
                      {displayDays}
                    </p>
                    <p className="mt-1 font-sans text-lg font-black text-white/90 sm:text-2xl lg:text-3xl">
                      {displayTime}
                    </p>
                    {program?.description ? (
                      <RichTextContent
                        html={program.description}
                        className="mt-5 max-w-xl font-sans text-sm font-medium leading-relaxed text-white/65 sm:text-base"
                      />
                    ) : null}
                  </div>

                  <div
                    className={`${
                      isSwapped ? 'order-1 lg:order-1' : 'order-1 lg:order-2'
                    } self-center`}
                  >
                    <ProgramArtwork
                      imageUrl={imageUrl}
                      title={program?.title}
                      maxWidthClass="w-full max-w-[640px] lg:max-w-[860px]"
                    />
                  </div>
                </div>

                {blocks.length > 0 ? (
                  <div className="mt-12 space-y-10 border-t border-white/10 pt-10 lg:mt-14 lg:pt-12">
                    {/diana/i.test(program?.title ?? '') ? (
                      <SegmentsDivider label="Show segments" />
                    ) : null}
                    {blocks.map((block) => (
                      <SegmentBlock
                        key={`${program?._id}-${block.label || 'segments'}`}
                        block={block}
                      />
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
