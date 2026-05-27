import { Reveal } from "../components/Reveal";
import { VideoFrame } from "../components/VideoFrame";
import { V } from "../media/videos";

const BLOCKS = [
  {
    headline: "हरेक वर्ष लाखौँ युवाहरू देश छोड्छन्।",
    support: "अवसरको खोजीमा—ऊर्जा बाहिर जान्छ।",
    src: V.nationYouth,
    label: "Youth Leaving",
  },
  {
    headline: "यदि ती फर्किए भने?",
    support: "ऊर्जा बाहिर होइन—भित्र बग्न थाल्छ।",
    src: V.nationReturn,
    label: "Return Possibility",
  },
  {
    headline: "नक्सामा सिमाना बन्द छ—तर वास्तविकतामा खुला छ।",
    support: "",
    src: V.nationBorder,
    label: "Border Reality",
  },
] as const;

export function NationSection() {
  return (
    <section id="nation" className="section-anchor section-pad nation">
      <div className="shell">
        {BLOCKS.map((b, i) => (
          <Reveal key={b.label}>
            <article className={`nation-row ${i % 2 === 1 ? "nation-row--flip" : ""}`}>
              <div className="nation-media glass-card">
                <VideoFrame src={b.src} assetLabel={b.label} />
              </div>
              <div className="nation-copy">
                <h2 className="display nation-headline">{b.headline}</h2>
                {b.support ? <p className="lede nation-support">{b.support}</p> : null}
              </div>
            </article>
          </Reveal>
        ))}

        <Reveal>
          <article className="nation-row nation-row--flip nation-defense">
            <div className="nation-media glass-card">
              <VideoFrame src={V.nationDefense} assetLabel="Modern Gorkhali Defense" />
            </div>
            <div className="nation-copy">
              <h2 className="display nation-headline">
                वीर गोर्खाली केवल इतिहास होइन—भविष्यको संरचना हो।
              </h2>
              <p className="lede nation-support">मान्छे र प्रविधि मिलेर—सुरक्षा सम्भव हुन्छ।</p>
            </div>
          </article>
        </Reveal>

        <Reveal>
          <div className="nation-coda">
            <p className="display" style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)" }}>
              स्रोत छ। मान्छे छ। ऊर्जा छ। तर प्रणाली स्पष्ट छैन।
            </p>
            <p className="display" style={{ margin: 0, fontSize: "clamp(1.1rem, 2.4vw, 1.5rem)" }}>
              जब प्रणाली स्पष्ट हुन्छ—देशको सम्भावना वास्तविक बन्छ।
            </p>
          </div>
        </Reveal>
      </div>
      <style>{`
        .nation {
          background: var(--bg-void);
        }
        .nation-row {
          display: grid;
          gap: 1.75rem;
          align-items: center;
          margin-bottom: clamp(3rem, 8vw, 4.5rem);
        }
        @media (min-width: 900px) {
          .nation-row {
            grid-template-columns: 1.05fr 0.95fr;
            gap: 2.25rem;
          }
          .nation-row--flip .nation-media {
            order: 2;
          }
          .nation-row--flip .nation-copy {
            order: 1;
          }
        }
        .nation-media {
          padding: 0.55rem;
        }
        .nation-headline {
          margin: 0 0 0.75rem;
          font-size: clamp(1.25rem, 2.6vw, 1.85rem);
        }
        .nation-support {
          margin: 0;
        }
        .nation-coda {
          text-align: center;
          max-width: 52ch;
          margin: 2rem auto 0;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </section>
  );
}
