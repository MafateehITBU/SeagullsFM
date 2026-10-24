import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { optimizedImageUrl } from '../../utils/imageUrl.js'
import { fetchWatarNews, plainNewsText } from '../../utils/watarNews.js'

function NewsCard({ item, position, onFocus }) {
  const [broken, setBroken] = useState(false)
  const title = item?.title || ''
  const description = plainNewsText(item?.description)
  const imageUrl = item?.images?.[0]?.url
  const showImage = Boolean(imageUrl) && !broken

  return (
    <article
      className="watar-news-card"
      data-pos={position}
      onClick={position === 'active' ? undefined : onFocus}
    >
      <div className="watar-news-card-image">
        {showImage ? (
          <img
            src={optimizedImageUrl(imageUrl, 800)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        ) : null}
      </div>
      <div className="watar-news-card-panel">
        <div className="watar-news-card-copy">
          <h3 className="watar-news-card-title">{title}</h3>
          {description ? (
            <p className="watar-news-card-desc">{description}</p>
          ) : null}
        </div>
        <Link
          to={`/news/${item.slug}`}
          className="watar-news-more"
          onClick={(event) => event.stopPropagation()}
        >
          اقرأ المزيد
        </Link>
      </div>
    </article>
  )
}

function carouselSlots(items, active) {
  const count = items.length
  if (count === 0) return []
  if (count === 1) {
    return [{ item: items[0], position: 'active', index: 0 }]
  }

  const next = (active + 1) % count
  if (count === 2) {
    return [
      { item: items[active], position: 'active', index: active },
      { item: items[next], position: 'next', index: next },
    ]
  }

  const previous = (active - 1 + count) % count
  return [
    { item: items[previous], position: 'previous', index: previous },
    { item: items[active], position: 'active', index: active },
    { item: items[next], position: 'next', index: next },
  ]
}

export default function NewsSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadNews() {
      try {
        const filtered = await fetchWatarNews()
        if (!cancelled) setItems(filtered)
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

  useEffect(() => {
    if (active > items.length - 1) setActive(0)
  }, [active, items.length])

  useEffect(() => {
    if (paused || items.length < 2) return undefined
    const timer = setInterval(() => {
      setActive((index) => (index + 1) % items.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [paused, items.length, cycle])

  const slots = carouselSlots(items, active)

  function focusItem(index) {
    setActive(index)
    setCycle((value) => value + 1)
  }

  return (
    <section
      className="watar-edge w-full bg-transparent py-16 md:py-24"
      aria-labelledby="watar-news-heading"
      aria-roledescription="carousel"
    >
      <h2 id="watar-news-heading" className="watar-news-heading">
        آخر الأخبار والمستجدات
      </h2>

      {loading ? (
        <div className="watar-news-stage" aria-hidden="true">
          <div className="watar-news-card" data-pos="previous" />
          <div className="watar-news-card" data-pos="active" />
          <div className="watar-news-card" data-pos="next" />
        </div>
      ) : null}

      {error ? (
        <p className="mt-14 text-center text-lg font-medium text-white" role="alert">
          تعذّر تحميل الأخبار. حاول تحديث الصفحة.
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="mt-14 text-center text-lg font-medium text-white/90">
          لا توجد أخبار حالياً.
        </p>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div
          className="watar-news-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slots.map((slot) => (
            <NewsCard
              key={slot.item.slug}
              item={slot.item}
              position={slot.position}
              onFocus={() => focusItem(slot.index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
