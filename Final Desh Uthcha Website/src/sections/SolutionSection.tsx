import { Reveal } from "../components/Reveal";
import { VideoFrame } from "../components/VideoFrame";
import { V } from "../media/videos";

const PILLARS = [
  { line: "प्रगति लुक्दैन—देखिन्छ।", src: V.solutionTracking, label: "Tracking / Visibility" },
  { line: "जिम्मेवारी अस्पष्ट हुँदैन—निश्चित हुन्छ।", src: V.solutionAccountability, label: "Accountability" },
  { line: "प्रक्रिया रोकिन्न—अगाडि बढ्छ।", src: V.solutionContinuity, label: "Continuity" },
] as const;

export function SolutionSection() {
  return (
    <section id="solution" className="section-anchor section-pad solution">
      <div className="shell">
        <Reveal>
          <div className="glass-card solution-open">
            <VideoFrame src={V.solutionCleanFlow} assetLabel="Clean System Flow">
              <p className="display" style={{ margin: 0, fontSize: "clamp(1.15rem, 2.4vw, 1.55rem)" }}>
                प्रणाली देखियो भने, प्रवाह रोकिन्न।
              </p>
            </VideoFrame>
          </div>
        </Reveal>

        <div className="solution-pillars">
          {PILLARS.map((p) => (
            <Reveal key={p.label}>
              <article className="glass-card solution-pillar">
                <VideoFrame src={p.src} assetLabel={p.label}>
                  <p className="pillar-line">{p.line}</p>
                </VideoFrame>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="display solution-close" style={{ textAlign: "center" }}>
            जब प्रणाली स्पष्ट हुन्छ, परिणाम स्थिर हुन्छ।
          </p>
        </Reveal>
      </div>
      <style>{`
        .solution {
          background: radial-gradient(ellipse 70% 45% at 50% 100%, rgba(30, 45, 36, 0.4), transparent),
            var(--bg-deep);
        }
        .solution-open {
          padding: 0.55rem;
          margin-bottom: 2rem;
        }
        .solution-pillars {
          display: grid;
          gap: 1.35rem;
          grid-template-columns: 1fr;
          margin-bottom: 2.75rem;
        }
        @media (min-width: 900px) {
          .solution-pillars {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .solution-pillar {
          padding: 0.55rem;
        }
        .pillar-line {
          margin: 0;
          font-size: 1.08rem;
          font-weight: 600;
        }
        .solution-close {
          max-width: 36ch;
          margin: 0 auto;
        }
      `}</style>
    </section>
  );
}
