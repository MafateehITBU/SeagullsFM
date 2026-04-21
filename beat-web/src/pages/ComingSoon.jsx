import { useLocation } from 'react-router-dom'
import bColor from '../assets/imgs/home/b-color.png'

const TITLES = {
  '/about-us': 'About Us',
  '/news': 'News',
  '/presenters': 'Presenters',
  '/login': 'Login',
  '/programs': 'All Programs',
  '/events': 'Events',
  '/broadcaster': 'Broadcaster',
  '/get-discovered': 'Get Discovered',
  '/show-your-talent': 'Show Your Talent',
}

export default function ComingSoon() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'This Page'

  return (
    <main className="relative isolate min-h-[70vh] overflow-hidden bg-[#0c0c0c] px-4 py-20 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-[#09d8c0]/20 blur-3xl animate-pulse" />
        <div className="absolute right-8 top-1/3 h-64 w-64 rounded-full bg-[#1c86ff]/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-6 left-1/3 h-52 w-52 rounded-full bg-[#f049fa]/15 blur-3xl animate-pulse" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm md:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#11b5db]">
            Beat FM
          </p>
          <h1 className="mt-3 font-sans text-4xl font-black leading-tight text-white md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-base font-medium text-white/75 md:text-lg">
            We are building something fresh and exciting. This page will be live very soon.
          </p>
        </div>

        <div className="relative w-full max-w-[320px] md:max-w-[420px]">
          <img
            src={bColor}
            alt=""
            className="h-auto w-full object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.45)]"
            aria-hidden="true"
          />
          <div className="absolute inset-0 grid place-items-center">
            <span className="rounded-full border border-white/30 bg-black/30 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/90">
              Coming Soon
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
