import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../axiosConfig'

const StaticInfoContext = createContext(null)

/**
 * Backend returns ALL static-info rows in one GET /staticinfo response.
 * We pick the row where channelId.name matches this value (not a separate MoodFM call).
 * Set VITE_STATICINFO_CHANNEL in .env to match your Channel name in the CMS (exact string).
 */
const STATICINFO_CHANNEL =
  import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'BeatFM'

function mapStaticInfoFromApi(item) {
  if (!item) return null
  return {
    channelId: item.channelId?._id ?? null,
    channelName: item.channelId?.name ?? null,
    aboutUs: item.aboutUS ?? item.aboutUs ?? null,
    frequency: item.frequency ?? null,
    frequencyimg: item.frequencyimg?.url ?? null,
    address: item.address ?? null,
    appStore: item.downloadApp?.AppStore ?? null,
    googlePlay: item.downloadApp?.GooglePlay ?? null,
    email: item.email ?? null,
    phoneNumber: item.phoneNumber ?? null,
    favIcon: item.favIcon?.url ?? null,
    socialMediaLinks: item.socialMediaLinks ?? null,
    metaDescription: item.metaDescription ?? null,
    metaTags: item.metaTags ?? null,
  }
}

export const StaticInfoProvider = ({ children }) => {
  const [staticInfo, setStaticInfo] = useState({
    channelId: null,
    channelName: null,
    aboutUs: null,
    frequency: null,
    frequencyimg: null,
    address: null,
    appStore: null,
    googlePlay: null,
    email: null,
    phoneNumber: null,
    favIcon: null,
    socialMediaLinks: null,
    metaDescription: null,
    metaTags: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStaticInfo = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/staticinfo')
        const list = response.data.data
        const match = Array.isArray(list)
          ? list.find((info) => info.channelId?.name === STATICINFO_CHANNEL)
          : null
        setStaticInfo(mapStaticInfoFromApi(match) ?? null)
      } catch (err) {
        console.error('Error fetching static info:', err)
        setError(err)
        setStaticInfo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStaticInfo()
  }, [])

  useEffect(() => {
    const fromApi =
      staticInfo && typeof staticInfo.favIcon === 'string'
        ? staticInfo.favIcon.trim()
        : ''
    const rawHref = fromApi || '/favicon.svg'
    const absoluteHref = new URL(rawHref, window.location.origin).toString()
    const hrefWithBust = `${absoluteHref}${absoluteHref.includes('?') ? '&' : '?'}v=${Date.now()}`

    // Replace all icon tags to avoid stale mobile/browser favicon cache.
    document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
      .forEach((el) => el.remove())

    const appendIconLink = (rel, sizes) => {
      const link = document.createElement('link')
      link.setAttribute('rel', rel)
      if (sizes) link.setAttribute('sizes', sizes)
      link.setAttribute('href', hrefWithBust)
      if (absoluteHref.toLowerCase().endsWith('.svg')) {
        link.setAttribute('type', 'image/svg+xml')
      }
      document.head.appendChild(link)
    }

    appendIconLink('icon')
    appendIconLink('shortcut icon')
    appendIconLink('apple-touch-icon', '180x180')
  }, [staticInfo])

  const value = {
    staticInfo,
    loading,
    error,
    refetch: async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/staticinfo')
        const list = response.data.data
        const match = Array.isArray(list)
          ? list.find((info) => info.channelId?.name === STATICINFO_CHANNEL)
          : null
        setStaticInfo(mapStaticInfoFromApi(match) ?? null)
      } catch (err) {
        console.error('Error refetching static info:', err)
        setError(err)
        setStaticInfo(null)
      } finally {
        setLoading(false)
      }
    },
  }

  return (
    <StaticInfoContext.Provider value={value}>
      {children}
    </StaticInfoContext.Provider>
  )
}

export const useStaticInfo = () => {
  const context = useContext(StaticInfoContext)
  if (!context) {
    throw new Error('useStaticInfo must be used within a StaticInfoProvider')
  }
  return context
}
