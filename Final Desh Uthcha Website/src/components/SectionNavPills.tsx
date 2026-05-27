import { SECTION_NAV_ITEMS } from "../nav/sectionNav";

type Props = { activeId: string };

export function SectionNavPills({ activeId }: Props) {
  return (
    <>
      {SECTION_NAV_ITEMS.map((item) => {
        const isActive = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`section-toggle-pill${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "true" : undefined}
          >
            {item.label}
          </a>
        );
      })}
    </>
  );
}
