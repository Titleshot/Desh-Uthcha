import type { ReactNode } from "react";
import { useLoadWhenVisible } from "../hooks/useLoadWhenVisible";

type Props = {
  src: string;
  /** Shown as small production label for asset swap */
  assetLabel: string;
  children?: ReactNode;
  className?: string;
  /**
   * On wide screens, cap 16:9 size so the frame fits between navbar and viewport bottom.
   */
  fitViewport?: boolean;
};

export function VideoFrame({ src, assetLabel, children, className = "", fitViewport = true }: Props) {
  const { ref, shouldLoad } = useLoadWhenVisible<HTMLDivElement>();
  const mediaClass = ["video-frame-media", fitViewport ? "video-frame-media--fit" : ""].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={`video-frame ${className}`.trim()}>
      <div className={mediaClass}>
        {shouldLoad ? (
          <video
            src={src}
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
            disableRemotePlayback
          />
        ) : (
          <div className="video-frame-wait" aria-hidden="true" />
        )}
        <div className="video-frame-scrim" />
        <span className="video-frame-tag">{assetLabel}</span>
      </div>
      {children ? <div className="video-frame-body">{children}</div> : null}
      <style>{`
        .video-frame {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--brown-900);
        }
        .video-frame-media {
          position: relative;
          overflow: hidden;
        }
        .video-frame-media:not(.video-frame-media--fit) {
          width: 100%;
          aspect-ratio: 16 / 9;
        }
        .video-frame-wait {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            145deg,
            rgba(32, 28, 24, 0.95) 0%,
            rgba(18, 15, 12, 0.98) 100%
          );
        }
        .video-frame-media video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.02) contrast(1.02) brightness(0.97);
        }
        .video-frame-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(8, 6, 4, 0.06) 0%,
            rgba(8, 6, 4, 0.28) 100%
          );
          pointer-events: none;
        }
        .video-frame-tag {
          position: absolute;
          left: 10px;
          bottom: 8px;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(244, 241, 234, 0.45);
          max-width: calc(100% - 20px);
          line-height: 1.3;
        }
        .video-frame-body {
          padding: 1rem 1.1rem 1.15rem;
        }
      `}</style>
    </div>
  );
}
