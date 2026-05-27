import { useLanguage } from '../context/LanguageContext'
import { ui } from '../i18n/copy'

type LanguageSwitcherProps = {
  /** `inline` sits in a navbar row; `fixed` stays top-right (default). */
  variant?: 'fixed' | 'inline'
  /** Short labels (EN / नेप) for tight one-row navs — full names in `aria-label`. */
  compact?: boolean
}

/** Labels stay English / नेपाली so both options are always recognizable. */
export default function LanguageSwitcher({ variant = 'fixed', compact = false }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage()
  const cls = [
    variant === 'inline' ? 'lang-switch lang-switch--inline' : 'lang-switch',
    compact ? 'lang-switch--compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cls}
      role="group"
      aria-label={lang === 'en' ? ui.languageGroup.en : ui.languageGroup.ne}
    >
      <button
        type="button"
        className={`lang-switch__btn${lang === 'en' ? ' lang-switch__btn--active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        aria-label={ui.english[lang]}
      >
        {compact ? 'EN' : 'English'}
      </button>
      <button
        type="button"
        className={`lang-switch__btn${lang === 'ne' ? ' lang-switch__btn--active' : ''}`}
        onClick={() => setLang('ne')}
        aria-pressed={lang === 'ne'}
        lang="ne"
        aria-label={ui.nepali[lang]}
      >
        {compact ? 'नेप' : 'नेपाली'}
      </button>
    </div>
  )
}
