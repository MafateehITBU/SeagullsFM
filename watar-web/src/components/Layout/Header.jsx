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
      {/* Visual LTR row so logo stays on screen-left per reference, while page is RTL */}
      <div
        dir="ltr"
        className="mx-auto flex h-[110px] max-w-[1400px] items-center justify-between gap-6 px-5 md:h-[120px] md:px-10 lg:px-14"
      >
        <Link
          to="/"
          className="relative z-20 flex shrink-0 items-center"
          aria-label="وتر إف إم — الصفحة الرئيسية"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="وتر إف إم"
              className="h-14 w-auto object-contain md:h-[72px]"
            />
          ) : (
            <span className="inline-block h-14 w-28 md:h-[72px]" aria-hidden="true" />
          )}
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-10 lg:gap-14 md:flex"
          aria-label="القائمة الرئيسية"
          dir="rtl"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={(e) => handleNavClick(item, e)}
              className="font-sans text-lg font-bold text-white transition-opacity hover:opacity-80 md:text-xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="relative z-20 flex h-11 w-11 items-center justify-center rounded-md text-white md:hidden"
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

      {/* Mobile drawer — RTL */}
      <div
        id="watar-mobile-menu"
        className={`watar-mobile-drawer fixed inset-0 z-10 bg-[rgba(169,19,104,0.97)] md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        dir="rtl"
        hidden={!menuOpen}
      >
        <nav
          className="flex h-full flex-col items-stretch gap-2 px-8 pt-32"
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
        </nav>
      </div>
    </header>
  )
}
