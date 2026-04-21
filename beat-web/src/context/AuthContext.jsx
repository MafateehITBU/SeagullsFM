import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import Cookie from 'js-cookie'
import { toast } from 'react-toastify'
import axiosInstance from '../axiosConfig'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    name: null,
    email: null,
    phoneNumber: null,
    image: null,
    isActive: null,
  })
  const [loading, setLoading] = useState(true)
  const [userInteracted, setUserInteracted] = useState(false)

  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true)
      window.removeEventListener('click', handleInteraction)
    }
    window.addEventListener('click', handleInteraction)
    return () => window.removeEventListener('click', handleInteraction)
  }, [])

  const logout = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const isHttps = window.location.protocol === 'https:'
      const baseOpts = { path: '/' }
      if (isHttps) baseOpts.secure = true
      if (window.location.hostname.endsWith('mood.fm')) {
        Cookie.remove('token', { ...baseOpts, domain: '.mood.fm' })
        Cookie.remove('token', { ...baseOpts, domain: 'www.mood.fm' })
      }
      Cookie.remove('token', baseOpts)
    } else {
      Cookie.remove('token', { path: '/' })
    }
    try {
      await axiosInstance.post('/user/logout', {}, { withCredentials: true })
    } catch {
      // Ignore; server may be unreachable or cookie already cleared
    }
    setUser({
      id: null,
      name: null,
      email: null,
      phoneNumber: null,
      image: null,
      isActive: null,
    })
  }, [])

  const fetchUserData = useCallback(async () => {
    // Same token axios sends in Authorization — skip request when absent so
    // anonymous users never hit /user/me (avoids 401 noise in Network/console).
    if (!Cookie.get('token')) {
      setUser({
        id: null,
        name: null,
        email: null,
        phoneNumber: null,
        image: null,
        isActive: null,
      })
      return
    }

    try {
      const response = await axiosInstance.get('/user/me')
      const userData = response.data.data

      if (!userData.isActive) {
        await logout()
        toast.error('Your account is deactivated. Please contact support.')
        return
      }

      setUser({
        id: userData._id,
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        image: userData.image?.url || '',
        isActive: userData.isActive,
      })
    } catch (error) {
      const status = error?.response?.status
      // 401 = no session / invalid token — expected on first load, not a real error
      if (status !== 401) {
        console.error('Error fetching user data:', error)
      }
      setUser({
        id: null,
        name: null,
        email: null,
        phoneNumber: null,
        image: null,
        isActive: null,
      })
    }
  }, [logout])

  useEffect(() => {
    const initializeUser = async () => {
      try {
        await fetchUserData()
      } catch (error) {
        console.error('Error initializing user:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
  }, [userInteracted, fetchUserData])

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/user/login', {
        email,
        password,
      })

      const token = response.data.token

      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token received')
      }

      const cookieOpts = { path: '/', expires: 1 }
      if (
        typeof window !== 'undefined' &&
        window.location.hostname.endsWith('mood.fm')
      ) {
        cookieOpts.domain = '.mood.fm'
      }
      if (
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:'
      ) {
        cookieOpts.secure = true
      }
      Cookie.set('token', token, cookieOpts)

      await fetchUserData()

      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (name, email, password, phone, channelId) => {
    try {
      const response = await axiosInstance.post('/user/register', {
        name,
        email,
        password,
        phoneNumber: phone,
        channelId,
      })

      const token = response.data.token

      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token received')
      }

      const cookieOpts = { path: '/', expires: 1 }
      if (
        typeof window !== 'undefined' &&
        window.location.hostname.endsWith('mood.fm')
      ) {
        cookieOpts.domain = '.mood.fm'
      }
      Cookie.set('token', token, cookieOpts)

      await fetchUserData()

      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user?.id,
    updateUser: (newUserData) => {
      setUser((prev) => ({
        ...prev,
        ...newUserData,
      }))
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
