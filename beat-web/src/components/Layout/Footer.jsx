import { Link } from 'react-router-dom'
import frequencyImg from '../../assets/imgs/frequency-dark.png'
import { useStaticInfo } from '../../context/StaticInfoContext.jsx'

const linkClass =
  'font-sans text-sm font-medium text-[#0c0c0c]/90 transition-colors hover:text-[#0c0c0c]'

const colTitleClass = 'font-sans text-sm font-extrabold text-[#0c0c0c]'

export default function Footer() {
  const { staticInfo } = useStaticInfo()

  return (
    <footer className="w-full bg-[#ffffff] text-[#0c0c0c]">
      <div className="mx-auto flex max-w-8xl flex-col gap-10 px-4 py-5 md:flex-row md:items-start md:justify-between md:gap-10 md:px-6 lg:gap-28 lg:px-10">
        {/* Left: frequency asset + copyright */}
        <div className="flex w-full max-w-lg shrink-0 flex-col items-center gap-2 md:w-auto md:max-w-[250px] md:items-start lg:max-w-lg">
          <img
            src={frequencyImg}
            alt=""
            className="h-auto w-72 max-w-full object-contain sm:w-80 md:w-48 lg:w-64"
            width={300}
            height={80}
          />
          <p className="font-sans text-sm font-medium text-[#0c0c0c]/90">
            Beat FM. Copyright 2026 Seagulls Broadcast. All Rights Reserved.
          </p>
        </div>

        {/* Right: 3 columns — compact row, hug content, aligned end on md+ */}
        <div className="flex w-full flex-wrap items-start justify-start gap-x-6 gap-y-6 md:w-auto md:flex-wrap md:justify-end md:gap-x-8 md:gap-y-5 lg:flex-nowrap lg:gap-15">
          <nav className="flex min-w-[140px] flex-col gap-1" aria-label="Footer">
            <Link className={linkClass} to="/">
              Home
            </Link>
            <Link className={linkClass} to="/about-us">
              About Us
            </Link>
            <Link className={linkClass} to="/programs">
              All Programs
            </Link>
            <Link className={linkClass} to="/news">
              News
            </Link>
            <Link className={linkClass} to="/events">
              Events
            </Link>
            <Link className={linkClass} to="/broadcaster">
              Broadcaster
            </Link>
            <Link className={linkClass} to="/login">
              Login
            </Link>
            <Link className={linkClass} to="/privacy-policy">
              Privacy Policy
            </Link>
          </nav>

          <div className="hidden lg:flex min-w-[140px] flex-col gap-2">
            <p className={colTitleClass}>Get involved</p>
            <Link className={linkClass} to="/get-discovered">
              Get Discovered
            </Link>
            <Link className={linkClass} to="/show-your-talent">
              Show your talent
            </Link>
          </div>

          <div className="flex min-w-[160px] flex-col gap-2">
            <p className={colTitleClass}>Get in Touch</p>
            {staticInfo?.phoneNumber ? (
              <a
                className={`${linkClass} break-words`}
                href={`tel:${staticInfo.phoneNumber.replace(/\s/g, '')}`}
              >
                {staticInfo.phoneNumber}
              </a>
            ) : null}
            {staticInfo?.email ? (
              <a className={`${linkClass} break-all`} href={`mailto:${staticInfo.email}`}>
                {staticInfo.email}
              </a>
            ) : null}
            {staticInfo?.address ? (
              <p className="font-sans text-sm font-semibold leading-relaxed text-[#0c0c0c]/85">
                {staticInfo.address}
              </p>
            ) : null}
            {!staticInfo?.phoneNumber &&
            !staticInfo?.email &&
            !staticInfo?.address ? (
              <p className={linkClass}>—</p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
