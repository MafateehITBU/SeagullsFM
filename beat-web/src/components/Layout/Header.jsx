import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../../assets/imgs/logo.png'
import frequencyImg from '../../assets/imgs/home/frequency.png'
import { useStaticInfo } from '../../context/StaticInfoContext.jsx'

const navClass =
  'font-sans text-lg font-medium text-[#f8f8f8]/90 transition-colors hover:text-[#f8f8f8]'

const navActive = ({ isActive }) =>
  `${navClass} ${isActive ? 'font-bold text-[#f8f8f8]' : ''}`

const mobileNavClass =
  'block w-full rounded-lg px-4 py-3.5 text-left font-sans text-lg font-medium text-[#f8f8f8]/90 transition-colors hover:bg-white/5 hover:text-[#f8f8f8]'

const mobileNavActive = ({ isActive }) =>
  `${mobileNavClass} ${isActive ? 'bg-white/10 font-bold text-[#f8f8f8]' : ''}`

function FacebookIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#000000"
        stroke="#ffffff"
        strokeWidth="1.15"
        strokeLinejoin="round"
        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="1.5"
      />
      <circle cx="17" cy="7" r="1.25" fill="#000" stroke="none" />
    </svg>
  )
}

function BurgerIcon({ open }) {
  if (open) {
    return (
      <svg
        className="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    )
  }
  return (
    <span className="flex flex-col gap-1.5" aria-hidden="true">
      <span className="block h-0.5 w-6 rounded-full bg-[#f8f8f8]" />
      <span className="block h-0.5 w-6 rounded-full bg-[#f8f8f8]" />
      <span className="block h-0.5 w-6 rounded-full bg-[#f8f8f8]" />
    </span>
  )
}

export default function Header() {
  const { staticInfo } = useStaticInfo()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const facebookUrl = staticInfo?.socialMediaLinks?.facebook
  const instagramUrl = staticInfo?.socialMediaLinks?.instagram

  useEffect(() => {
    // Sync menu closed when URL changes (back/forward, external navigation)
    queueMicrotask(() => setMenuOpen(false))
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0c0c0c] px-4 py-4 md:px-10">
      <div className="mx-auto flex w-full max-w-none items-center justify-between gap-3 md:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-10">
          <Link
            to="/"
            className="shrink-0 outline-none ring-[#f8f8f8]/30 focus-visible:ring-2"
            onClick={closeMenu}
          >
            <img
              src={logo}
              alt="Beat"
              className="h-9 w-auto object-contain md:h-20"
            />
          </Link>

          <nav
            className="hidden min-w-0 flex-nowrap items-center gap-x-4 md:flex md:gap-x-7"
            aria-label="Main"
          >
            <NavLink to="/" end className={navActive}>
              Home
            </NavLink>
            <NavLink to="/about-us" className={navActive}>
              About Us
            </NavLink>
            <NavLink to="/news" className={navActive}>
              News
            </NavLink>
            <NavLink to="/presenters" className={navActive}>
              Presenters
            </NavLink>
            <NavLink to="/login" className={navActive}>
              Login
            </NavLink>
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex md:gap-2">
          <label className="relative max-w-[30vw] sm:max-w-none">
            <span className="sr-only">Search</span>
            <input
              type="search"
              name="search"
              placeholder="Search"
              className="font-sans w-full min-w-[4rem] rounded-full border-2 border-[#ffffff] bg-[#141414] px-3 py-1 text-center text-sm text-[#f8f8f8] placeholder:text-center placeholder:text-[#ffffff] outline-none sm:w-40 md:w-30"
            />
          </label>

          {facebookUrl ? (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          ) : null}

          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#f8f8f8] transition-colors hover:bg-white/10 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <BurgerIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile backdrop */}
      <button
        type="button"
        tabIndex={menuOpen ? 0 : -1}
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out md:hidden ${
          menuOpen
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile drawer — slides in from the right */}
      <div
        id="mobile-nav-drawer"
        className={`fixed top-0 right-0 z-[70] flex h-full w-[min(100%,20rem)] max-w-[100vw] flex-col border-l border-white/10 bg-[#0c0c0c] shadow-[-8px_0_32px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <span className="font-sans text-base font-semibold tracking-wide text-[#f8f8f8]">
            Menu
          </span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#f8f8f8] transition-colors hover:bg-white/10"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-4 pb-8"
          aria-label="Mobile main"
        >
          <NavLink to="/" end className={mobileNavActive} onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/about-us" className={mobileNavActive} onClick={closeMenu}>
            About Us
          </NavLink>
          <NavLink to="/news" className={mobileNavActive} onClick={closeMenu}>
            News
          </NavLink>
          <NavLink to="/presenters" className={mobileNavActive} onClick={closeMenu}>
            Presenters
          </NavLink>
          <NavLink to="/login" className={mobileNavActive} onClick={closeMenu}>
            Login
          </NavLink>
        </nav>

        <div className="px-4 pb-5">
          <img
            src={frequencyImg}
            alt=""
            className="mx-auto h-auto w-full max-w-[220px] object-contain opacity-95"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  )
}
