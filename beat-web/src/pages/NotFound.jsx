import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/', { replace: true })
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <main className="relative isolate min-h-[70vh] overflow-hidden bg-[#0c0c0c] px-4 py-20 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-[#09d8c0]/20 blur-3xl" />
        <div className="absolute right-8 top-1/3 h-64 w-64 rounded-full bg-[#1c86ff]/20 blur-3xl" />
        <div className="absolute bottom-6 left-1/3 h-52 w-52 rounded-full bg-[#f049fa]/15 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#11b5db]">
          Beat FM
        </p>
        <h1 className="font-sans text-5xl font-black leading-none text-white md:text-7xl">404</h1>
        <p className="text-xl font-bold text-white md:text-2xl">This page doesn’t exist</p>
        <p className="max-w-lg text-base font-medium text-white/75 md:text-lg">
          You will be redirected to the homepage in 5 seconds.
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-[#11b5db] px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#0c0c0c] transition hover:brightness-110"
        >
          Back to home
        </Link>
      </section>
    </main>
  )
}
