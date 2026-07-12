import bColor from '../assets/imgs/home/b-color.png'

function getProgramImageOverlayClass(title) {
  if (/diana/i.test(title ?? '')) {
    return 'absolute bottom-[6%] left-[6%] h-[88%] w-[88%] object-contain object-bottom'
  }

  return 'absolute inset-x-0 bottom-0 h-full w-full object-contain object-bottom'
}

export default function ProgramArtwork({
  imageUrl,
  title,
  wrapperClassName = '',
  maxWidthClass = 'w-full max-w-[860px] lg:max-w-[1040px]',
}) {
  return (
    <div className={`relative mx-auto ${maxWidthClass} ${wrapperClassName}`.trim()}>
      <img
        src={bColor}
        alt=""
        className="h-auto w-full object-contain"
        aria-hidden="true"
      />
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title || 'Program artwork'}
          className={getProgramImageOverlayClass(title)}
          loading="lazy"
        />
      ) : null}
    </div>
  )
}
