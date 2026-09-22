import { useStaticInfo } from '../../context/StaticInfoContext.jsx'

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 3.75h2.4l1.2 3.3-1.65 1.05a12.6 12.6 0 0 0 5.85 5.85l1.05-1.65 3.3 1.2v2.4A1.5 1.5 0 0 1 18.15 18 14.4 14.4 0 0 1 6 5.85a1.5 1.5 0 0 1 1.5-2.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconCircle({ children }) {
  return (
    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/90 text-white">
      {children}
    </span>
  )
}

const MAP_LAT = 31.961933404571347
const MAP_LON = 35.901900196348514
/** Google Maps embed, zoomed on the studio coordinates */
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LON}&z=18&hl=ar&output=embed`

export default function Footer() {
  const { staticInfo, loading } = useStaticInfo()

  const phone = staticInfo?.phoneNumber?.trim() || ''
  const email = staticInfo?.email?.trim() || ''
  const address = staticInfo?.address?.trim() || ''
  const phones = phone
    ? phone.split(/[|/،,]+/).map((p) => p.trim()).filter(Boolean)
    : []

  return (
    <footer id="contact" className="scroll-mt-28" role="contentinfo">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 lg:px-14">
        <div className="h-px w-full bg-white/35" aria-hidden="true" />
      </div>

      <div
        dir="ltr"
        className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 md:grid-cols-[1.15fr_1fr] md:items-start md:gap-14 md:px-10 md:py-16 lg:px-14"
      >
        {/* Map — Google embed zoomed on studio; overflow clips bottom attribution chrome */}
        <div className="relative h-56 overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:h-72 lg:h-80">
          <iframe
            title="موقع وتر إف إم على الخريطة"
            src={MAP_EMBED_SRC}
            className="absolute inset-x-0 top-0 h-[calc(100%+48px)] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div dir="rtl" className="flex flex-col gap-5 text-white md:pt-2">
          {loading ? (
            <p className="text-white/70">جارٍ تحميل معلومات التواصل…</p>
          ) : null}

          {phones.length > 0 ? (
            <div className="flex items-start gap-3">
              <IconCircle>
                <PhoneIcon className="h-4 w-4" />
              </IconCircle>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5 font-latin text-base font-medium md:text-lg">
                {phones.map((p, i) => (
                  <span key={p} className="inline-flex items-center gap-2">
                    {i > 0 ? <span className="text-white/60">|</span> : null}
                    <a href={`tel:${p.replace(/\s/g, '')}`} className="hover:underline">
                      {p}
                    </a>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {email ? (
            <div className="flex items-start gap-3">
              <IconCircle>
                <MailIcon className="h-4 w-4" />
              </IconCircle>
              <a
                href={`mailto:${email}`}
                className="pt-1.5 font-latin text-base font-medium break-all hover:underline md:text-lg"
              >
                {email}
              </a>
            </div>
          ) : null}

          {address ? (
            <div className="flex items-start gap-3">
              <IconCircle>
                <PinIcon className="h-4 w-4" />
              </IconCircle>
              <p className="whitespace-pre-line pt-1.5 font-sans text-base leading-relaxed text-white/95 md:text-lg">
                {address}
              </p>
            </div>
          ) : null}

          {!loading && !phone && !email && !address ? (
            <p className="text-white/70">معلومات التواصل غير متوفرة حالياً.</p>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
