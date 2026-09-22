import {
  formatProgramDays,
  formatProgramTime,
} from '../../utils/programSchedule.js'

export default function ProgramShowcase({ program, index = 0 }) {
  const imageFirst = index % 2 === 1
  const imageUrl = program?.image?.url
  const detailsUrl = program?.programDetailsImage?.url
  const displayDays = formatProgramDays(program?.days)
  const displayTime = formatProgramTime(program?.startTime, program?.endTime)
  const title = program?.title || 'برنامج'

  const copy = (
    <div
      dir="rtl"
      className="relative z-10 flex w-auto shrink-0 flex-col items-center text-center"
    >
      {detailsUrl ? (
        <img
          src={detailsUrl}
          alt=""
          className="mb-5 h-auto w-[min(75vw,18rem)] max-w-none object-contain md:mb-6 md:w-[min(32vw,24rem)] lg:w-[min(28vw,26rem)]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <h3 className="mb-3 font-mix text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
          {title}
        </h3>
      )}

      {detailsUrl ? <h3 className="sr-only">{title}</h3> : null}

      <p className="font-sans text-xl font-bold text-white md:text-2xl lg:text-3xl">
        {displayDays}
      </p>
      <p className="mt-1 font-latin text-lg font-medium text-white md:text-xl lg:text-2xl">
        {displayTime}
      </p>
    </div>
  )

  const artwork = (
    <div className="relative flex min-h-[260px] shrink-0 items-end justify-center md:min-h-[360px]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="relative z-10 h-auto max-h-[440px] w-full max-w-lg object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)] md:max-h-[560px] md:max-w-xl"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="relative z-10 flex h-64 w-full max-w-sm items-center justify-center text-white/70">
          لا تتوفر صورة
        </div>
      )}
    </div>
  )

  return (
    <article
      dir="ltr"
      className={`watar-reveal relative flex flex-col items-center gap-6 py-5 md:gap-8 md:py-8 lg:flex-row lg:items-center lg:gap-10 ${
        imageFirst ? 'lg:justify-start' : 'lg:justify-end'
      }`}
      style={{ animationDelay: `${Math.min(index, 4) * 0.08}s` }}
    >
      {imageFirst ? (
        <>
          {artwork}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {artwork}
        </>
      )}
    </article>
  )
}
