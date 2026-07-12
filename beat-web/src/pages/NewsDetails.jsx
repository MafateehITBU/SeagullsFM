import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import RichTextContent from '../components/RichTextContent.jsx'

export default function NewsDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const news = location.state?.news
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = (news?.images ?? []).filter((img) => img?.url)

  useEffect(() => {
    if (!news) {
      navigate('/news', { replace: true })
    }
  }, [news, navigate])

  useEffect(() => {
    setCurrentIndex(0)
  }, [news?._id])

  useEffect(() => {
    if (images.length <= 1) return undefined

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1))
    }, 4000)

    return () => window.clearInterval(interval)
  }, [images.length, news?._id])

  if (!news) return null

  return (
    <main className="w-full overflow-x-hidden bg-[#0c0c0c]">
      <section className="beat-section-x pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="beat-section-inset">
          <Link
            to="/news"
            className="mb-6 inline-block border-0 bg-transparent p-0 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#9fd4ff] no-underline transition-colors hover:text-[#c8e8ff] md:text-sm"
          >
            ← Back to News
          </Link>

          {images.length > 0 ? (
            <div className="mb-8 overflow-hidden rounded-2xl bg-[#141414]">
              <div
                className="flex h-[min(40vh,320px)] w-full transition-transform duration-700 ease-in-out sm:h-[min(44vh,380px)] md:h-[min(48vh,420px)]"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((image, index) => (
                  <figure
                    key={image._id ?? `${image.url}-${index}`}
                    className="m-0 flex h-full w-full shrink-0 items-center justify-center"
                  >
                    <img
                      src={image.url}
                      alt={`${news.title || 'News'} – ${index + 1}`}
                      className="block h-full w-full object-contain"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </figure>
                ))}
              </div>
            </div>
          ) : null}

          <h1 className="font-museo-bold m-0 text-left text-3xl leading-tight tracking-[-0.03em] text-white md:text-5xl">
            {news.title}
          </h1>

        

          {news.publishedAt || news.createdAt ? (
            <p className="mt-4 font-sans text-sm font-bold text-white/60">
              Published:{' '}
              {new Date(news.publishedAt ?? news.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          ) : null}

          {news.content ? (
            <RichTextContent
              html={news.content}
              className="mt-8 font-sans text-base leading-relaxed text-white/90 md:text-lg"
            />
          ) : null}
        </div>
      </section>
    </main>
  )
}
