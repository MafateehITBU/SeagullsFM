import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import newsHero from '../assets/news-hero.svg'
import { optimizedImageUrl } from '../utils/imageUrl.js'
import { fetchWatarNews, plainNewsText } from '../utils/watarNews.js'

const INITIAL_COUNT = 9
const PAGE_STEP = 3

function scrollToGrid() {
  const target = document.getElementById('watar-news-grid')
  if (!target) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

function NewsGridCard({ item }) {
  const [broken, setBroken] = useState(false)
  const title = item?.title || ''
  const description = plainNewsText(item?.description)
  const imageUrl = item?.images?.[0]?.url
  const showImage = Boolean(imageUrl) && !broken

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[38px] border border-[#171717]/80 bg-white">
      <div className="aspect-[16/10] w-full bg-[#f4e8ee]">
        {showImage ? (
          <img
            src={optimizedImageUrl(imageUrl, 800)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-4 py-4 text-right md:px-5 md:py-5">
        <h2 className="line-clamp-2 text-xl font-extrabold leading-snug text-[#AB0067] md:text-[22px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 line-clamp-3 text-[15px] font-medium leading-relaxed text-[#171717] md:text-base">
            {description}
          </p>
        ) : null}
        <div className="mt-auto self-start pt-4">
          <Link to={`/news/${item.slug}`} className="watar-news-more watar-news-grid-more">
            اقرأ المزيد
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function News() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)

  useEffect(() => {
    let cancelled = false

    async function loadNews() {
      try {
        const list = await fetchWatarNews()
        if (!cancelled) setItems(list)
      } catch (err) {
        console.error('Failed to load news:', err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadNews()
    return () => {
      cancelled = true
    }
  }, [])

  const visible = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <main className="w-full overflow-x-hidden bg-transparent">
      <section
        dir="ltr"
        className="watar-edge grid items-stretch gap-8 py-8 md:grid-cols-[1.35fr_0.85fr] md:gap-8 md:py-6 lg:min-h-[860px] lg:gap-6"
      >
        <div className="flex min-w-0 items-center justify-center md:justify-start">
          <img
            src={newsHero}
            alt=""
            className="watar-news-hero-art"
          />
        </div>

        <div className="flex min-w-0 items-center md:-translate-y-10">
          <div dir="rtl" className="flex w-full flex-col items-start text-right">
          <h1 dir="rtl" className="w-full text-right text-[clamp(2.7rem,4.8vw,3.85rem)] font-extrabold leading-tight text-[#FFC106]">
            أخبار ومستجدات
          </h1>
          <p dir="rtl" className="mt-6 w-full max-w-[38rem] text-right text-[clamp(1.55rem,2.4vw,2.3rem)] font-medium leading-[1.5] text-white md:mt-8">
            أخبار الموسيقى، حكايات الفنانين، وكل جديد على وتر FM.
          </p>
          <button
            type="button"
            dir="rtl"
            onClick={scrollToGrid}
            className="mt-8 inline-flex cursor-pointer items-center gap-3 text-right text-[clamp(2.05rem,3.4vw,3.25rem)] font-extrabold text-white transition-opacity hover:opacity-80 md:mt-12"
          >
            <span>اقرأ المزيد</span>
            <svg viewBox="0 0 14 16" className="h-[0.42em] w-[0.36em] fill-[#FFC106]" aria-hidden="true">
              <path d="M14 0 L0 8 L14 16 Z" />
            </svg>
          </button>
          </div>
        </div>
      </section>

      <section
        id="watar-news-grid"
        className="watar-edge scroll-mt-32 bg-transparent pb-20 pt-12 md:scroll-mt-36 md:pb-28 md:pt-20"
        aria-label="قائمة الأخبار"
      >
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="aspect-[4/5] rounded-[38px] bg-white/25" />
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="py-16 text-center text-lg font-medium text-white" role="alert">
            تعذّر تحميل الأخبار. حاول تحديث الصفحة.
          </p>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <p className="py-16 text-center text-lg font-medium text-white/90">
            لا توجد أخبار حالياً.
          </p>
        ) : null}

        {!loading && !error && visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {visible.map((item) => (
              <NewsGridCard key={item.slug} item={item} />
            ))}
          </div>
        ) : null}

        {hasMore ? (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_STEP, items.length))}
            className="mx-auto mt-14 flex rounded-[10px] border border-white px-10 py-3 text-lg font-bold text-white transition-colors hover:bg-white hover:text-[#AB0067]"
          >
            عرض المزيد
          </button>
        ) : null}
      </section>
    </main>
  )
}
