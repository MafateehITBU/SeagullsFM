import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import axiosInstance from '../axiosConfig'
import { optimizedImageUrl } from '../utils/imageUrl.js'

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'hr',
  'ul', 'ol', 'li',
]

function plainText(value) {
  if (!value) return ''
  return DOMPurify.sanitize(String(value), { ALLOWED_TAGS: [] })
    .replace(/\s+/g, ' ')
    .trim()
}

function safeHtml(value) {
  if (!value) return ''
  return DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS,
    FORBID_ATTR: ['style', 'class'],
  })
}

export default function NewsDetails() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    setArticle(null)
    setBroken(false)

    async function loadArticle() {
      try {
        const response = await axiosInstance.get(
          `/news/slug/${encodeURIComponent(slug || '')}`,
        )
        if (!cancelled) setArticle(response.data?.data || null)
      } catch (err) {
        console.error('Failed to load news article:', err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadArticle()
    return () => {
      cancelled = true
    }
  }, [slug])

  const imageUrl = article?.images?.[0]?.url
  const description = plainText(article?.description)

  return (
    <main dir="rtl" className="watar-edge w-full bg-transparent pb-28 pt-6 md:pb-40 md:pt-7">
      {loading ? (
        <p className="py-16 text-center text-lg font-medium text-white">جارٍ تحميل الخبر…</p>
      ) : null}

      {!loading && (error || !article) ? (
        <div className="py-16 text-center">
          <p className="text-lg font-bold text-white">تعذّر العثور على هذا الخبر.</p>
          <Link to="/news" className="mt-4 inline-block font-bold text-white underline">
            العودة للأخبار
          </Link>
        </div>
      ) : null}

      {!loading && article ? (
        <article>
          {imageUrl && !broken ? (
            <img
              src={optimizedImageUrl(imageUrl, 1200)}
              alt=""
              className="watar-article-photo"
              onError={() => setBroken(true)}
            />
          ) : null}
          <h1 className="mb-3 mt-6 text-right text-[28px] font-extrabold leading-[1.4] text-white md:text-[36px]">
            {article.title}
          </h1>
          {description ? (
            <p className="text-right text-[19px] font-medium leading-[1.5] text-white md:text-[22px]">
              {description}
            </p>
          ) : null}
          {article.content ? (
            <div
              className="watar-article-body mt-3 text-right text-[18px] font-normal leading-[1.6] text-white md:text-[20px]"
              dangerouslySetInnerHTML={{ __html: safeHtml(article.content) }}
            />
          ) : null}
        </article>
      ) : null}
    </main>
  )
}
