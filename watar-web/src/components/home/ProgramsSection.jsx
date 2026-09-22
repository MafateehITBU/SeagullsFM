import { useEffect, useState } from 'react'
import axiosInstance from '../../axiosConfig'
import ProgramShowcase from './ProgramShowcase.jsx'

const CHANNEL =
  import.meta.env.VITE_STATICINFO_CHANNEL?.trim() || 'WatarFM'

export default function ProgramsSection() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchPrograms = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/program')
        const list = Array.isArray(response.data?.data) ? response.data.data : []
        const filtered = list.filter(
          (program) =>
            program?.isActive !== false &&
            program?.channelId?.name === CHANNEL,
        )
        if (!cancelled) setPrograms(filtered)
      } catch (err) {
        console.error('Failed to load programs:', err)
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPrograms()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      id="programs"
      className="mx-auto w-full max-w-[1400px] scroll-mt-28 px-5 pb-6 pt-6 md:px-10 md:pt-8 lg:px-14"
      aria-labelledby="programs-heading"
    >
      {loading ? (
        <p className="py-16 text-center text-lg font-medium text-white/80">
          جارٍ تحميل البرامج…
        </p>
      ) : null}

      {error ? (
        <p className="py-16 text-center text-lg font-medium text-white" role="alert">
          تعذّر تحميل البرامج. حاول تحديث الصفحة.
        </p>
      ) : null}

      {!loading && !error && programs.length === 0 ? (
        <p className="py-16 text-center text-lg font-medium text-white/85">
          لا توجد برامج متاحة حالياً.
        </p>
      ) : null}

      {!loading && !error && programs.length > 0 ? (
        <div className="flex flex-col">
          {programs.map((program, index) => (
            <ProgramShowcase
              key={program?._id ?? `${program?.title}-${index}`}
              program={program}
              index={index}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
