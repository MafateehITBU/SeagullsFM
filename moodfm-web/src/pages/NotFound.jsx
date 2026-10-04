import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/', { replace: true })
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <>
      <Header />
      <section className="about-hero-section privacy-hero-section">
        <div className="about-hero-container privacy-hero-container">
          <h1 className="about-hero-title mb-3">404</h1>
        </div>
      </section>
      <section
        className="who-we-are-section flex-column-start privacy-content-section"
        style={{ height: 'auto', minHeight: '50vh', paddingBottom: '4rem', textAlign: 'center' }}
      >
        <p className="who-we-are-title" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
          This page doesn’t exist
        </p>
        <p className="who-we-are-description" style={{ marginBottom: '2rem' }}>
          You will be redirected to the homepage in 5 seconds.
        </p>
        <Link
          to="/"
          className="news-hero-btn"
          style={{
            backgroundColor: 'var(--navbar-footer-color)',
            color: 'var(--navbar-text)',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Back to home
        </Link>
      </section>
      <Footer />
    </>
  )
}
