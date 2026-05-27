import type { ReactNode } from "react";
import { useReveal } from "../hooks/useReveal";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className = "" }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-reveal className={`${className} ${visible ? "is-visible" : ""}`.trim()}>
      {children}
    </div>
  );
}
