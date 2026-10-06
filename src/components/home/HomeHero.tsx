import { useEffect, useMemo, useState, type ReactNode } from "react";
import { coverUrl, works } from "@/data/works";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** How long a cover holds before the next one starts fading in. */
const HOLD_MS = 10_000;

interface Props {
  /** Hero copy and links, laid out over the covers. */
  children: ReactNode;
}

/**
 * The home hero, with the work covers behind its copy.
 *
 * The covers run themselves: each one holds for ten seconds, then dissolves
 * into the next over one second, and the last one loops back to the first.
 * Nothing here reacts
 * to the wheel or to touch, so the page scrolls straight past the hero.
 *
 * Only the cover on screen and the one waiting behind it are mounted, so the
 * hero does not pull every poster down the moment it loads.
 */
export function HomeHero({ children }: Props) {
  const reduced = useReducedMotion();
  const covers = useMemo(
    () => works.map((work) => coverUrl(work)).filter((url): url is string => !!url),
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || covers.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % covers.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [covers.length, reduced]);

  const mounted = covers.slice(0, Math.min(covers.length, index + 2));

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-[clamp(1rem,2vw,1.5rem)] pb-10 pt-28 md:h-screen md:pt-32">
      <div aria-hidden className="absolute inset-0">
        {/* Later covers sit on top, so a fade in is always a fade over. */}
        {mounted.map((url, i) => (
          <div
            key={`${i}-${url}`}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{ backgroundImage: `url("${url}")`, opacity: i === index ? 1 : 0 }}
          />
        ))}
        {/* Scrim: covers run from a black title card to a bright sunset, so the
            hero copy needs a floor of its own to sit on. */}
        <div className="absolute inset-0 bg-graphite/55" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,9,10,0.88) 0%, rgba(8,9,10,0.34) 46%, rgba(8,9,10,0.8) 100%)",
          }}
        />
      </div>
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      {children}
    </section>
  );
}
