import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Header from './components/Layout/Header.jsx'
import Footer from './components/Layout/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import NotFound from './pages/NotFound.jsx'
import NewsDetails from './pages/NewsDetails.jsx'
import News from './pages/News.jsx'
import Presenters from './pages/Presenters.jsx'
import Programs from './pages/Programs.jsx'
import About from './pages/About.jsx'

/** Old site URLs used /ar and /en. Watar is Arabic-only, so those paths go home. */
const LEGACY_LOCALE = /(^|\/)(ar|en)(\/|$)/i

function LegacyLocaleRedirect() {
  const { pathname } = useLocation()
  if (!LEGACY_LOCALE.test(pathname)) return null
  return <Navigate to="/" replace />
}

export default function App() {
  const { pathname } = useLocation()
  const newsList = pathname === '/news'
  const newsDetails = pathname.startsWith('/news/')
  const broadcasters = pathname === '/presenters'
  const programs = pathname === '/programs'
  const about = pathname === '/about-us'
  const pageTone = newsDetails
    ? ' watar-news-details'
    : newsList
      ? ' watar-news-page'
      : broadcasters
        ? ' watar-broadcasters-page'
        : programs
          ? ' watar-programs-page'
          : about
            ? ' watar-about-page'
            : ''

  return (
    <div
      className={`watar-page flex min-h-svh w-full flex-col text-right font-sans text-white${pageTone}`}
    >
      <ScrollToTop />
      <LegacyLocaleRedirect />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<ComingSoon />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetails />} />
          <Route path="/events" element={<ComingSoon />} />
          <Route path="/presenters" element={<Presenters />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/privacy-policy" element={<ComingSoon />} />
          <Route path="/get-discovered" element={<ComingSoon />} />
          <Route path="/show-your-talent" element={<ComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="top-left" rtl theme="colored" />
    </div>
  )
}
