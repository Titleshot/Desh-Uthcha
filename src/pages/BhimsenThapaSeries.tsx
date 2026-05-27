import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { bhimsenEpisodes, rowConfig, type BhimsenEpisodeResolved } from '../data/bhimsenSeriesEpisodes'
import { seriesMediaUrl } from '../series/seriesMedia'
import { useLanguage, type Lang } from '../context/LanguageContext'
import { t, ui } from '../i18n/copy'
import {
  seriesAboutBody,
  seriesAboutHeading,
  seriesAriaNav,
  seriesBrowse,
  seriesCopyright,
  seriesFooterMoreAria,
  seriesFooterMoreHeading,
  seriesCtaBackHome,
  seriesCtaExplore,
  seriesCtaStart,
  seriesCtaSub,
  seriesCtaTitle,
  seriesDisclaimerBody,
  seriesDisclaimerHeading,
  seriesDisclaimerTone,
  seriesEpisodeWord,
  seriesFinaleKind,
  seriesFooterTag,
  seriesHeroEyebrow,
  seriesHeroLead,
  seriesHeroSub,
  seriesHeroTitle,
  seriesLocalizedEpisodeSummary,
  seriesLocalizedEpisodeTitle,
  seriesLocalizedVolume,
  seriesModalClose,
  seriesModalNext,
  seriesModalNextAria,
  seriesModalPrev,
  seriesModalPrevAria,
  seriesNavMenu,
  seriesPlayEpisode1,
  seriesPlayEpisodeAria,
  seriesPlayVerb,
  seriesVolumeRowDesc,
  seriesVolumeRowTitle,
} from '../i18n/bhimsenSeriesCopy'
import { useVideoDurationSeconds } from '../hooks/useVideoDurationSeconds'
import { formatDurationSeconds } from '../utils/formatVideoDuration'
import { integerToDevanagari } from '../utils/formatNprSavings'
import './BhimsenThapaSeries.css'

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function episodeLabel(ep: BhimsenEpisodeResolved, lang: Lang): string {
  if (ep.volume === 'Series Finale') return t(seriesFinaleKind, lang)
  if (lang === 'ne') return `${t(seriesEpisodeWord, lang)} ${integerToDevanagari(ep.id)}`
  return `Episode ${ep.id}`
}

function EpisodeCard({
  episode,
  lang,
  onPlay,
}: {
  episode: BhimsenEpisodeResolved
  lang: Lang
  onPlay: (ep: BhimsenEpisodeResolved) => void
}) {
  const L = lang === 'ne' ? 'ne' : 'en'
  const title = seriesLocalizedEpisodeTitle(episode.id, episode.title, lang)
  const summary = seriesLocalizedEpisodeSummary(episode.id, episode.summary, lang)
  const vol = seriesLocalizedVolume(episode.volume, lang)
  const label = episodeLabel(episode, lang)
  const liveSeconds = useVideoDurationSeconds(episode.videoUrl)
  const durationLabel =
    liveSeconds != null ? formatDurationSeconds(liveSeconds, lang) : episode.duration || ''

  /** Thumb box matches each poster’s aspect ratio so text in the art isn’t cropped (contain, no forced 2:3). */
  const [thumbAspect, setThumbAspect] = useState('2 / 3')

  useEffect(() => {
    setThumbAspect('2 / 3')
  }, [episode.id, episode.thumbnailUrl])

  return (
    <article className="desh-series-card">
      <div className="desh-series-card__thumb" style={{ aspectRatio: thumbAspect }}>
        <img
          src={episode.thumbnailUrl}
          alt=""
          loading="lazy"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            if (w > 0 && h > 0) {
              setThumbAspect(`${w} / ${h}`)
            }
          }}
        />
        <button
          type="button"
          className="desh-series-card__play"
          onClick={() => onPlay(episode)}
          aria-label={`${t(seriesPlayEpisodeAria, lang)} ${label}: ${title}`}
        >
          <span className="desh-series-card__play-inner" lang={L}>
            <PlayIcon /> {t(seriesPlayVerb, lang)}
          </span>
        </button>
      </div>
      <div className="desh-series-card__body" lang={L}>
        <div className="desh-series-card__meta">
          <span>{label}</span>
          {durationLabel ? <span>{durationLabel}</span> : null}
        </div>
        <h4 className="desh-series-card__title">{title}</h4>
        <p className="desh-series-card__summary">{summary}</p>
        <span className="desh-series-card__volume">{vol}</span>
      </div>
    </article>
  )
}

function EpisodeModal({
  episode,
  lang,
  onClose,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}: {
  episode: BhimsenEpisodeResolved | null
  lang: Lang
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  const L = lang === 'ne' ? 'ne' : 'en'
  const [modalDurationSec, setModalDurationSec] = useState<number | null>(null)

  useEffect(() => {
    setModalDurationSec(null)
  }, [episode?.id])

  useEffect(() => {
    if (!episode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault()
        onPrev()
      }
      if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [episode, onClose, hasPrev, hasNext, onPrev, onNext])

  if (!episode) return null

  const title = seriesLocalizedEpisodeTitle(episode.id, episode.title, lang)
  const summary = seriesLocalizedEpisodeSummary(episode.id, episode.summary, lang)
  const vol = seriesLocalizedVolume(episode.volume, lang)
  const label = episodeLabel(episode, lang)
  const modalTimeLabel =
    modalDurationSec != null ? formatDurationSeconds(modalDurationSec, lang) : episode.duration || ''

  return (
    <div
      className="desh-series-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="desh-series-modal-title"
      onClick={onClose}
    >
      <div className="desh-series-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="desh-series-modal__close"
          onClick={onClose}
          aria-label={t(seriesModalClose, lang)}
        >
          ×
        </button>
        <div className="desh-series-modal__video-shell">
          <button
            type="button"
            className="desh-series-modal__side-nav desh-series-modal__side-nav--prev"
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label={t(seriesModalPrevAria, lang)}
          >
            <ChevronLeftIcon />
          </button>
          <div className="desh-series-modal__video">
            <video
              key={episode.id}
              controls
              autoPlay
              playsInline
              poster={episode.thumbnailUrl}
              src={episode.videoUrl}
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration
                if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY) {
                  setModalDurationSec((prev) => (prev == null ? d : Math.max(prev, d)))
                }
              }}
              onDurationChange={(e) => {
                const d = e.currentTarget.duration
                if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY) {
                  setModalDurationSec((prev) => (prev == null ? d : Math.max(prev, d)))
                }
              }}
            />
          </div>
          <button
            type="button"
            className="desh-series-modal__side-nav desh-series-modal__side-nav--next"
            onClick={onNext}
            disabled={!hasNext}
            aria-label={t(seriesModalNextAria, lang)}
          >
            <ChevronRightIcon />
          </button>
        </div>
        <div className="desh-series-modal__content" lang={L}>
          <div className="desh-series-modal__badges">
            <span className="desh-series-modal__badge desh-series-modal__badge--ep">{label}</span>
            <span className="desh-series-modal__badge desh-series-modal__badge--vol">{vol}</span>
            {modalTimeLabel ? <span className="desh-series-modal__time">{modalTimeLabel}</span> : null}
          </div>
          <h3 id="desh-series-modal-title">{title}</h3>
          <p className="desh-series-modal__summary">{summary}</p>
          <div className="desh-series-modal__nav">
            <button type="button" className="desh-series-modal__btn-prev" onClick={onPrev} disabled={!hasPrev}>
              {t(seriesModalPrev, lang)}
            </button>
            <button type="button" className="desh-series-modal__btn-next" onClick={onNext} disabled={!hasNext}>
              {t(seriesModalNext, lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BhimsenThapaSeries() {
  const { lang, setLang } = useLanguage()
  const L = lang === 'ne' ? 'ne' : 'en'
  const [activeEpisode, setActiveEpisode] = useState<BhimsenEpisodeResolved | null>(null)
  const [seriesNavOpen, setSeriesNavOpen] = useState(false)
  const [compactLangNav, setCompactLangNav] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 720px)').matches : false,
  )

  const sorted = useMemo(() => [...bhimsenEpisodes].sort((a, b) => a.id - b.id), [])
  const currentIndex = activeEpisode ? sorted.findIndex((e) => e.id === activeEpisode.id) : -1

  const goNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      setActiveEpisode(sorted[currentIndex + 1])
    }
  }, [currentIndex, sorted])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setActiveEpisode(sorted[currentIndex - 1])
  }, [currentIndex, sorted])

  const heroVideoSrc = seriesMediaUrl('cover video.mp4')

  const closeSeriesNav = useCallback(() => setSeriesNavOpen(false), [])

  useEffect(() => {
    if (!seriesNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSeriesNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seriesNavOpen])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const apply = () => setCompactLangNav(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const navLinkClass = 'desh-series__nav-link'

  return (
    <div className="desh-series">
      <header className="desh-series__header">
        <nav className="desh-series__nav" aria-label={t(seriesAriaNav, lang)}>
          <Link to="/" className="desh-series__brand" lang={L}>
            {t(ui.brandDisplay, lang)}
          </Link>
          <div className="desh-series__nav-lang">
            <LanguageSwitcher variant="inline" compact={compactLangNav} />
          </div>
          <div className="desh-series__nav-end">
            <button
              type="button"
              className="desh-series__menu-toggle"
              aria-expanded={seriesNavOpen}
              aria-controls="desh-series-nav-panel"
              aria-label={t(seriesNavMenu, lang)}
              onClick={() => setSeriesNavOpen((o) => !o)}
            >
              <MenuIcon />
              <span className="desh-series__menu-toggle-text" aria-hidden>
                {t(seriesNavMenu, lang)}
              </span>
            </button>
            <div
              id="desh-series-nav-panel"
              className={`desh-series__nav-links${seriesNavOpen ? ' desh-series__nav-links--open' : ''}`}
              lang={L}
            >
              <a className={navLinkClass} href="#series-episodes" onClick={closeSeriesNav}>
                {t(ui.series, lang)}
              </a>
              <a className={navLinkClass} href="#series-about" onClick={closeSeriesNav}>
                {t(ui.about, lang)}
              </a>
              <a className={navLinkClass} href="#series-disclaimer" onClick={closeSeriesNav}>
                {t(ui.disclaimer, lang)}
              </a>
              <Link className={navLinkClass} to="/" onClick={closeSeriesNav}>
                {t(ui.home, lang)}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <section id="series-home" className="desh-series__hero">
        <video
          className="desh-series__hero-video"
          autoPlay
          muted
          loop
          playsInline
          src={heroVideoSrc}
        />
        <div className="desh-series__hero-scrim" aria-hidden />
        <div className="desh-series__hero-inner">
          <div className="desh-series__hero-copy" lang={L}>
            <p className="desh-series__eyebrow">{t(seriesHeroEyebrow, lang)}</p>
            <h1>{t(seriesHeroTitle, lang)}</h1>
            <p className="desh-series__lead">{t(seriesHeroLead, lang)}</p>
            <p className="desh-series__sub">{t(seriesHeroSub, lang)}</p>
            <div className="desh-series__hero-actions">
              <button
                type="button"
                className="desh-series__btn desh-series__btn--red"
                onClick={() => setActiveEpisode(bhimsenEpisodes[0])}
              >
                <PlayIcon /> {t(seriesPlayEpisode1, lang)}
              </button>
              <a href="#series-episodes" className="desh-series__btn desh-series__btn--outline">
                {t(seriesBrowse, lang)}
              </a>
            </div>
            <p className="desh-series__hero-tone">{t(seriesDisclaimerTone, lang)}</p>
          </div>
        </div>
      </section>

      <main className="desh-series__main">
        <div id="series-episodes" className="desh-series__rows">
          {rowConfig.map((row) => (
            <section key={row.name} className="desh-series__row">
              <h2 lang={L}>{t(seriesVolumeRowTitle[row.name], lang)}</h2>
              {seriesVolumeRowDesc[row.name] ? (
                <p className="desh-series__row-desc" lang={L}>
                  {t(seriesVolumeRowDesc[row.name], lang)}
                </p>
              ) : null}
              <div className="desh-series__row-scroll">
                {bhimsenEpisodes.filter(row.filter).map((ep) => (
                  <EpisodeCard key={ep.id} episode={ep} lang={lang} onPlay={setActiveEpisode} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section id="series-about" className="desh-series__block" lang={L}>
          <h3>{t(seriesAboutHeading, lang)}</h3>
          <p>{t(seriesAboutBody, lang)}</p>
        </section>

        <section id="series-disclaimer" className="desh-series__block desh-series__block--disclaimer" lang={L}>
          <h3>{t(seriesDisclaimerHeading, lang)}</h3>
          <p className="desh-series__disclaimer-tone">{t(seriesDisclaimerTone, lang)}</p>
          <p>{t(seriesDisclaimerBody, lang)}</p>
        </section>

        <section className="desh-series__cta" lang={L}>
          <h3>{t(seriesCtaTitle, lang)}</h3>
          <p>{t(seriesCtaSub, lang)}</p>
          <div className="desh-series__hero-actions desh-series__hero-actions--center">
            <button
              type="button"
              className="desh-series__btn desh-series__btn--red"
              onClick={() => setActiveEpisode(bhimsenEpisodes[0])}
            >
              {t(seriesCtaStart, lang)}
            </button>
            <a href="#series-episodes" className="desh-series__btn desh-series__btn--outline">
              {t(seriesCtaExplore, lang)}
            </a>
          </div>
          <div className="desh-series__cta-back">
            <Link to="/" className="desh-series__btn desh-series__btn--outline">
              {t(seriesCtaBackHome, lang)}
            </Link>
          </div>
        </section>
      </main>

      <footer className="desh-series__footer">
        <div className="desh-series__footer-inner" lang={L}>
          <div className="desh-series__footer-row1">
            <div>
              <Link to="/" className="desh-series__footer-brand">
                {t(ui.brandDisplay, lang)}
              </Link>
              <p className="desh-series__footer-tag">{t(seriesFooterTag, lang)}</p>
            </div>
            <div className="desh-series__footer-links">
              <a href="#series-episodes">{t(ui.series, lang)}</a>
              <a href="#series-about">{t(ui.about, lang)}</a>
              <a href="#series-disclaimer">{t(ui.disclaimer, lang)}</a>
              <Link to="/">{t(ui.home, lang)}</Link>
            </div>
          </div>
          <nav
            className="desh-series__footer-extra"
            aria-label={t(seriesFooterMoreAria, lang)}
          >
            <p className="desh-series__footer-extra-label">{t(seriesFooterMoreHeading, lang)}</p>
            <div className="desh-series__footer-links">
              <Link to="/transparency" onClick={() => setLang('ne')}>
                {t(ui.transparency, lang)}
              </Link>
              <Link to="/tracker">{t(ui.tracker, lang)}</Link>
              <a href="/vision/">{t(ui.vision, lang)}</a>
            </div>
          </nav>
          <p className="desh-series__copyright">{t(seriesCopyright, lang)}</p>
        </div>
      </footer>

      <EpisodeModal
        episode={activeEpisode}
        lang={lang}
        onClose={() => setActiveEpisode(null)}
        onNext={goNext}
        onPrev={goPrev}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex >= 0 && currentIndex < sorted.length - 1}
      />
    </div>
  )
}
