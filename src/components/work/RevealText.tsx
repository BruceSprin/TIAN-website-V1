import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Milliseconds the line takes to fade in. */
const FADE_MS = 800;

interface Props {
  /** The finished line. */
  text: string;
  className?: string;
}

/**
 * A line that fades in the first time it scrolls into view, over FADE_MS. A
 * reader who prefers reduced motion, or who has already scrolled past, gets it
 * at once.
 */
export function RevealText({ text, className }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        setShown(true);
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={cn(
        !reduced && "transition-opacity ease-out",
        !shown && !reduced && "opacity-0",
        className
      )}
      style={reduced ? undefined : { transitionDuration: `${FADE_MS}ms` }}
    >
      {text}
    </span>
  );
}
