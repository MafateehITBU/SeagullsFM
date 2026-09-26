export function optimizedImageUrl(url, width = 1000) {
  if (typeof url !== 'string' || !url.includes('/image/upload/')) return url
  if (/\.svg(?:$|\?)/i.test(url)) return url
  if (url.includes('/image/upload/f_')) return url
  return url.replace(
    '/image/upload/',
    `/image/upload/f_webp,q_auto,w_${width}/`,
  )
}
