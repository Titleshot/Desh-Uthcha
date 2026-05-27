import { CinematicVideo } from "../components/CinematicVideo";
import { Reveal } from "../components/Reveal";
import { BRAND } from "../media/branding";
import { V } from "../media/videos";

export function ClosureSection() {
  return (
    <section id="closure" className="section-anchor closure" aria-label="Closure">
      <CinematicVideo src={V.closureHope} label="Hope — sunrise closure" />
      <div className="closure-inner">
        <Reveal>
          <div className="closure-stack">
            <p className="display closure-line">प्रणाली परिवर्तन एकैचोटि हुँदैन—</p>
            <p className="display closure-line">तर स्पष्टता पहिलो कदम हो।</p>
            <p className="display closure-final">देश उठ्छ—जब प्रणाली उठ्छ।</p>
          </div>
        </Reveal>
      </div>
      <footer className="closure-foot">
        <img src={BRAND.khukuriLogo} alt="" className="closure-foot-khukuri" width={20} height={20} decoding="async" aria-hidden />
        <span>DESH UTHCHA</span>
      </footer>
      <style>{`
        .closure {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .closure-inner {
          position: relative;
          z-index: 2;
          width: min(880px, 100% - 2.5rem);
          text-align: center;
          padding-block: 5rem 4rem;
        }
        .closure-stack {
          text-shadow: 0 2px 48px rgba(0, 0, 0, 0.55);
        }
        .closure-line {
          margin: 0 0 0.5rem;
          font-size: clamp(1.15rem, 2.5vw, 1.55rem);
          color: rgba(244, 241, 234, 0.88);
          font-weight: 500;
        }
        .closure-final {
          margin: 1.75rem 0 0;
          font-size: clamp(1.45rem, 3.2vw, 2.15rem);
          font-weight: 700;
          color: var(--text);
        }
        .closure-foot {
          position: absolute;
          z-index: 2;
          bottom: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.62rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(244, 241, 234, 0.35);
        }
        .closure-foot-khukuri {
          height: 17px;
          width: auto;
          max-width: 28px;
          object-fit: contain;
          opacity: 0.55;
          filter: brightness(1.05);
        }
      `}</style>
    </section>
  );
}
