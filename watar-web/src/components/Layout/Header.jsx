import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStaticInfo } from '../../context/StaticInfoContext.jsx'

const NAV_ITEMS = [
  { label: 'تسجيل', to: '/login' },
  { label: 'عن وتر', to: '/about-us' },
  { label: 'برامجنا', to: '/#programs', hash: 'programs' },
  { label: 'أخبار', to: '/news' },
  { label: 'الفعاليات', to: '/events' },
]

function externalHref(value) {
  if (typeof value !== 'string') return ''
  const href = value.trim()
  if (!href) return ''
  if (/^https?:\/\//i.test(href)) return href
  return `https://${href.replace(/^\/\//, '')}`
}

function FrequencyColon() {
  return (
    <span className="inline-flex flex-col items-center gap-[3.5px]" aria-hidden="true">
      <span className="block h-[7px] w-[7px] rotate-45 rounded-[1px] bg-white" />
      <span className="block h-[7px] w-[7px] rotate-45 rounded-[1px] bg-white" />
    </span>
  )
}

function FrequencyPair({ city, value }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{city}</span>
      <FrequencyColon />
      <span className="font-latin">{value}</span>
    </span>
  )
}

function Frequencies({ className = '' }) {
  return (
    <div
      className={`items-center gap-4 text-[15px] font-medium leading-none whitespace-nowrap text-white ${className}`}
    >
      <FrequencyPair city="عمان" value="88.3" />
      <FrequencyPair city="إربد" value="91.5" />
    </div>
  )
}

function SocialBadge({ href, label, maskId, glyph }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="block h-9 w-9 shrink-0 transition hover:opacity-90"
    >
      <svg viewBox="0 0 36 36" className="h-full w-full" aria-hidden="true">
        <mask id={maskId}>
          <rect width="36" height="36" fill="white" />
          {glyph}
        </mask>
        <circle cx="18" cy="18" r="18" fill="#fff" mask={`url(#${maskId})`} />
      </svg>
    </a>
  )
}

function Logo({ logoUrl }) {
  return (
    <Link
      to="/"
      className="relative z-20 flex h-24 w-24 shrink-0 items-center justify-center"
      aria-label="وتر إف إم — الصفحة الرئيسية"
    >
      {logoUrl ? (
        <img src={logoUrl} alt="وتر إف إم" className="h-full w-full object-contain" />
      ) : (
        <span className="inline-block h-full w-full" aria-hidden="true" />
      )}
    </Link>
  )
}

function SocialLinks({ facebookUrl, instagramUrl, idPrefix, className = '' }) {
  if (!facebookUrl && !instagramUrl) return null
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {instagramUrl ? (
        <SocialBadge
          href={instagramUrl}
          label="إنستغرام"
          maskId={`${idPrefix}-instagram`}
          glyph={
            <g fill="none" stroke="black" strokeWidth="1.7">
              <rect x="10" y="10" width="16" height="16" rx="4.5" />
              <circle cx="18" cy="18" r="3.6" />
              <circle cx="23.2" cy="12.8" r="1" fill="black" stroke="none" />
            </g>
          }
        />
      ) : null}
      {facebookUrl ? (
        <SocialBadge
          href={facebookUrl}
          label="فيسبوك"
          maskId={`${idPrefix}-facebook`}
          glyph={
            <g transform="translate(12.2 7.2) scale(0.042)">
              <path
                fill="black"
                d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
              />
            </g>
          }
        />
      ) : null}
    </div>
  )
}

function SearchBox({ id, className = '' }) {
  return (
    <form
      role="search"
      className={className}
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="sr-only" htmlFor={id}>
        البحث
      </label>
      <input
        id={id}
        type="search"
        placeholder="البحث"
        className="h-11 w-full rounded-full border border-white bg-transparent px-5 text-center font-sans text-[15px] font-medium text-white outline-none placeholder:text-center placeholder:text-white [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
    </form>
  )
}

export default function Header() {
  const { staticInfo } = useStaticInfo()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const logoUrl = staticInfo?.favIcon || staticInfo?.frequencyimg
  const facebookUrl = externalHref(staticInfo?.socialMediaLinks?.facebook)
  const instagramUrl = externalHref(staticInfo?.socialMediaLinks?.instagram)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleNavClick = (item, event) => {
    if (!item.hash) return
    if (location.pathname === '/') {
      event.preventDefault()
      const el = document.getElementById(item.hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMenuOpen(false)
    }
  }

  return (
    <header className={`watar-nav ${scrolled ? 'is-scrolled' : ''}`} role="banner">
      <div
        dir="rtl"
        className="mx-auto hidden h-[124px] max-w-[1440px] items-center gap-4 px-6 pt-3 lg:flex xl:gap-6 xl:px-10"
      >
        <Logo logoUrl={logoUrl} />
        <Frequencies className="flex" />
        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-4 xl:gap-7"
          aria-label="القائمة الرئيسية"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={(event) => handleNavClick(item, event)}
              className="shrink-0 font-sans text-[17px] font-bold whitespace-nowrap text-white transition-opacity hover:opacity-80 xl:text-xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SocialLinks
          facebookUrl={facebookUrl}
          instagramUrl={instagramUrl}
          idPrefix="watar-social"
        />
        <SearchBox id="watar-search" className="w-[9.5rem] shrink-0" />
      </div>

      <div
        dir="rtl"
        className="mx-auto flex h-[112px] max-w-[1440px] items-center justify-between px-5 pt-2.5 lg:hidden"
      >
        <Logo logoUrl={logoUrl} />
        <button
          type="button"
          className={`relative z-20 flex h-11 w-11 items-center justify-center rounded-md text-white transition-opacity duration-300 ${
            menuOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          aria-expanded={menuOpen}
          aria-controls="watar-mobile-menu"
          aria-label="فتح القائمة"
          tabIndex={menuOpen ? -1 : 0}
          onClick={() => setMenuOpen(true)}
        >
          <span className="sr-only">قائمة</span>
          <span className="flex w-6 flex-col gap-1.5" aria-hidden="true">
            <span className="h-0.5 w-full bg-white" />
            <span className="h-0.5 w-full bg-white" />
            <span className="h-0.5 w-full bg-white" />
          </span>
        </button>
      </div>

      <button
        type="button"
        className={`fixed inset-0 z-[9] bg-black/35 transition-opacity duration-500 ease-out lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="إغلاق القائمة"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      <div
        id="watar-mobile-menu"
        className={`watar-mobile-drawer fixed inset-y-0 right-0 z-10 w-[min(20rem,84vw)] bg-[rgba(169,19,104,0.97)] shadow-[-12px_0_40px_rgba(0,0,0,0.25)] lg:hidden ${
          menuOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        dir="rtl"
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="absolute top-6 left-5 z-20 flex h-11 w-11 items-center justify-center text-white"
          aria-label="إغلاق القائمة"
          onClick={() => setMenuOpen(false)}
        >
          <span className="sr-only">إغلاق</span>
          <span className="relative block h-6 w-6" aria-hidden="true">
            <span className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 rotate-45 bg-white" />
            <span className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 -rotate-45 bg-white" />
          </span>
        </button>
        <nav
          className="flex h-full flex-col items-stretch gap-2 overflow-y-auto px-8 pt-24"
          aria-label="قائمة الجوال"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={(event) => handleNavClick(item, event)}
              className="border-b border-white/20 py-4 text-2xl font-bold text-white"
            >
              {item.label}
            </Link>
          ))}
          <SocialLinks
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            idPrefix="watar-social-mobile"
            className="mt-6"
          />
          <SearchBox id="watar-search-mobile" className="mt-6 w-full" />
          <Frequencies className="mt-8 flex" />
        </nav>
      </div>
    </header>
  )
}
