import { useState } from 'react'
import seriesImg from '../assets/ecosystem/bhimsen-thapa-series.jpg'
import { useLanguage } from '../context/LanguageContext'
import { landing, t } from '../i18n/copy'
import ImagePlaceholder from './ImagePlaceholder'

/** Bhimsen Thapa Series card — `src/assets/ecosystem/bhimsen-thapa-series.jpg` */
export default function SeriesEcoCardMedia() {
  const { lang } = useLanguage()
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <ImagePlaceholder variant="series" className="eco-card__media" />
  }

  return (
    <div className="eco-card__media eco-card__media--photo">
      <img
        className="eco-card__photo-img"
        src={seriesImg}
        alt={t(landing.cardSeriesImageAlt, lang)}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
