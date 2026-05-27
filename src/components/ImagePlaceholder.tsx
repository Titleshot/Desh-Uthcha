export type PlaceholderVariant =
  | 'hero'
  | 'fragmented'
  | 'transparency'
  | 'tracker'
  | 'series'
  | 'vision'
  | 'final'
  | 'clarity'
  | 'cta'

type Props = {
  variant: PlaceholderVariant
  className?: string
}

/** Replace inner content with <img> when assets are ready; keep aspect ratio wrapper. */
export default function ImagePlaceholder({ variant, className = '' }: Props) {
  return (
    <div
      className={`image-ph image-ph--${variant} ${className}`.trim()}
      aria-hidden
      role="presentation"
    >
      <span className="image-ph__grain" />
    </div>
  )
}
