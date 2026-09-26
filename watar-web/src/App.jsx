import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Header from './components/Layout/Header.jsx'
import Footer from './components/Layout/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

export default function App() {
  return (
    <div className="watar-page flex min-h-svh w-full flex-col text-right font-sans text-white">
      <ScrollToTop />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<ComingSoon />} />
          <Route path="/about-us" element={<ComingSoon />} />
          <Route path="/news" element={<ComingSoon />} />
          <Route path="/events" element={<ComingSoon />} />
          <Route path="/presenters" element={<ComingSoon />} />
          <Route path="/privacy-policy" element={<ComingSoon />} />
          <Route path="/get-discovered" element={<ComingSoon />} />
          <Route path="/show-your-talent" element={<ComingSoon />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="top-left" rtl theme="colored" />
    </div>
  )
}
