import { useLanguage } from './LanguageContext'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === 'en' ? 'active' : ''}
        aria-label="Language: English"
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === 'th' ? 'active' : ''}
        aria-label="ภาษา: ไทย"
        aria-pressed={lang === 'th'}
        onClick={() => setLang('th')}
      >
        TH
      </button>
    </div>
  )
}
