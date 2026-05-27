const KHARAB = 1e11
const ARAB = 1e9

const DEV_DIGITS = '०१२३४५६७८९'

function toDevanagariDigits(s: string): string {
  return s.replace(/\d/g, (d) => DEV_DIGITS[Number(d)] ?? d)
}

/** Integers 0–99 for UI labels */
export function integerToDevanagari(n: number): string {
  return String(Math.round(n))
    .split('')
    .map((d) => DEV_DIGITS[Number(d)] ?? d)
    .join('')
}

/** Format illustrative savings from annual budget baseline (18 kharab NPR). */
export function formatSavingsNpr(amountNpr: number, lang: 'en' | 'ne'): string {
  const rounded = Math.round(amountNpr / 1e6) * 1e6
  if (lang === 'ne') {
    if (rounded >= KHARAB) {
      const kb = rounded / KHARAB
      const txt =
        kb >= 10 || kb === Math.floor(kb) ? kb.toFixed(0) : kb.toFixed(1).replace(/\.0$/, '')
      return `${toDevanagariDigits(txt)} खर्ब रुपैयाँ`
    }
    const ab = Math.round(rounded / ARAB)
    return `${toDevanagariDigits(String(ab))} अर्ब रुपैयाँ`
  }

  if (rounded >= 1e12) {
    const t = rounded / 1e12
    const txt = t >= 10 || t === Math.floor(t) ? t.toFixed(0) : t.toFixed(1).replace(/\.0$/, '')
    return `NPR ${txt} trillion (approx.)`
  }
  if (rounded >= 1e9) {
    const b = rounded / 1e9
    const txt = b >= 100 || b === Math.floor(b) ? b.toFixed(0) : b.toFixed(1).replace(/\.0$/, '')
    return `NPR ${txt} billion (approx.)`
  }
  const m = rounded / 1e6
  return `NPR ${m.toFixed(0)} million (approx.)`
}

export const ANNUAL_BUDGET_NPR = 1_800_000_000_000

export function savingsForPercent(percent: number): number {
  return ANNUAL_BUDGET_NPR * (percent / 100)
}
