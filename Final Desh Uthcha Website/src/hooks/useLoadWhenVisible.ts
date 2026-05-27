import { useEffect, useRef, useState } from "react";

type Options = {
  /** Extra pixels before/after viewport to start loading (smoother scroll-in). */
  rootMargin?: string;
  /** Skip observation — load as soon as mounted (first-screen hero). */
  immediate?: boolean;
};

/**
 * Defers attaching heavy video `src` until the container is near the viewport.
 * Same MP4 files and playback quality; avoids downloading the whole page of videos at once.
 */
export function useLoadWhenVisible<T extends HTMLElement>(options?: Options) {
  const immediate = options?.immediate ?? false;
  const rootMargin = options?.rootMargin ?? "180px 0px 100px 0px";
  const ref = useRef<T | null>(null);
  const [shouldLoad, setShouldLoad] = useState(immediate);

  useEffect(() => {
    if (immediate || shouldLoad) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate, shouldLoad, rootMargin]);

  return { ref, shouldLoad };
}
