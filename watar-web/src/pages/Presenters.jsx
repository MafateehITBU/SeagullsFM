import broadcastersImage from '../assets/broadcasters.svg'

export default function Presenters() {
  return (
    <main className="w-full overflow-visible bg-transparent">
      <section dir="ltr" className="watar-broadcasters-hero watar-edge mb-16 py-6 lg:mb-24 lg:py-0">
        <div className="watar-broadcasters-art-wrap">
          <img
            src={broadcastersImage}
            alt="مذيعو وتر إف إم"
            className="watar-broadcasters-art"
          />
        </div>

        <div className="watar-broadcasters-copy mt-8 lg:mt-0">
          <div dir="rtl" className="relative text-right">
            <div className="watar-broadcasters-diamonds" aria-hidden="true">
              <span className="watar-broadcasters-diamond" />
              <span className="watar-broadcasters-diamond" />
            </div>
            <h1 className="text-[clamp(2.4rem,4.2vw,3.5rem)] font-extrabold leading-[1.15] text-[#FFC106]">
              مذيعو
              <br />
              وتر إف إم
            </h1>

            <p className="mt-8 text-[18px] font-medium leading-[1.4] text-white lg:mt-8 lg:text-[22px]">
              تعرّفوا على الأصوات التي ترافقكم كل يوم على وتر إف إم، وتقدّم لكم مزيجاً من الموسيقى العربية والقصص الملهمة والحوارات القريبة من حياتكم.
            </p>

            <p className="mt-6 text-[18px] font-bold leading-[1.4] text-white lg:mt-5 lg:text-[22px]">
              برامج على الهواء مباشرة، وفقرات يومية متنوعة.
            </p>
            <div className="mt-3 h-[3px] w-full bg-[#FFC106]" />

            <p className="mt-4 text-[18px] font-bold leading-[1.35] text-white lg:text-[22px]">
              مذيعون قريبون من المستمعين، يقدّمون لكم الموسيقى والأخبار والترفيه، ويتناقشون مواضيع تهمّكم.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
