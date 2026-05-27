import { Reveal } from "../components/Reveal";
import { VideoFrame } from "../components/VideoFrame";
import { V } from "../media/videos";

function IdealFlowDiagram() {
  return (
    <div className="flow">
      <div className="flow-node">
        <strong>नीति / बजेट</strong>
        <span>Policy / Budget</span>
      </div>
      <div className="flow-connector" />
      <div className="flow-arrow">↓</div>
      <div className="flow-node">
        <strong>प्रणाली</strong>
        <span>System / Process</span>
      </div>
      <div className="flow-connector" />
      <div className="flow-arrow">↓</div>
      <div className="flow-node">
        <strong>कार्यान्वयन</strong>
        <span>Execution</span>
      </div>
      <div className="flow-connector" />
      <div className="flow-arrow">↓</div>
      <div className="flow-node">
        <strong>जनता</strong>
        <span>Public outcome</span>
      </div>
    </div>
  );
}

function BrokenFlowDiagram() {
  return (
    <div className="flow flow--broken">
      <div className="flow-node">
        <strong>नीति / बजेट</strong>
        <span>Policy / Budget</span>
      </div>
      <div className="flow-connector" />
      <div className="flow-arrow">↓</div>
      <div className="flow-node is-broken">
        <strong>रूपान्तरण</strong>
        <span>Transformation (कमजोर)</span>
      </div>
      <div className="flow-connector" />
      <div className="flow-arrow">↓</div>
      <div className="flow-node is-broken">
        <strong>कार्यान्वयन</strong>
        <span>Execution</span>
      </div>
      <div className="flow-connector" />
      <div className="flow-arrow">↓</div>
      <div className="flow-node is-broken">
        <strong>जनता</strong>
        <span>Public outcome</span>
      </div>
    </div>
  );
}

export function SystemSection() {
  return (
    <section id="system" className="section-anchor section-pad system">
      <div className="shell">
        <div className="system-split">
          <Reveal>
            <div className="glass-card system-panel">
              <p className="display" style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.55rem)", marginTop: 0 }}>
                नीति बन्छ, प्रणाली चल्छ, सेवा पुग्नुपर्छ।
              </p>
              <div className="system-dia-wrap">
                <IdealFlowDiagram />
              </div>
              <VideoFrame src={V.systemIdealFlow} assetLabel="Clean System Flow — ideal" />
            </div>
          </Reveal>

          <Reveal>
            <div className="system-kharba">
              <VideoFrame src={V.systemKharba} assetLabel="The 18 Kharba Moment" />
              <p className="kharba-line display" style={{ marginTop: "1.75rem", textAlign: "center" }}>
                नेपालले हरेक वर्ष करिब १८ खर्ब रुपैयाँ खर्च गर्छ।
              </p>
              <p
                className="display"
                style={{
                  marginTop: "1.25rem",
                  textAlign: "center",
                  fontSize: "clamp(1.15rem, 2.5vw, 1.45rem)",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                तर त्यो कहाँ जान्छ?
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="glass-card system-panel">
              <p className="lede" style={{ marginBottom: "1.5rem" }}>
                नीति र बजेटले दिशा दिन्छ। प्रणालीले त्यसलाई नतिजामा बदल्नुपर्छ। तर यही रूपान्तरण प्रक्रियामै कमजोरी हुँदा, अन्तिम परिणाम हराउँछ।
              </p>
              <div className="system-dia-wrap">
                <BrokenFlowDiagram />
              </div>
              <VideoFrame src={V.systemBroken} assetLabel="The Broken Flow" />
              <p
                className="display"
                style={{ marginTop: "1.75rem", marginBottom: 0, textAlign: "center", fontSize: "clamp(1.2rem, 2.6vw, 1.65rem)" }}
              >
                समस्या अन्त्यमा होइन—बीचमै हुन्छ।
              </p>
            </div>
          </Reveal>
        </div>
      </div>
      <style>{`
        .system {
          background: linear-gradient(180deg, var(--bg-deep), var(--bg-void));
        }
        .system-split {
          display: flex;
          flex-direction: column;
          gap: 2.75rem;
        }
        .system-panel {
          padding: clamp(1.25rem, 3vw, 1.75rem);
        }
        .system-dia-wrap {
          display: flex;
          justify-content: center;
          margin: 1.75rem 0 1.5rem;
        }
        .system-kharba {
          padding-block: 0.5rem;
        }
        .kharba-line {
          text-shadow: 0 0 42px rgba(212, 175, 55, 0.12);
        }
      `}</style>
    </section>
  );
}
