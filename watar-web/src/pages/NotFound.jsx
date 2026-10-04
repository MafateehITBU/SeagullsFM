import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const LEGACY_LOCALE = /(^|\/)(ar|en)(\/|$)/i

export default function NotFound() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isLegacyLocale = LEGACY_LOCALE.test(pathname)

  useEffect(() => {
    if (isLegacyLocale) return
    const timer = window.setTimeout(() => {
      navigate('/', { replace: true })
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [isLegacyLocale, navigate])

  if (isLegacyLocale) return null

  return (
    <main
      className="flex min-h-[65vh] flex-col items-center justify-center px-5 py-16 text-center md:px-10"
      dir="rtl"
    >
      <p className="font-sans text-sm font-bold text-white/80 md:text-base">وتر إف إم</p>
      <h1 className="mt-5 font-sans text-3xl font-bold text-[#FFC20E] md:text-4xl">404</h1>
      <p className="mx-auto mt-4 max-w-lg font-sans text-lg font-bold leading-relaxed text-white md:text-xl">
        هذه الصفحة غير موجودة
      </p>
      <p className="mx-auto mt-3 max-w-lg font-sans text-base leading-relaxed text-white/85">
        سيتم تحويلك إلى الصفحة الرئيسية خلال 5 ثوانٍ
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center bg-[#B0006A] px-8 py-3 font-sans text-base font-bold text-white transition hover:brightness-110"
      >
        العودة للرئيسية
      </Link>
    </main>
  )
}
