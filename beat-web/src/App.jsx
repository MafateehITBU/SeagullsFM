import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Footer from './components/Layout/Footer.jsx'
import Header from './components/Layout/Header.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import RouteLoader from './components/RouteLoader.jsx'
import Home from './pages/Home.jsx'
import AboutUs from './pages/AboutUs.jsx'
import Presenters from './pages/Presenters.jsx'
import News from './pages/News.jsx'
import NewsDetails from './pages/NewsDetails.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

export default function App() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-[#0c0c0c] text-left font-sans text-[#f8f8f8]">
      <ScrollToTop />
      <RouteLoader />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/news" element={<News />} />
          <Route path="/news-details" element={<NewsDetails />} />
          <Route path="/presenters" element={<Presenters />} />
          <Route path="/login" element={<ComingSoon />} />
          <Route path="/programs" element={<ComingSoon />} />
          <Route path="/events" element={<ComingSoon />} />
          <Route path="/broadcaster" element={<ComingSoon />} />
          <Route path="/get-discovered" element={<ComingSoon />} />
          <Route path="/show-your-talent" element={<ComingSoon />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  )
}
