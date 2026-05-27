import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { landing, stubs, t, ui } from '../i18n/copy'

export type StubPage = keyof typeof stubs

type Props = {
  page: StubPage
}

export default function PlaceholderPage({ page }: Props) {
  const { lang } = useLanguage()
  const title = t(stubs[page].title, lang)

  return (
    <div className="stub">
      <header className="stub__header">
        <Link to="/" className="stub__back">
          {ui.stubBack[lang]}
        </Link>
      </header>
      <main className="stub__main">
        <p className="stub__label">{t(landing.brandEyebrow, lang)}</p>
        <h1 className="stub__title" lang={lang === 'ne' ? 'ne' : 'en'}>
          {title}
        </h1>
        <p className="stub__note" lang={lang === 'ne' ? 'ne' : 'en'}>
          {ui.stubNote[lang]}
        </p>
      </main>
    </div>
  )
}
