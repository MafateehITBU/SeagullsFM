import homeBanner from '../../assets/home-banner.svg'

export default function HeroBanner() {
  return (
    <section
      className="watar-reveal watar-edge mx-auto w-full pt-8 md:pt-12"
      aria-label="بانر وتر"
    >
      {/* Image on the left, yellow panel on the right */}
      <div
        dir="ltr"
        className="flex w-full flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:min-h-[320px] md:flex-row lg:min-h-[400px]"
      >
        <div className="relative w-full md:flex-[1.55]">
          <img
            src={homeBanner}
            width={1360}
            height={548}
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
          <p className="font-sans text-[clamp(2.4rem,6vw,4.25rem)] font-medium leading-[1.05] tracking-tight">
            الهوا كله
            <br />
            على وتر
          </p>
        </div>
      </div>
    </section>
  )
}
