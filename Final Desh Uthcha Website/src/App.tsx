import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { SectionToggleBar } from "./components/SectionToggleBar";
import { useActiveSectionId } from "./hooks/useActiveSectionId";
import { SilenceSection } from "./sections/SilenceSection";
import { ProblemSection } from "./sections/ProblemSection";
import { SystemSection } from "./sections/SystemSection";
import { SolutionSection } from "./sections/SolutionSection";
import { SectorsSection } from "./sections/SectorsSection";
import { NationSection } from "./sections/NationSection";
import { TrustSection } from "./sections/TrustSection";
import { ClosureSection } from "./sections/ClosureSection";

export default function App() {
  const [navVisible, setNavVisible] = useState(false);
  const activeSectionId = useActiveSectionId();

  useEffect(() => {
    const onScroll = () => setNavVisible(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar visible={navVisible} activeSectionId={activeSectionId} />
      <SectionToggleBar activeSectionId={activeSectionId} />
      <main className="site-main">
        <SilenceSection />
        <ProblemSection />
        <SystemSection />
        <SolutionSection />
        <SectorsSection />
        <NationSection />
        <TrustSection />
        <ClosureSection />
      </main>
    </>
  );
}
