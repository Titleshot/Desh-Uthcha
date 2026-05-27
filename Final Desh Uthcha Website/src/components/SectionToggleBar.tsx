import { SectionNavPills } from "./SectionNavPills";

type Props = { activeSectionId: string };

/**
 * Fixed bottom pill strip on small viewports — same controls as `.site-nav-toggle-track` in the header on desktop.
 */
export function SectionToggleBar({ activeSectionId }: Props) {
  return (
    <>
      <nav className="section-toggle-bar" aria-label="Section navigation">
        <div className="section-toggle-bar-track">
          <SectionNavPills activeId={activeSectionId} />
        </div>
      </nav>
      <style>{`
        .section-toggle-bar {
          display: none;
        }
        @media (max-width: 720px) {
          .section-toggle-bar {
            display: block;
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 49;
            border-top: 1px solid rgba(212, 175, 55, 0.1);
            background: rgba(12, 10, 8, 0.92);
            backdrop-filter: blur(14px);
          }
          .section-toggle-bar-track {
            display: flex;
            flex-wrap: nowrap;
            gap: 0.35rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 0.5rem 1.15rem calc(0.55rem + env(safe-area-inset-bottom, 0px));
          }
          .section-toggle-bar-track::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
