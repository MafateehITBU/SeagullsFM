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
      <main
        style={{
          minHeight: '62vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4.5rem 1.5rem 5rem',
          backgroundColor: 'var(--background-color)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(4.5rem, 12vw, 7rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: 'var(--navbar-footer-color)',
          }}
        >
          404
        </p>
        <p
          style={{
            margin: '1.25rem 0 0',
            maxWidth: '28rem',
            fontFamily: 'Fractul, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 700,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
          }}
        >
          This page doesn’t exist
        </p>
        <p
          style={{
            margin: '0.75rem 0 0',
            maxWidth: '26rem',
            fontFamily: 'Fractul, sans-serif',
            fontSize: '1.05rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
          }}
        >
          You will be redirected to the homepage in 5 seconds.
        </p>
        <Link
          to="/"
          className="news-hero-btn"
          style={{
            marginTop: '1.75rem',
            backgroundColor: 'var(--navbar-footer-color)',
            color: 'var(--navbar-text)',
            textDecoration: 'none',
          }}
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  )
}
