import { Link } from 'react-router-dom'
import { useStaticInfo } from '../context/StaticInfoContext.jsx'
import watarIcon from '../assets/icon.svg'

export default function ComingSoon() {
  const { staticInfo } = useStaticInfo()
  const logoUrl = staticInfo?.favIcon || staticInfo?.frequencyimg || watarIcon

  return (
    <main
      className="relative isolate flex min-h-[65vh] flex-col items-center justify-center overflow-hidden px-5 py-16 md:px-10 md:py-24"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-[#FABA09]/25 blur-3xl" />
        <div className="absolute left-8 top-1/3 h-64 w-64 rounded-full bg-[#B0006A]/30 blur-3xl" />
        <div className="absolute bottom-8 right-1/3 h-52 w-52 rounded-full bg-[#DD542D]/25 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <img
          src={logoUrl}
          alt="وتر إف إم"
          className="h-16 w-auto object-contain md:h-20"
        />

        <div>
          <p className="font-sans text-sm font-bold tracking-wide text-white/80 md:text-base">
            وتر إف إم
          </p>
          <h1 className="mt-5 font-sans text-xl font-bold text-[#FFC20E] md:text-2xl">
            قريباً
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-sans text-base leading-relaxed text-white/85 md:text-lg">
            نعمل على تجهيز هذه الصفحة لتقديم تجربة أفضل. ترقّبوا الإطلاق قريباً.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center bg-[#B0006A] px-8 py-3 font-sans text-base font-bold text-white transition hover:brightness-110 md:text-lg"
        >
          العودة للرئيسية
        </Link>
      </section>
    </main>
  )
}
