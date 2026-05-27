/** Served from repo folder `Compressed Video` (or `Compressed Videos`) → URL `/series-media/` (dev + build). Thumbnails: WebP; video: MP4. */
export const SERIES_MEDIA_BASE = '/series-media'

export function seriesMediaUrl(fileName: string): string {
  const parts = fileName.split('/').filter(Boolean)
  return `${SERIES_MEDIA_BASE}/${parts.map((p) => encodeURIComponent(p)).join('/')}`
}
