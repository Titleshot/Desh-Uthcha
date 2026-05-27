import ImagePlaceholder from './ImagePlaceholder'
import { useLanguage } from '../context/LanguageContext'
import { landing, t } from '../i18n/copy'

/** Home summary block linking to `Final Desh Uthcha Website` at `/final/`. */
export default function FinalWebsiteSummary() {
  const { lang } = useLanguage()

  return (
    <section id="desh-uthcha-website" className="section section--final-summary" aria-labelledby="final-summary-heading">
      <div className="section__inner final-summary">
        <div className="final-summary__visual">
          <ImagePlaceholder variant="final" className="final-summary__placeholder" />
        </div>
        <div className="final-summary__copy">
          <p className="final-summary__eyebrow" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.finalWebsiteEyebrow, lang)}
          </p>
          <h2 id="final-summary-heading" className="section__heading" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.finalWebsiteTitle, lang)}
          </h2>
          <p className="final-summary__lead" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.finalWebsiteSummary, lang)}
          </p>
          <ul className="final-summary__bullets" lang={lang === 'ne' ? 'ne' : 'en'}>
            <li>{t(landing.finalWebsiteBullet1, lang)}</li>
            <li>{t(landing.finalWebsiteBullet2, lang)}</li>
            <li>{t(landing.finalWebsiteBullet3, lang)}</li>
          </ul>
          <a href="/final/" className="btn btn--primary final-summary__cta" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.finalWebsiteCta, lang)}
          </a>
        </div>
      </div>
    </section>
  )
}
