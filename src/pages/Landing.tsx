import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { HeroBackdropImage } from '../components/LandingVideos'
import SeriesEcoCardMedia from '../components/SeriesEcoCardMedia'
import TrackerEcoCardMedia from '../components/TrackerEcoCardMedia'
import TransparencyEcoCardMedia from '../components/TransparencyEcoCardMedia'
import VisionEcoCardMedia from '../components/VisionEcoCardMedia'
import ImagePlaceholder from '../components/ImagePlaceholder'
import FinalWebsiteSummary from '../components/FinalWebsiteSummary'
import { WhyDeshUthchaImage } from '../components/WhyDeshUthchaImage'
import { useLanguage } from '../context/LanguageContext'
import { landing, t, ui } from '../i18n/copy'

function scrollToEcosystem(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToWhy(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Landing() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="landing">
      <header className="hero">
        <div className="hero__media">
          {/* Hero background: src/assets/hero/hero.png */}
          <HeroBackdropImage />
          <div className="hero__grain" aria-hidden />
          <div className="hero__scrim" />
          <div className="hero__scrim-spot" aria-hidden />
        </div>
        <div className="hero__content">
          <p className="eyebrow">{t(landing.brandEyebrow, lang)}</p>
          <h1 className="hero__headline" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.heroHeadline, lang)}
          </h1>
          <p className="hero__hook" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.heroHook, lang)}
          </p>
          <p className="hero__emotional" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.heroEmotional, lang)}
          </p>
          <div className="hero__actions">
            <a href="#why" className="btn btn--primary" onClick={scrollToWhy}>
              {t(landing.explorePlatform, lang)}
            </a>
          </div>
        </div>
        <a
          href="#why"
          className="scroll-cue"
          aria-label={lang === 'en' ? ui.scrollNext.en : ui.scrollNext.ne}
        >
          <span className="scroll-cue__line" />
        </a>
      </header>

      <section className="section section--hero-deferred" aria-label={t(landing.heroDeferredAria, lang)}>
        <div className="section__inner hero-deferred" lang={lang === 'ne' ? 'ne' : 'en'}>
          <p className="hero-deferred__support">{t(landing.heroSupport, lang)}</p>
          <p className="hero-deferred__sub">{t(landing.heroSub, lang)}</p>
        </div>
      </section>

      <section id="why" className="section section--why">
        <div className="section__inner why">
          <div className="why__visual">
            <WhyDeshUthchaImage alt={t(landing.whySectionImageAlt, lang)} />
          </div>
          <div className="why__copy">
            <h2 className="section__heading" lang={lang === 'ne' ? 'ne' : 'en'}>
              {t(landing.whyHeading, lang)}
            </h2>
            <ul className="why-punch" lang={lang === 'ne' ? 'ne' : 'en'}>
              <li>{t(landing.whyPunch1, lang)}</li>
              <li>{t(landing.whyPunch2, lang)}</li>
              <li>{t(landing.whyPunch3, lang)}</li>
              <li>{t(landing.whyPunch4, lang)}</li>
            </ul>
            <p className="prose prose--strong why-punch__close" lang={lang === 'ne' ? 'ne' : 'en'}>
              {t(landing.whyPunchClose, lang)}
            </p>
          </div>
        </div>
      </section>

      <FinalWebsiteSummary />

      <section id="ecosystem" className="section section--ecosystem">
        <div className="section__inner">
          <h2 className="section__heading section__heading--center" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.ecosystemHeading, lang)}
          </h2>
          <ul className="ecosystem-grid">
            <li>
              <a href="/commitments/" className="eco-card">
                <TrackerEcoCardMedia />
                <div className="eco-card__body">
                  <h3 className="eco-card__title" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardTrackerTitle, lang)}
                  </h3>
                  <p className="eco-card__text" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardTrackerText, lang)}
                  </p>
                  <span className="eco-card__cta" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardTrackerCta, lang)}
                  </span>
                </div>
              </a>
            </li>
            <li>
              <Link to="/transparency" className="eco-card" onClick={() => setLang('ne')}>
                <TransparencyEcoCardMedia />
                <div className="eco-card__body">
                  <h3 className="eco-card__title" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardTransparencyTitle, lang)}
                  </h3>
                  <p className="eco-card__text" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardTransparencyText, lang)}
                  </p>
                  <span className="eco-card__cta" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardTransparencyCta, lang)}
                  </span>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/series" className="eco-card">
                <SeriesEcoCardMedia />
                <div className="eco-card__body">
                  <h3 className="eco-card__title" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardSeriesTitle, lang)}
                  </h3>
                  <p className="eco-card__text" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardSeriesText, lang)}
                  </p>
                  <span className="eco-card__cta" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardSeriesCta, lang)}
                  </span>
                </div>
              </Link>
            </li>
            <li>
              <a href="/vision/" className="eco-card">
                <VisionEcoCardMedia />
                <div className="eco-card__body">
                  <h3 className="eco-card__title" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardVisionTitle, lang)}
                  </h3>
                  <p className="eco-card__text" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardVisionText, lang)}
                  </p>
                  <span className="eco-card__cta" lang={lang === 'ne' ? 'ne' : 'en'}>
                    {t(landing.cardVisionCta, lang)}
                  </span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section id="experience" className="section section--experience">
        <div className="section__inner experience">
          <div className="experience__copy">
            <h2 className="section__heading" lang={lang === 'ne' ? 'ne' : 'en'}>
              {t(landing.experienceHeading, lang)}
            </h2>
            <ul className="experience-list" lang={lang === 'ne' ? 'ne' : 'en'}>
              <li>{t(landing.experience1, lang)}</li>
              <li>{t(landing.experience2, lang)}</li>
              <li>{t(landing.experience3, lang)}</li>
              <li>{t(landing.experience4, lang)}</li>
            </ul>
          </div>
        </div>
      </section>

      {/*
        CTA background prompt: Golden sunrise over Himalaya with light emerging from darkness, cinematic, minimal, soft gold light, dark tones, no text
      */}
      <section className="section section--cta">
        <div className="cta__media">
          <ImagePlaceholder variant="cta" className="cta__placeholder" />
          <div className="cta__scrim" />
        </div>
        <div className="section__inner cta__content">
          <p className="cta__lines" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.ctaLine1, lang)}
            <br />
            {t(landing.ctaLine2, lang)}
            <br />
            {t(landing.ctaLine3, lang)}
          </p>
          <div className="cta__actions">
            <a href="#ecosystem" className="btn btn--primary" onClick={scrollToEcosystem}>
              {t(landing.explorePlatform, lang)}
            </a>
          </div>
          <p className="cta__trust" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.ctaTrust, lang)}
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="section__inner footer__inner">
          <p className="footer__blurb" lang={lang === 'ne' ? 'ne' : 'en'}>
            {t(landing.footerBlurb, lang)}
          </p>
          <nav className="footer__nav" aria-label={t(landing.footerNavLabel, lang)}>
            <Link to="/">{ui.home[lang]}</Link>
            <Link to="/transparency" onClick={() => setLang('ne')}>
              {ui.transparency[lang]}
            </Link>
            <a href="/commitments/">{ui.tracker[lang]}</a>
            <Link to="/series">{ui.series[lang]}</Link>
            <a href="/vision/">{ui.vision[lang]}</a>
            <a href="/final/">{ui.fullWebsite[lang]}</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
