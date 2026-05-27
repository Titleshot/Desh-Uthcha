export type SectionNavItem = { id: string; label: string };

/** In-page anchors for main narrative sections (order matches scroll flow). */
export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  { id: "silence", label: "Silence" },
  { id: "problem", label: "Problem" },
  { id: "system", label: "System" },
  { id: "sectors", label: "Sectors" },
  { id: "nation", label: "Nation" },
  { id: "trust", label: "Trust" },
];
