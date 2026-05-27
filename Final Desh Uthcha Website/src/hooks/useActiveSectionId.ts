import { useEffect, useState } from "react";
import { SECTION_NAV_ITEMS } from "../nav/sectionNav";

export function useActiveSectionId() {
  const [activeId, setActiveId] = useState<string>(SECTION_NAV_ITEMS[0]?.id ?? "silence");

  useEffect(() => {
    const ids = SECTION_NAV_ITEMS.map((i) => i.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting && e.target.id);
        if (visible.length === 0) return;
        visible.sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const id = visible[0]?.target.id;
        if (id) setActiveId(id);
      },
      { threshold: [0, 0.08, 0.15, 0.25, 0.4, 0.55, 0.7, 0.85, 1] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return activeId;
}
