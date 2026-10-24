import DOMPurify from 'dompurify'
import axiosInstance from '../axiosConfig'

export const WATAR_CHANNEL =
  import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'WatarFM'

export async function fetchWatarPrograms() {
  const response = await axiosInstance.get('/program')
  const list = Array.isArray(response.data?.data) ? response.data.data : []
  return list.filter(
    (program) =>
      program?.isActive !== false && program?.channelId?.name === WATAR_CHANNEL,
  )
}

export function plainProgramText(value) {
  if (!value) return ''
  const withBreaks = String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
  return DOMPurify.sanitize(withBreaks, { ALLOWED_TAGS: [] })
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
