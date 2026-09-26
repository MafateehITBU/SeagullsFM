import { useStaticInfo } from '../../context/StaticInfoContext.jsx'
import appArt from '../../assets/app-section-img.svg'

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 fill-white lg:h-11 lg:w-11" aria-hidden="true">
      <path d="M16.7 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.2c.7-1 1.2-2 1.5-3.1-3.9-1.5-3.8-5.5-3.8-5.3zM14.8 6.2c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-.9 2.9 1.1.1 2.1-.5 2.8-1.4z" />
    </svg>
  )
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 lg:h-10 lg:w-10" aria-hidden="true">
      <path fill="#34A853" d="M3.2 20.6 13.6 12 3.2 3.4v17.2z" />
      <path fill="#FBBC04" d="M16.4 14.5 13.6 12 3.2 20.6c.5.6 1.3.7 2 .2l11.2-6.3z" />
      <path fill="#EA4335" d="M20.2 10.7 16.4 8.5 13.6 12l2.8 2.5 3.8-2.2c.7-.4.7-1.2 0-1.6z" />
      <path fill="#4285F4" d="M3.2 3.4 13.6 12l2.8-2.5L5.2 3.2c-.7-.5-1.5-.4-2 .2z" />
    </svg>
  )
}

function StoreLink({ href, children, label }) {
  const className =
    'inline-flex shrink-0 items-center gap-2 text-white transition hover:opacity-80 lg:gap-3'

  if (!href) {
    return (
      <span dir="ltr" className={className} aria-label={label}>
        {children}
      </span>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className={className}
      aria-label={label}
    >
      {children}
    </a>
  )
}

export default function DownloadAppSection() {
  const { staticInfo } = useStaticInfo()

  return (
    <section
      className="w-full"
      aria-labelledby="download-app-heading"
    >
      <div
        dir="ltr"
        className="flex min-h-[520px] w-full flex-col-reverse items-center justify-center gap-8 py-16 md:min-h-[560px] lg:min-h-[580px] lg:flex-row lg:items-center lg:justify-end lg:gap-6 lg:py-20"
      >
        <div
          dir="rtl"
          className="flex w-full max-w-xl flex-col items-start px-5 text-start md:px-10 lg:w-auto lg:max-w-xl lg:shrink-0 lg:px-0"
        >
          <h2
            id="download-app-heading"
            className="font-sans text-[clamp(1.4rem,3.2vw,2.55rem)] font-extrabold leading-[1.25] text-white"
          >
            الآن يمكنك الإستماع الى الراديو
            <br />
            المفضل لديك على تطبيق وتر
          </h2>
          <p className="mt-6 font-sans text-[clamp(1.3rem,2.6vw,2.15rem)] font-extrabold leading-none text-[#FABA09]">
            حمّل التطبيق
          </p>
          <div className="mt-12 flex w-full flex-nowrap items-center justify-center gap-4 lg:w-auto lg:justify-start lg:gap-10">
            <StoreLink href={staticInfo?.googlePlay} label="Get it on Google Play">
              <PlayMark />
              <span className="text-left font-latin leading-tight">
                <span className="block text-xs font-medium tracking-wide lg:text-sm">GET IT ON</span>
                <span className="block text-lg font-semibold lg:text-2xl">Google Play</span>
              </span>
            </StoreLink>
            <StoreLink href={staticInfo?.appStore} label="Available on the App Store">
              <AppleMark />
              <span className="text-left font-latin leading-tight">
                <span className="block text-xs font-medium lg:text-sm">Available on the</span>
                <span className="block text-lg font-semibold lg:text-2xl">App Store</span>
              </span>
            </StoreLink>
          </div>
        </div>

        <div className="relative flex min-h-[320px] w-full shrink-0 items-end justify-center pe-4 sm:pe-6 md:min-h-[480px] md:pe-8 lg:w-auto lg:shrink-0 lg:justify-end lg:pe-14">
          <img
            src={appArt}
            alt="تطبيق وتر على الهاتف"
            width={800}
            height={800}
            className="h-auto w-[min(100%,42rem)] max-w-none max-h-[620px] object-contain object-right md:w-[min(58vw,48rem)] md:max-h-[760px]"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}
