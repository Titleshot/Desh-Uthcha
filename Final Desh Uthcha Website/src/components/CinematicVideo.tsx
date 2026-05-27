import { useLoadWhenVisible } from "../hooks/useLoadWhenVisible";

type Props = {
  src: string;
  className?: string;
  /** Dark cinematic scrim */
  overlay?: boolean;
  /** Optional accessible label */
  label?: string;
  /**
   * First-screen hero: start loading immediately (still same file quality).
   * Bottom sections should stay `false` so mobile does not fetch all videos at once.
   */
  immediate?: boolean;
};

export function CinematicVideo({ src, className = "", overlay = true, label, immediate = false }: Props) {
  const { ref, shouldLoad } = useLoadWhenVisible<HTMLDivElement>({
    immediate,
    rootMargin: immediate ? "0px" : "120px 0px 160px 0px",
  });

  return (
    <div ref={ref} className={`cinematic-video-root ${className}`.trim()} aria-hidden={label ? undefined : true}>
      {shouldLoad ? (
        <video
          src={src}
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
          disableRemotePlayback
          aria-label={label}
        />
      ) : (
        <div className="cinematic-video-wait" aria-hidden="true" />
      )}
      {overlay ? <div className="cinematic-video-overlay" /> : null}
      <style>{`
        .cinematic-video-wait {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(22, 18, 14, 0.92) 0%,
            rgba(10, 8, 6, 0.98) 100%
          );
        }
      `}</style>
    </div>
  );
}
