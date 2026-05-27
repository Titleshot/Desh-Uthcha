import { useState } from 'react'
import trackerImg from '../assets/ecosystem/public-commitments-tracker.jpg'
import { useLanguage } from '../context/LanguageContext'
import { landing, t } from '../i18n/copy'
import ImagePlaceholder from './ImagePlaceholder'

/** Public Commitments Tracker card — `src/assets/ecosystem/public-commitments-tracker.jpg` */
export default function TrackerEcoCardMedia() {
  const { lang } = useLanguage()
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <ImagePlaceholder variant="tracker" className="eco-card__media" />
  }

  return (
    <div className="eco-card__media eco-card__media--photo">
      <img
        className="eco-card__photo-img"
        src={trackerImg}
        alt={t(landing.cardTrackerImageAlt, lang)}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
