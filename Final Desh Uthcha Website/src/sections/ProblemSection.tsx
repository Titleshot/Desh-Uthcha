import { Reveal } from "../components/Reveal";
import { VideoFrame } from "../components/VideoFrame";
import { V } from "../media/videos";

const CARDS = [
  {
    line: "सुरु हुन्छ—तर सकिँदैन।",
    src: V.problemIncomplete,
    label: "Incomplete Road",
  },
  {
    line: "उत्पादन सस्तो—बजार महँगो।",
    src: V.problemValueChain,
    label: "Farmer vs Market",
  },
  {
    line: "खर्च हुन्छ—तर देखिँदैन।",
    src: V.problemInvisible,
    label: "Financial Leakage",
  },
] as const;

export function ProblemSection() {
  return (
    <section id="problem" className="section-anchor section-pad problem">
      <div className="shell">
        <div className="problem-grid">
          {CARDS.map((c) => (
            <Reveal key={c.label}>
              <article className="glass-card problem-card">
                <VideoFrame src={c.src} assetLabel={c.label}>
                  <p className="problem-line">{c.line}</p>
                </VideoFrame>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="problem-reveal display" style={{ marginTop: "3.5rem", textAlign: "center" }}>
            समस्या पैसाको अभाव होइन—प्रणालीको चुहावट हो।
          </p>
        </Reveal>
      </div>
      <style>{`
        .problem {
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(36, 51, 42, 0.35), transparent),
            var(--bg-deep);
        }
        .problem-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 900px) {
          .problem-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.35rem;
          }
        }
        .problem-card {
          padding: 0.55rem;
        }
        .problem-line {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text);
          line-height: 1.45;
        }
        .problem-reveal {
          color: rgba(244, 241, 234, 0.92);
          max-width: 38ch;
          margin-inline: auto;
        }
      `}</style>
    </section>
  );
}
