import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

let registered = false;

export function initGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, Flip);
    registered = true;
  }
  return { gsap, ScrollTrigger, Flip };
}

// Ensure plugins are registered when this module is imported directly.
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, Flip);
  registered = true;
}

export { gsap, ScrollTrigger, Flip };
