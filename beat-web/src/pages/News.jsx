import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../axiosConfig'

const BEAT_CHANNEL = import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'BeatFM'
const INITIAL_VISIBLE = 6
const LOAD_MORE_COUNT = 6

const INTRO_LINES = [
  'Latest updates, Stories and highlights from the',
  'world of music',
]

function NewsCard({ item }) {
  const imageUrl = item?.images?.[0]?.url

  return (
    <article className="grid min-h-[220px] grid-cols-2 overflow-hidden rounded-3xl bg-white sm:min-h-[260px] lg:min-h-[280px]">
      <div className="flex min-h-0 flex-col justify-between p-5 md:p-6">
        <h2 className="m-0 font-sans text-lg font-bold leading-snug tracking-[-0.02em] !text-black md:text-xl lg:text-2xl">
          {item?.title}
        </h2>
        <Link
          to="/news-details"
          state={{ news: item }}
          className="mt-4 self-start border-0 bg-transparent p-0 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#9fd4ff] no-underline transition-colors hover:text-[#c8e8ff] md:text-lg"
        >
          LEARN MORE
        </Link>
      </div>

      {imageUrl ? (
        <div className="relative min-h-full w-full">
          <img
            src={imageUrl}
            alt={item?.title || 'News'}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="min-h-full bg-neutral-200" aria-hidden="true" />
      )}
    </article>
  )
}

export default function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/news')
        const filtered = (response.data?.data ?? []).filter(
          (item) => item.channelId?.name === BEAT_CHANNEL,
        )
        setNews(filtered)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const visibleNews = news.slice(0, visibleCount)
  const hasMore = news.length > visibleCount

  return (
    <main className="w-full overflow-x-hidden bg-[#0c0c0c]">
      <section className="beat-section-x pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="beat-section-inset">
          <h1 className="font-museo-bold m-0 text-left text-5xl leading-none tracking-[-0.03em] text-white md:text-6xl lg:text-7xl">
            NEWS
          </h1>

          <p className="mt-4 max-w-2xl text-left font-sans text-base leading-relaxed text-white/90 md:mt-5 md:text-lg">
            {INTRO_LINES[0]}
            <br />
            {INTRO_LINES[1]}
          </p>

          {loading ? (
            <p className="mt-10 font-sans text-sm font-semibold text-white/70">Loading news…</p>
          ) : null}

          {error ? (
            <p className="mt-10 font-sans text-sm font-semibold text-[#d43535]">
              Failed to load news.
            </p>
          ) : null}

          {!loading && !error && news.length === 0 ? (
            <p className="mt-10 font-sans text-sm font-semibold text-white/70">
              No news available.
            </p>
          ) : null}

          {!loading && !error && news.length > 0 ? (
            <>
              <div className="mt-10 grid grid-cols-1 gap-6 md:mt-12 md:gap-20 lg:grid-cols-2">
                {visibleNews.map((item) => (
                  <NewsCard key={item._id} item={item} />
                ))}
              </div>

              {hasMore ? (
                <div className="mt-10 flex justify-center md:mt-12">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + LOAD_MORE_COUNT, news.length),
                      )
                    }
                    className="border-0 bg-transparent p-0 font-sans text-sm font-bold uppercase tracking-[0.12em] text-[#9fd4ff] transition-colors hover:text-[#c8e8ff] md:text-base"
                  >
                    SHOW MORE
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}
