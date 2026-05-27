import { useEffect, useState } from 'react'

function readDurationFromVideoElement(el: HTMLVideoElement): number | null {
  const d = el.duration
  if (!Number.isFinite(d) || d <= 0 || d === Number.POSITIVE_INFINITY) return null
  return d
}

/**
 * Loads metadata for `videoUrl`. Duration may update on `durationchange` (some MP4s); we keep the max stable value.
 */
export function useVideoDurationSeconds(videoUrl: string | undefined): number | null {
  const [seconds, setSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (!videoUrl) {
      setSeconds(null)
      return
    }

    setSeconds(null)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.src = videoUrl

    const apply = () => {
      const d = readDurationFromVideoElement(v)
      if (d == null) return
      setSeconds((prev) => (prev == null ? d : Math.max(prev, d)))
    }

    const onErr = () => setSeconds(null)

    v.addEventListener('loadedmetadata', apply)
    v.addEventListener('durationchange', apply)
    v.addEventListener('error', onErr)

    return () => {
      v.removeEventListener('loadedmetadata', apply)
      v.removeEventListener('durationchange', apply)
      v.removeEventListener('error', onErr)
      v.removeAttribute('src')
      v.load()
    }
  }, [videoUrl])

  return seconds
}
