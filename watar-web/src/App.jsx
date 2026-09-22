import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Header from './components/Layout/Header.jsx'
import Footer from './components/Layout/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'

export default function App() {
  return (
    <div className="watar-page flex min-h-svh w-full flex-col text-right font-sans text-white">
      <ScrollToTop />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PlaceholderPage title="تسجيل" />} />
          <Route path="/about-us" element={<PlaceholderPage title="عن وتر" />} />
          <Route path="/news" element={<PlaceholderPage title="أخبار" />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="top-left" rtl theme="colored" />
    </div>
  )
}
