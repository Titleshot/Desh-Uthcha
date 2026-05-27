import { CinematicVideo } from "../components/CinematicVideo";
import { Reveal } from "../components/Reveal";
import { V } from "../media/videos";

export function SilenceSection() {
  return (
    <section id="silence" className="section-anchor silence" aria-label="Silence">
      <CinematicVideo
        src={V.silenceHero}
        label="Silent Nepal village — cinematic opener"
        immediate
      />
      <div className="silence-inner">
        <Reveal className="silence-copy">
          <h1 className="display display-xl silence-headline">
            विदेशी माटोमा रगत धेरै बग्यो।
            <br />
            अब आफ्नै माटोमा पसिना बगाउने पालो।
          </h1>
        </Reveal>
        <div className="scroll-hint" aria-hidden="true">
          <span className="scroll-hint-line" />
          <span className="scroll-hint-text">Scroll</span>
        </div>
      </div>
      <style>{`
        .silence {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .silence-inner {
          position: relative;
          z-index: 2;
          width: min(920px, 100% - 2.5rem);
          text-align: center;
          padding-block: 6rem 5rem;
        }
        .silence-copy {
          text-shadow: 0 2px 48px rgba(0, 0, 0, 0.55);
        }
        .silence-headline {
          margin: 0;
          font-weight: 600;
        }
        .scroll-hint {
          position: absolute;
          left: 50%;
          bottom: 1.75rem;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.45rem;
          opacity: 0.55;
        }
        .scroll-hint-line {
          width: 1px;
          height: 42px;
          background: linear-gradient(180deg, var(--gold), transparent);
          animation: scrollPulse 2.4s ease-in-out infinite;
        }
        .scroll-hint-text {
          font-size: 0.62rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(244, 241, 234, 0.45);
        }
        @keyframes scrollPulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scaleY(0.92);
          }
          50% {
            opacity: 0.85;
            transform: scaleY(1);
          }
        }
      `}</style>
    </section>
  );
}
