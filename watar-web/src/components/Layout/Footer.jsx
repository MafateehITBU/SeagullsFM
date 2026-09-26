import { Link } from 'react-router-dom'
import { useStaticInfo } from '../../context/StaticInfoContext.jsx'
import footerMark from '../../assets/footer.png'

const NAV_LINKS = [
  { label: 'الرئيسية', to: '/' },
  { label: 'من نحن', to: '/about-us' },
  { label: 'جميع البرامج', to: '/#programs' },
  { label: 'الأخبار', to: '/news' },
  { label: 'الفعاليات', to: '/events' },
  { label: 'المديرون', to: '/presenters' },
  { label: 'تسجيل الدخول', to: '/login' },
  { label: 'سياسة الخصوصية', to: '/privacy-policy' },
]

const SHARE_LINKS = [
  { label: 'اكتشف مومنتك', to: '/get-discovered' },
  { label: 'اعرض موهبتك', to: '/show-your-talent' },
]

function IconCircle({ children }) {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white">
      {children}
    </span>
  )
}

function PhoneIcon() {
  return (
    <IconCircle>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path
          d="M7.2 3.8h2.2l1.1 3-1.5 1a11.2 11.2 0 0 0 5.2 5.2l1-1.5 3 1.1v2.2a1.4 1.4 0 0 1-1.5 1.4A13 13 0 0 1 5.8 5.3a1.4 1.4 0 0 1 1.4-1.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </IconCircle>
  )
}

function MailIcon() {
  return (
    <IconCircle>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </IconCircle>
  )
}

function PinIcon() {
  return (
    <IconCircle>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path
          d="M12 21s6-5.1 6-9.8A6 6 0 0 0 6 11.2C6 15.9 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </IconCircle>
  )
}

export default function Footer() {
  const { staticInfo, loading } = useStaticInfo()

  const phone = staticInfo?.phoneNumber?.trim() || ''
  const email = staticInfo?.email?.trim() || ''
  const address = staticInfo?.address?.trim() || ''
  const phones = phone
    ? phone
        .split(/[|/،,]+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : []

  return (
    <footer id="contact" className="scroll-mt-28" role="contentinfo">
      <div className="mx-auto max-w-[1400px] px-6 pt-2 md:px-9">
        <div className="h-px w-full bg-white/80" aria-hidden="true" />
      </div>

      {/* Desktop */}
      <div
        dir="rtl"
        className="mx-auto hidden max-w-[1400px] items-start justify-between gap-10 px-8 py-16 lg:flex lg:gap-16 lg:px-10 lg:pb-20"
      >
        <div className="flex items-center gap-4 text-right">
          <img
            src={footerMark}
            alt="وتر"
            width={234}
            height={225}
            className="h-auto w-[150px] shrink-0 object-contain"
            loading="lazy"
            decoding="async"
          />
          <p className="max-w-[18rem] font-sans text-sm font-medium leading-relaxed text-white/90">
            <span className="font-bold">وتر اف ام. حقوق الطبع والنشر © 2023</span>
            <br />
            شركة سيغلر برودكاست. جميع الحقوق محفوظة.
          </p>
        </div>

        <nav className="flex flex-col items-start gap-2.5 text-right" aria-label="روابط التذييل">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-sans text-base font-medium text-white transition hover:opacity-80"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex max-w-[180px] flex-col items-start text-right">
          <p className="mb-3 font-sans text-base font-bold text-white">شارك معنا</p>
          {SHARE_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-sans text-base font-medium leading-7 text-white transition hover:opacity-80"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex max-w-[320px] flex-col items-start text-right">
          <p className="mb-3 font-sans text-base font-bold text-white">تواصل معنا</p>
          {loading ? (
            <p className="text-sm text-white/70">جارٍ التحميل…</p>
          ) : null}
          {phones.length > 0 ? (
            <p className="mb-2 flex items-start gap-2 font-latin text-sm font-medium text-white">
              <PhoneIcon />
              <span>
                {phones.map((p, i) => (
                  <span key={p}>
                    {i > 0 ? ' | ' : ''}
                    <a href={`tel:${p.replace(/\s/g, '')}`} className="hover:underline">
                      {p}
                    </a>
                  </span>
                ))}
                {' | '}
                <a href="tel:065638013" className="hover:underline">
                  065638013
                </a>
              </span>
            </p>
          ) : null}
          {email ? (
            <p className="mb-2 flex items-start gap-2 text-sm font-medium text-white">
              <MailIcon />
              <a href={`mailto:${email}`} className="break-all font-latin hover:underline">
                {email}
              </a>
            </p>
          ) : null}
          {address ? (
            <p className="flex items-start gap-2 text-sm font-medium leading-relaxed text-white">
              <PinIcon />
              <span className="whitespace-pre-line">{address}</span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Mobile */}
      <div dir="rtl" className="mx-auto flex max-w-[1400px] flex-col items-center gap-8 px-6 py-12 text-center lg:hidden">
        <div className="flex items-center gap-4 text-right">
          <img
            src={footerMark}
            alt="وتر"
            width={234}
            height={225}
            className="h-auto w-28 shrink-0 object-contain"
            loading="lazy"
            decoding="async"
          />
          <p className="max-w-[16rem] font-sans text-sm font-medium leading-relaxed text-white/90">
            <span className="font-bold">وتر اف ام. حقوق الطبع والنشر © 2023</span>
            <br />
            شركة سيغلر برودكاست. جميع الحقوق محفوظة.
          </p>
        </div>

        <div className="grid w-full grid-cols-[1.35fr_0.85fr] items-start gap-x-6 gap-y-8 text-right">
          <nav className="flex flex-col items-start gap-2" aria-label="روابط التذييل">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-sans text-base font-medium text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start">
            <p className="mb-2 font-sans text-base font-bold text-white">شارك معنا</p>
            {SHARE_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-sans text-base font-medium text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-start gap-2">
            <p className="font-sans text-base font-bold text-white">تواصل معنا</p>
            {phones.length > 0 ? (
              <p className="flex items-start gap-2 font-latin text-sm text-white">
                <PhoneIcon />
                <span>
                  {phones.map((p, i) => (
                    <span key={p}>
                      {i > 0 ? ' | ' : ''}
                      <a href={`tel:${p.replace(/\s/g, '')}`} className="hover:underline">
                        {p}
                      </a>
                    </span>
                  ))}
                  {' | '}
                  <a href="tel:065638013" className="hover:underline">
                    065638013
                  </a>
                </span>
              </p>
            ) : null}
            {email ? (
              <p className="flex items-start gap-2 text-sm text-white">
                <MailIcon />
                <a href={`mailto:${email}`} className="break-all font-latin hover:underline">
                  {email}
                </a>
              </p>
            ) : null}
            {address ? (
              <p className="flex items-start gap-2 font-sans text-sm leading-relaxed text-white">
                <PinIcon />
                <span className="whitespace-pre-line">{address}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
