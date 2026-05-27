import type { MouseEvent } from 'react'
import { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import TransparencyImpactSection from '../components/TransparencyImpactSection'
import { useLanguage } from '../context/LanguageContext'
import { landing, t, ui } from '../i18n/copy'
import { transparencyExperience, tx } from '../i18n/transparencyExperienceCopy'

function scrollToNext(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  document.getElementById('transparency-problem')?.scrollIntoView({ behavior: 'smooth' })
}

export default function TransparencyExperience() {
  const { lang, setLang } = useLanguage()

  /* Nepal Transparency opens in Nepali by default (visitors can still switch with the language control). */
  useLayoutEffect(() => {
    setLang('ne')
  }, [setLang])

  const L = lang === 'ne' ? 'ne' : 'en'

  return (
    <div className="transparency-page">
      <header className="transparency-hero">
        <div className="transparency-hero__media" aria-hidden>
          <div className="transparency-hero__gradient" />
          <div className="transparency-hero__lines" />
          <div className="hero__grain" />
        </div>
        <div className="transparency-hero__content">
          <Link to="/" className="transparency-hero__back" lang={L}>
            {ui.stubBack[lang]}
          </Link>
          <p className="eyebrow transparency-hero__eyebrow" lang={L}>
            {tx(transparencyExperience.pageEyebrow, lang)}
          </p>
          <h1 className="hero__headline transparency-hero__headline" lang={L}>
            {tx(transparencyExperience.heroMain, lang)}
          </h1>
          <p className="hero__support" lang={L}>
            {tx(transparencyExperience.heroSub, lang)}
          </p>
          <p className="prose prose--strong transparency-hero__hook" lang={L}>
            {tx(transparencyExperience.heroHook, lang)}
          </p>
          <p className="hero__sub transparency-hero__insight" lang={L}>
            {tx(transparencyExperience.heroInsight, lang)}
          </p>
          <p className="transparency-hero__cred" lang={L}>
            {tx(transparencyExperience.heroCredibility, lang)}
          </p>
          <a
            href="#transparency-problem"
            className="transparency-hero__scroll"
            aria-label={lang === 'en' ? ui.scrollNext.en : ui.scrollNext.ne}
            onClick={scrollToNext}
          >
            <span className="transparency-hero__scroll-text" lang={L}>
              {tx(transparencyExperience.heroScroll, lang)}
            </span>
            <span className="transparency-hero__scroll-line" aria-hidden />
          </a>
        </div>
      </header>

      <section
        id="transparency-problem"
        className="section transparency-section transparency-section--problem"
      >
        <div className="section__inner">
          <h2 className="section__heading section__heading--center" lang={L}>
            {tx(transparencyExperience.problemHeading, lang)}
          </h2>
          <div className="transparency-cards">
            <article className="transparency-card">
              <span className="transparency-card__icon" aria-hidden>
                🏗️
              </span>
              <h3 className="transparency-card__title" lang={L}>
                {tx(transparencyExperience.infraTitle, lang)}
              </h3>
              <p className="transparency-card__text" lang={L}>
                {tx(transparencyExperience.infraP1, lang)}
              </p>
              <p className="transparency-card__text" lang={L}>
                {tx(transparencyExperience.infraP2, lang)}
              </p>
              <p className="transparency-card__impact" lang={L}>
                {tx(transparencyExperience.infraImpact, lang)}
              </p>
            </article>
            <article className="transparency-card">
              <span className="transparency-card__icon" aria-hidden>
                🌾
              </span>
              <h3 className="transparency-card__title" lang={L}>
                {tx(transparencyExperience.marketTitle, lang)}
              </h3>
              <p className="transparency-card__text" lang={L}>
                {tx(transparencyExperience.marketP1, lang)}
              </p>
              <p className="transparency-card__text" lang={L}>
                {tx(transparencyExperience.marketP2, lang)}
              </p>
              <p className="transparency-card__impact" lang={L}>
                {tx(transparencyExperience.marketImpact, lang)}
              </p>
            </article>
            <article className="transparency-card">
              <span className="transparency-card__icon" aria-hidden>
                💰
              </span>
              <h3 className="transparency-card__title" lang={L}>
                {tx(transparencyExperience.debtTitle, lang)}
              </h3>
              <p className="transparency-card__text" lang={L}>
                {tx(transparencyExperience.debtP1, lang)}
              </p>
              <p className="transparency-card__impact" lang={L}>
                {tx(transparencyExperience.debtImpact, lang)}
              </p>
            </article>
          </div>
          <p className="transparency-section__insight" lang={L}>
            {tx(transparencyExperience.problemInsight, lang)}
          </p>
        </div>
      </section>

      <section className="section transparency-section transparency-section--why">
        <div className="section__inner">
          <h2 className="section__heading section__heading--center" lang={L}>
            {tx(transparencyExperience.whyHeading, lang)}
          </h2>
          <p className="transparency-prose transparency-prose--center" lang={L}>
            {tx(transparencyExperience.whyFraming, lang)}
          </p>
          <p className="transparency-pullquote" lang={L}>
            {tx(transparencyExperience.whyMain, lang)}
          </p>
          <ul className="transparency-causes">
            <li>
              <h3 lang={L}>{tx(transparencyExperience.cause1Title, lang)}</h3>
              <p lang={L}>{tx(transparencyExperience.cause1Body, lang)}</p>
            </li>
            <li>
              <h3 lang={L}>{tx(transparencyExperience.cause2Title, lang)}</h3>
              <p lang={L}>{tx(transparencyExperience.cause2Body, lang)}</p>
            </li>
            <li>
              <h3 lang={L}>{tx(transparencyExperience.cause3Title, lang)}</h3>
              <p lang={L}>{tx(transparencyExperience.cause3Body, lang)}</p>
            </li>
          </ul>
          <p className="transparency-powerline" lang={L}>
            {tx(transparencyExperience.whyPower, lang)}
          </p>
        </div>
      </section>

      <section className="section transparency-section transparency-section--solution">
        <div className="section__inner">
          <h2 className="section__heading section__heading--center" lang={L}>
            {tx(transparencyExperience.solutionHeading, lang)}
          </h2>
          <p className="transparency-prose transparency-prose--center" lang={L}>
            {tx(transparencyExperience.solutionConcept, lang)}
          </p>
          <div className="transparency-compare">
            <div className="transparency-compare__col transparency-compare__col--old">
              <h3 lang={L}>{tx(transparencyExperience.oldSystemLabel, lang)}</h3>
              <ul>
                {transparencyExperience.oldSystemItems[lang].map((item) => (
                  <li key={item} lang={L}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="transparency-compare__col transparency-compare__col--new">
              <h3 lang={L}>{tx(transparencyExperience.newSystemLabel, lang)}</h3>
              <ul>
                {transparencyExperience.newSystemItems[lang].map((item) => (
                  <li key={item} lang={L}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ul className="transparency-corelines">
            {transparencyExperience.coreLines[lang].map((line) => (
              <li key={line} lang={L}>
                {line}
              </li>
            ))}
          </ul>
          <blockquote className="transparency-global" lang={L}>
            {tx(transparencyExperience.globalCredibility, lang)}
          </blockquote>
          <p className="transparency-trust" lang={L}>
            {tx(transparencyExperience.trustLine, lang)}
          </p>
        </div>
      </section>

      <section className="section transparency-section transparency-section--digital">
        <div className="section__inner">
          <h2 className="section__heading section__heading--center" lang={L}>
            {tx(transparencyExperience.digitalHeading, lang)}
          </h2>
          <p className="transparency-pullquote transparency-pullquote--soft" lang={L}>
            {tx(transparencyExperience.digitalConcept, lang)}
          </p>
          <ul className="transparency-examples">
            {transparencyExperience.digitalExamples[lang].map((item) => (
              <li key={item} lang={L}>
                {item}
              </li>
            ))}
          </ul>
          <p className="transparency-examples__footnote" lang={L}>
            {tx(transparencyExperience.digitalExamplesFootnote, lang)}
          </p>
          <p className="transparency-prose transparency-prose--center" lang={L}>
            {tx(transparencyExperience.digitalCore, lang)}
          </p>
          <p className="transparency-powerline transparency-powerline--dim" lang={L}>
            {tx(transparencyExperience.digitalInsight, lang)}
          </p>
        </div>
      </section>

      <TransparencyImpactSection />

      <section className="section transparency-section transparency-section--next">
        <div className="section__inner">
          <h2 className="section__heading section__heading--center" lang={L}>
            {tx(transparencyExperience.nextHeading, lang)}
          </h2>
          <nav className="transparency-next" aria-label={t(landing.footerNavLabel, lang)}>
            <Link to="/tracker" className="transparency-next__link" lang={L}>
              {tx(transparencyExperience.nextTracker, lang)}
            </Link>
            <Link to="/series" className="transparency-next__link" lang={L}>
              {tx(transparencyExperience.nextSeries, lang)}
            </Link>
            <a href="/vision/" className="transparency-next__link" lang={L}>
              {tx(transparencyExperience.nextVision, lang)}
            </a>
          </nav>
          <p className="transparency-page__bottom-home">
            <Link to="/" className="transparency-hero__back" lang={L}>
              {ui.stubBack[lang]}
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
