import HeroBanner from '../components/home/HeroBanner.jsx'
import LiveStreamButton from '../components/home/LiveStreamButton.jsx'
import ProgramsSection from '../components/home/ProgramsSection.jsx'
import DownloadAppSection from '../components/home/DownloadAppSection.jsx'

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden">
      <HeroBanner />
      <LiveStreamButton />
      <ProgramsSection />
      <DownloadAppSection />
    </main>
  )
}
