import type { Lang } from '../context/LanguageContext'
import { integerToDevanagari } from './formatNprSavings'

/** Human-readable length from seconds (matches video metadata), e.g. `12m 14s` / `1h 2m 3s`. */
export function formatDurationSeconds(totalSeconds: number, lang: Lang): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return ''

  const rounded = Math.floor(totalSeconds)
  const sec = rounded % 60
  const min = Math.floor(rounded / 60) % 60
  const hr = Math.floor(rounded / 3600)

  if (lang === 'ne') {
    if (hr > 0) {
      return `${integerToDevanagari(hr)}h ${integerToDevanagari(min)}m ${integerToDevanagari(sec)}s`
    }
    return `${integerToDevanagari(Math.floor(rounded / 60))}m ${integerToDevanagari(sec)}s`
  }

  if (hr > 0) {
    return `${hr}h ${min}m ${sec}s`
  }
  return `${Math.floor(rounded / 60)}m ${sec}s`
}
