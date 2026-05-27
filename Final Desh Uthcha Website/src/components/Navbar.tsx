import { BRAND } from "../media/branding";
import { SectionNavPills } from "./SectionNavPills";

type Props = { visible: boolean; activeSectionId: string };

export function Navbar({ visible, activeSectionId }: Props) {
  return (
    <header
      className="site-nav"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(-8px)",
      }}
    >
      <div className="site-nav-inner shell">
        <div className="site-nav-left">
          <a href="#silence" className="site-nav-brand">
            <span className="site-nav-brand-mark" aria-hidden="true">
              <img src={BRAND.khukuriLogo} alt="" className="site-nav-khukuri" width={28} height={28} decoding="async" />
            </span>
            <span className="site-nav-brand-text">DESH UTHCHA</span>
          </a>
        </div>

        <div className="site-nav-center">
          <img
            src={BRAND.jayNepalMap}
            alt="नेपाल"
            className="site-nav-nepal"
            width={44}
            height={44}
            decoding="async"
          />
        </div>

        <nav className="site-nav-links site-nav-toggle-track" aria-label="Section navigation">
          <SectionNavPills activeId={activeSectionId} />
        </nav>
      </div>
      <style>{`
        .site-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: var(--nav-h);
          border-bottom: 1px solid rgba(212, 175, 55, 0.08);
          background: rgba(12, 10, 8, 0.78);
          backdrop-filter: blur(14px);
          transition:
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .site-nav-inner {
          height: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          column-gap: clamp(0.5rem, 2vw, 1.25rem);
        }
        .site-nav-left {
          justify-self: start;
          align-self: center;
          min-width: 0;
        }
        .site-nav-center {
          justify-self: center;
          align-self: center;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .site-nav-brand {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.6rem;
          min-height: var(--nav-h);
          text-decoration: none;
        }
        .site-nav-brand-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 30px;
          height: 30px;
        }
        .site-nav-khukuri {
          display: block;
          max-width: 26px;
          max-height: 26px;
          width: auto;
          height: auto;
          object-fit: contain;
          object-position: center;
          opacity: 0.92;
          filter: brightness(1.08);
        }
        .site-nav-brand-text {
          font-size: 0.76rem;
          font-weight: 600;
          letter-spacing: 0.24em;
          line-height: 1;
          color: rgba(244, 241, 234, 0.9);
          padding-top: 1px;
        }
        .site-nav-nepal {
          display: block;
          height: 28px;
          width: auto;
          max-width: min(108px, 26vw);
          object-fit: contain;
          object-position: center center;
          opacity: 0.94;
          filter: brightness(1.06) drop-shadow(0 1px 8px rgba(0, 0, 0, 0.35));
        }
        .site-nav-toggle-track {
          justify-self: end;
          align-self: center;
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          gap: 0.35rem;
          justify-content: flex-end;
          max-width: 100%;
          min-width: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.25) transparent;
          padding-block: 2px;
        }
        .site-nav-toggle-track::-webkit-scrollbar {
          height: 3px;
        }
        .site-nav-toggle-track::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.28);
          border-radius: 999px;
        }
        @media (max-width: 720px) {
          .site-nav-links {
            display: none;
          }
          .site-nav-nepal {
            height: 28px;
            max-width: min(96px, 34vw);
          }
          .site-nav-brand-text {
            font-size: 0.68rem;
            letter-spacing: 0.18em;
          }
        }
      `}</style>
    </header>
  );
}
