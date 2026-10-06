import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Initialises Lenis smooth scroll and syncs it with GSAP ScrollTrigger.
 * Disabled when the user prefers reduced motion. Stores the instance in the
 * provided ref so other components can stop/start/scrollTo it.
 */
export function useLenis(lenisRef: React.MutableRefObject<Lenis | null>) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const gsapTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(gsapTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(gsapTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced, lenisRef]);
}
