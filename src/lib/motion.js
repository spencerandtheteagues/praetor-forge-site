import { createContext, useContext, useEffect, useState } from "react";

// Global motion state. `paused` is the user's "Pause motion" toggle; `reduced`
// mirrors prefers-reduced-motion (false during SSR, resolved after hydration);
// `cinemaPlaying` is true while the cinema stage is playing in view, so the
// medallion can yield the GPU.
export const MotionContext = createContext({
  paused: false,
  reduced: false,
  setPaused: () => {},
  cinemaPlaying: false,
  setCinemaPlaying: () => {},
});

export const useMotion = () => useContext(MotionContext);

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

// True once the component has hydrated on the client. Use it to gate anything
// that must not differ between the prerendered HTML and the first client render.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// IntersectionObserver visibility for a ref. SSR-safe (false until observed).
export function useInView(ref, { threshold = 0, rootMargin = "0px" } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin]);
  return inView;
}
