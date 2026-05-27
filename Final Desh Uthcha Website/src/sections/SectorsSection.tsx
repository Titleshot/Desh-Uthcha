import { Reveal } from "../components/Reveal";
import { VideoFrame } from "../components/VideoFrame";
import { SECTOR_BLOCKS } from "../data/sectors";
import { V } from "../media/videos";

type RealityKey = NonNullable<(typeof SECTOR_BLOCKS)[number]["videoRealityKey"]>;
type CleanKey = NonNullable<(typeof SECTOR_BLOCKS)[number]["videoCleanKey"]>;

function realitySrc(key: RealityKey) {
  return V[key];
}

function cleanSrc(key: CleanKey) {
  return V[key];
}

export function SectorsSection() {
  return (
    <section id="sectors" className="section-anchor section-pad sectors">
      <div className="shell">
        <Reveal>
          <div className="glass-card sectors-intro">
            <VideoFrame src={V.sectorsExplore} assetLabel="Multi-sector Explore">
              <p className="display sectors-intro-line" style={{ margin: 0 }}>
                अब प्रणाली आफैं हेर्नुहोस्—हरेक क्षेत्रमा कसरी काम गर्छ।
              </p>
            </VideoFrame>
          </div>
        </Reveal>

        <div className="sectors-grid">
          {SECTOR_BLOCKS.map((s) => (
            <Reveal key={s.id}>
              <article className="glass-card sector-deep">
                <header className="sector-head">
                  <h3 className="sector-title">{s.title}</h3>
                  <p className="sector-sub">{s.subtitle}</p>
                </header>

                <div className="sector-block">
                  <p className="sector-label">वास्तविकता</p>
                  <p className="sector-line">{s.realityLine}</p>
                  <ul className="sector-bullets">
                    {s.realityBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>

                {s.videoRealityKey ? (
                  <VideoFrame src={realitySrc(s.videoRealityKey)} assetLabel={s.realityVideoLabel} />
                ) : (
                  <div className="sector-video-placeholder" aria-hidden="true">
                    <span>विडियो थप्नुहोस् — वास्तविकता</span>
                  </div>
                )}

                <div className="sector-block">
                  <p className="sector-label">प्रणाली अन्तर</p>
                  <p className="sector-line">{s.gapLine}</p>
                  <ul className="sector-bullets">
                    {s.gapBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="sector-block">
                  <p className="sector-label">स्पष्ट प्रणाली</p>
                  <ul className="sector-bullets sector-bullets--plain">
                    {s.cleanBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>

                {s.videoCleanKey ? (
                  <VideoFrame src={cleanSrc(s.videoCleanKey)} assetLabel={s.cleanVideoLabel} />
                ) : null}

                <div className="sector-block sector-block--impact">
                  <p className="sector-label">परिणाम</p>
                  <p className="sector-impact">{s.impactLine}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`
        .sectors {
          background: linear-gradient(180deg, var(--bg-void), var(--bg-deep));
        }
        .sectors-intro {
          padding: 0.55rem;
          margin-bottom: 2.25rem;
        }
        .sectors-intro-line {
          font-size: clamp(1.05rem, 2.2vw, 1.45rem);
        }
        .sectors-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 720px) {
          .sectors-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .sector-deep {
          padding: 1.1rem 1.15rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sector-head {
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }
        .sector-title {
          margin: 0 0 0.2rem;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .sector-sub {
          margin: 0;
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold-dim);
        }
        .sector-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .sector-block--impact {
          margin-top: 0.15rem;
          padding-top: 0.65rem;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }
        .sector-label {
          margin: 0;
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.55);
          font-weight: 600;
        }
        .sector-line {
          margin: 0;
          font-size: 1.02rem;
          font-weight: 600;
          line-height: 1.45;
          color: var(--text);
        }
        .sector-bullets {
          margin: 0;
          padding-left: 1.1rem;
          color: var(--text-muted);
          font-size: 0.86rem;
          line-height: 1.5;
        }
        .sector-bullets--plain {
          list-style: disc;
        }
        .sector-impact {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: rgba(244, 241, 234, 0.95);
        }
        .sector-video-placeholder {
          border-radius: var(--radius-lg);
          aspect-ratio: 16 / 9;
          display: grid;
          place-items: center;
          border: 1px dashed rgba(212, 175, 55, 0.2);
          background: rgba(20, 17, 14, 0.65);
          color: rgba(244, 241, 234, 0.4);
          font-size: 0.75rem;
          text-align: center;
          padding: 1rem;
        }
      `}</style>
    </section>
  );
}
