import DOMPurify from 'dompurify'
import axiosInstance from '../axiosConfig'

export const WATAR_CHANNEL =
  import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'WatarFM'

export function plainNewsText(value) {
  if (!value) return ''
  return DOMPurify.sanitize(String(value), { ALLOWED_TAGS: [] })
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchWatarNews() {
  const response = await axiosInstance.get('/news')
  const list = Array.isArray(response.data?.data) ? response.data.data : []
  return list.filter(
    (article) => article?.channelId?.name === WATAR_CHANNEL && article?.slug,
  )
}
