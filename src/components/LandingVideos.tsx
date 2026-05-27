import { useState } from 'react'
import heroImage from '../assets/hero/hero.png'
import ImagePlaceholder from './ImagePlaceholder'

/**
 * Hero full-bleed background — still image (`src/assets/hero/hero.png`).
 * Replace that file to change the hero. Dark overlay is `.hero__scrim` in CSS.
 */
export function HeroBackdropImage() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="hero__backdrop-stack">
        <ImagePlaceholder variant="hero" className="hero__placeholder hero__placeholder--under" />
      </div>
    )
  }

  return (
    <div className="hero__backdrop-stack">
      <img
        className="hero__backdrop-img"
        src={heroImage}
        alt=""
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
