import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import {
  categoryImpactLine,
  impactHeadingForPercent,
  transparencyExperience,
  tx,
  type ImpactCategory,
} from '../i18n/transparencyExperienceCopy'
import { formatSavingsNpr, integerToDevanagari, savingsForPercent } from '../utils/formatNprSavings'

function useAnimatedNumber(target: number, enabled: boolean) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      fromRef.current = target
      return
    }
    const from = fromRef.current
    fromRef.current = target
    const duration = 650
    const t0 = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - (1 - p) ** 3
      setValue(from + (target - from) * eased)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, enabled])

  return value
}

export default function TransparencyImpactSection() {
  const { lang } = useLanguage()
  const [percent, setPercent] = useState(10)
  const [category, setCategory] = useState<ImpactCategory>('health')
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const targetSavings = savingsForPercent(percent)
  const animated = useAnimatedNumber(targetSavings, !reduceMotion)
  const displayAmount = reduceMotion ? targetSavings : animated

  const impactText = categoryImpactLine(lang, category, percent)
  const percentLabel =
    lang === 'ne' ? `${integerToDevanagari(percent)}%` : `${percent}%`

  return (
    <section
      className="transparency-impact section"
      aria-labelledby="transparency-impact-heading"
    >
      <div className="transparency-impact__glow" aria-hidden />
      <div className="section__inner transparency-impact__inner">
        <h2
          id="transparency-impact-heading"
          className="section__heading section__heading--center transparency-impact__title"
          lang={lang === 'ne' ? 'ne' : 'en'}
        >
          {impactHeadingForPercent(lang, percent)}
        </h2>
        <p className="transparency-impact__sub" lang={lang === 'ne' ? 'ne' : 'en'}>
          {tx(transparencyExperience.impactSub, lang)}
        </p>

        <div className="transparency-impact__panel">
          <div className="transparency-impact__slider-row">
            <label className="transparency-impact__slider-label" htmlFor="leakage-slider">
              <span lang={lang === 'ne' ? 'ne' : 'en'}>
                {tx(transparencyExperience.impactPercentLabel, lang)}
              </span>
              <span className="transparency-impact__percent" aria-live="polite">
                {percentLabel}
              </span>
            </label>
          </div>

          <input
            id="leakage-slider"
            type="range"
            className="transparency-impact__range"
            min={1}
            max={20}
            step={1}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            aria-valuemin={1}
            aria-valuemax={20}
            aria-valuenow={percent}
            aria-valuetext={percentLabel}
          />

          <div className="transparency-impact__money" aria-live="polite">
            <span className="transparency-impact__money-label" lang={lang === 'ne' ? 'ne' : 'en'}>
              {tx(transparencyExperience.impactSavingsLabel, lang)}:
            </span>
            <span className="transparency-impact__money-value">
              {formatSavingsNpr(displayAmount, lang)}
            </span>
          </div>

          <p className="transparency-impact__hint" lang={lang === 'ne' ? 'ne' : 'en'}>
            {tx(transparencyExperience.impactHint, lang)}
          </p>

          <div className="transparency-impact__categories">
            {(
              [
                ['health', transparencyExperience.impactCategoryHealth],
                ['infra', transparencyExperience.impactCategoryInfra],
                ['startup', transparencyExperience.impactCategoryStartup],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`transparency-impact__chip${category === key ? ' transparency-impact__chip--active' : ''}`}
                onClick={() => setCategory(key)}
                lang={lang === 'ne' ? 'ne' : 'en'}
              >
                {tx(label, lang)}
              </button>
            ))}
          </div>

          <p
            className="transparency-impact__category-line"
            key={`${category}-${percent}-${lang}`}
            lang={lang === 'ne' ? 'ne' : 'en'}
          >
            {impactText}
          </p>

          <p className="transparency-impact__could" lang={lang === 'ne' ? 'ne' : 'en'}>
            {tx(transparencyExperience.impactCouldEnable, lang)}
          </p>
          <ul className="transparency-impact__bullets">
            {transparencyExperience.impactBullets[lang].map((line) => (
              <li key={line} lang={lang === 'ne' ? 'ne' : 'en'}>
                {line}
              </li>
            ))}
          </ul>

          <p className="transparency-impact__power" lang={lang === 'ne' ? 'ne' : 'en'}>
            {tx(transparencyExperience.impactPower, lang)}
          </p>
        </div>
      </div>
    </section>
  )
}
