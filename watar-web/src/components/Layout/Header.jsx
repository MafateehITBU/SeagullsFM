import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStaticInfo } from '../../context/StaticInfoContext.jsx'

const NAV_ITEMS = [
  { label: 'تسجيل', to: '/login' },
  { label: 'برامجنا', to: '/#programs', hash: 'programs' },
  { label: 'عن وتر', to: '/about-us' },
  { label: 'أخبار', to: '/news' },
  { label: 'إتصل بنا', to: '/#contact', hash: 'contact' },
]

function Frequencies({ className = '' }) {
  return (
    <div
      dir="ltr"
      className={`items-center gap-3 text-[15px] font-medium leading-none text-white ${className}`}
    >
      <span>
        <span className="font-sans font-semibold">عمان</span>{' '}
        <span className="font-latin">88.3</span>
      </span>
      <span className="h-3.5 w-px bg-white/45" aria-hidden="true" />
      <span>
        <span className="font-sans font-semibold">إربد</span>{' '}
        <span className="font-latin">91.5</span>
      </span>
    </div>
  )
}

export default function Header() {
  const { staticInfo } = useStaticInfo()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const logoUrl = staticInfo?.favIcon || staticInfo?.frequencyimg

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
    <header
      className={`watar-nav ${scrolled ? 'is-scrolled' : ''}`}
      role="banner"
    >
      {/* LTR grid keeps logo left, nav center, frequencies right while Arabic stays RTL */}
      <div
        dir="ltr"
        className="mx-auto grid h-[84px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 md:h-[88px] md:gap-6 md:px-10 lg:px-14"
      >
        <Link
          to="/"
          className="relative z-20 flex h-12 w-12 shrink-0 items-center justify-center md:h-14 md:w-16"
          aria-label="وتر إف إم — الصفحة الرئيسية"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="وتر إف إم"
              className="h-full w-full object-contain object-left"
            />
          ) : (
            <span className="inline-block h-full w-full" aria-hidden="true" />
          )}
        </Link>

        <nav
          className="hidden items-center justify-center gap-8 md:flex lg:gap-12"
          aria-label="القائمة الرئيسية"
          dir="rtl"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={(e) => handleNavClick(item, e)}
              className="font-sans text-lg font-bold text-white transition-opacity hover:opacity-80 lg:text-xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-20 flex items-center justify-end gap-3">
          <Frequencies className="hidden sm:flex" />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md text-white md:hidden"
          aria-expanded={menuOpen}
          aria-controls="watar-mobile-menu"
          aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? 'إغلاق' : 'قائمة'}</span>
          <span className="flex w-6 flex-col gap-1.5">
            <span
              className={`h-0.5 w-full bg-white transition ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span
              className={`h-0.5 w-full bg-white transition ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-0.5 w-full bg-white transition ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </span>
        </button>
        </div>
      </div>

      <button
        type="button"
        className={`fixed inset-0 z-[9] bg-black/35 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="إغلاق القائمة"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile drawer slides in from the right */}
      <div
        id="watar-mobile-menu"
        className={`watar-mobile-drawer fixed inset-y-0 right-0 z-10 w-[min(20rem,84vw)] bg-[rgba(169,19,104,0.97)] shadow-[-12px_0_40px_rgba(0,0,0,0.25)] md:hidden ${
          menuOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        dir="rtl"
        aria-hidden={!menuOpen}
      >
        <nav
          className="flex h-full flex-col items-stretch gap-2 overflow-y-auto px-8 pt-28"
          aria-label="قائمة الجوال"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={(e) => handleNavClick(item, e)}
              className="border-b border-white/20 py-4 text-2xl font-bold text-white"
            >
              {item.label}
            </Link>
          ))}
          <Frequencies className="mt-8 flex sm:hidden" />
        </nav>
      </div>
    </header>
  )
}
