import { useLocation } from 'react-router-dom'

const TITLES = {
  '/programs': 'All Programs',
  '/events': 'Events',
  '/broadcaster': 'Broadcaster',
  '/get-discovered': 'Get Discovered',
  '/show-your-talent': 'Show Your Talent',
}

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'Page'

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-[#f8f8f8]">
      <h1 className="font-sans text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-[#f8f8f8]/70">Content coming soon.</p>
    </main>
  )
}
