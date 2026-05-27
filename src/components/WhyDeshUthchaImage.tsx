import { useState } from 'react'
import kinaDeshUthchaImg from '../assets/why/kina-desh-uthcha.png'
import ImagePlaceholder from './ImagePlaceholder'

type Props = {
  alt: string
}

/** “किन Desh Uthcha?” column visual — `src/assets/why/kina-desh-uthcha.png` */
export function WhyDeshUthchaImage({ alt }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="why__media-wrap">
        <ImagePlaceholder variant="fragmented" className="why__placeholder why__placeholder--solo" />
      </div>
    )
  }

  return (
    <div className="why__media-wrap">
      <img
        className="why__image"
        src={kinaDeshUthchaImg}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
