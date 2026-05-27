import { useState } from 'react'
import visionImg from '../assets/ecosystem/desh-uthcha-vision.jpg'
import { useLanguage } from '../context/LanguageContext'
import { landing, t } from '../i18n/copy'
import ImagePlaceholder from './ImagePlaceholder'

/** Desh Uthcha Vision card — `src/assets/ecosystem/desh-uthcha-vision.jpg` */
export default function VisionEcoCardMedia() {
  const { lang } = useLanguage()
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <ImagePlaceholder variant="vision" className="eco-card__media" />
  }

  return (
    <div className="eco-card__media eco-card__media--photo">
      <img
        className="eco-card__photo-img"
        src={visionImg}
        alt={t(landing.cardVisionImageAlt, lang)}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
