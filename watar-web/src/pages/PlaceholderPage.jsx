export default function PlaceholderPage({ title }) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-[1400px] flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="font-mix text-4xl font-bold text-white md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-white/80">هذه الصفحة قيد التجهيز.</p>
    </main>
  )
}
