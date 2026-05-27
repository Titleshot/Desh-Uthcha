import { Reveal } from "../components/Reveal";
import { VideoFrame } from "../components/VideoFrame";
import { V } from "../media/videos";

export function TrustSection() {
  return (
    <section id="trust" className="section-anchor section-pad trust">
      <div className="shell">
        <div className="trust-grid">
          <Reveal>
            <article className="glass-card trust-card">
              <VideoFrame src={V.trustData} assetLabel="Data Transparency">
                <p className="display" style={{ margin: 0, fontSize: "clamp(1.05rem, 2.1vw, 1.35rem)" }}>
                  यो प्लेटफर्म सार्वजनिक डेटा र प्रणालीगत विश्लेषणमा आधारित छ।
                </p>
              </VideoFrame>
            </article>
          </Reveal>
          <Reveal>
            <article className="glass-card trust-card">
              <VideoFrame src={V.trustCitizen} assetLabel="Citizen Role">
                <p className="display" style={{ margin: "0 0 0.65rem", fontSize: "clamp(1.05rem, 2.1vw, 1.35rem)" }}>
                  प्रणाली केवल सरकारको होइन—हामी सबैको हो।
                </p>
                <p className="lede" style={{ margin: 0 }}>
                  जब नागरिकले देख्छ, प्रणाली जिम्मेवार बन्छ।
                </p>
              </VideoFrame>
            </article>
          </Reveal>
        </div>
      </div>
      <style>{`
        .trust {
          background: linear-gradient(180deg, var(--bg-deep), var(--bg-void));
        }
        .trust-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 900px) {
          .trust-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.35rem;
          }
        }
        .trust-card {
          padding: 0.55rem;
        }
      `}</style>
    </section>
  );
}
