import { useState } from 'react'
import nepalTransparencyImg from '../assets/ecosystem/nepal-transparency.png'
import { useLanguage } from '../context/LanguageContext'
import { landing, t } from '../i18n/copy'
import ImagePlaceholder from './ImagePlaceholder'

/** Nepal Transparency ecosystem card — `src/assets/ecosystem/nepal-transparency.png` */
export default function TransparencyEcoCardMedia() {
  const { lang } = useLanguage()
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <ImagePlaceholder variant="transparency" className="eco-card__media" />
  }

  return (
    <div className="eco-card__media eco-card__media--photo">
      <img
        className="eco-card__photo-img"
        src={nepalTransparencyImg}
        alt={t(landing.cardTransparencyImageAlt, lang)}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
