import bannerImg from '../../assets/banner.jpg'

export default function HeroBanner() {
  return (
    <section
      className="watar-reveal mx-auto w-full max-w-[1400px] px-5 pt-2 md:px-10 lg:px-14"
      aria-label="بانر وتر"
    >
      {/* LTR row: image LEFT, yellow panel RIGHT (matches reference) */}
      <div
        dir="ltr"
        className="flex w-full flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:min-h-[320px] md:flex-row lg:min-h-[400px]"
      >
        <div className="relative w-full md:flex-[1.55]">
          <img
            src={bannerImg}
            alt="وتر إف إم — الهوا كله على وتر"
            className="h-56 w-full object-cover sm:h-72 md:absolute md:inset-0 md:h-full"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div
          dir="rtl"
          className="watar-hero-panel flex w-full flex-col items-center justify-center px-6 py-10 text-center md:w-[38%] md:max-w-md md:px-10 md:py-12 lg:px-12"
        >
          <p className="font-mix text-[clamp(2.4rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-tight">
            الهوا كله
            <br />
            على وتر
          </p>
        </div>
      </div>
    </section>
  )
}
