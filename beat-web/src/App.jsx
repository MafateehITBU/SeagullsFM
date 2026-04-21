import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Footer from './components/Layout/Footer.jsx'
import Header from './components/Layout/Header.jsx'
import Home from './pages/Home.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

export default function App() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-[#0c0c0c] text-left font-sans text-[#f8f8f8]">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<ComingSoon />} />
          <Route path="/news" element={<ComingSoon />} />
          <Route path="/presenters" element={<ComingSoon />} />
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
