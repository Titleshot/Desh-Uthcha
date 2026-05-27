import { useEffect, useRef, useState } from "react";

/**
 * Adds `is-visible` once when the element enters the viewport.
 */
export function useReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
        ...options,
      },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, options]);

  return { ref, visible };
}
