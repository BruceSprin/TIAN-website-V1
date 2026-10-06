import { useEffect, useRef, useState, ReactNode } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenisContext } from "./LenisContext";
import { BRAND } from "@/data/site";

/**
 * Directional "signal wipe": on navigation an amber panel sweeps up to cover,
 * the new page mounts underneath, then the panel sweeps away — no white/black
 * blank frame. The wipe panel is a fixed sibling (never an ancestor of the
 * page content) so it can't create a containing block that would break the
 * home stage's position:fixed.
 */
export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const { scrollToTop } = useLenisContext();

  const ref = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState<ReactNode>(outlet);
  const [displayKey, setDisplayKey] = useState(location.pathname);
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    if (location.pathname === displayKey) {
      setDisplay(outlet);
      return;
    }
    if (pendingRef.current === location.pathname) return;
    pendingRef.current = location.pathname;

    if (reduced) {
      setDisplay(outlet);
      setDisplayKey(location.pathname);
      scrollToTop(true);
      pendingRef.current = null;
      // Quick fade only.
      const el = ref.current;
      if (el) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      return;
    }

    const wipe = wipeRef.current;
    const content = ref.current;

    // 1) Panel sweeps UP to cover the viewport.
    if (wipe) {
      wipe.style.pointerEvents = "auto";
      wipe.animate(
        [{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }],
        { duration: 420, easing: "cubic-bezier(0.83,0,0.17,1)", fill: "forwards" }
      );
    }

    // 2) Swap content while covered, then reveal + panel sweeps away.
    const t = window.setTimeout(() => {
      setDisplay(outlet);
      setDisplayKey(location.pathname);
      scrollToTop(true);
      pendingRef.current = null;

      // New page rises in slightly (transform cleared on finish — see note).
      if (content) {
        const anim = content.animate(
          [
            { opacity: 0, transform: "translateY(1.5rem)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 500, easing: "cubic-bezier(0.16,1,0.3,1)" }
        );
        const clear = () => {
          content.style.transform = "";
          content.style.opacity = "1";
        };
        anim.onfinish = clear;
        anim.oncancel = clear;
      }

      // Panel sweeps further up and away, revealing the new page underneath.
      if (wipe) {
        const out = wipe.animate(
          [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
          { duration: 460, easing: "cubic-bezier(0.83,0,0.17,1)", fill: "forwards" }
        );
        out.onfinish = () => {
          wipe.style.pointerEvents = "none";
        };
      }
    }, 420);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, outlet]);

  return (
    <>
      <div ref={ref}>{display}</div>
      {/* Signal-wipe panel */}
      <div
        ref={wipeRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[150]"
        style={{
          transform: "translateY(100%)",
          background:
            "linear-gradient(180deg, hsl(var(--signal-amber)) 0%, hsl(var(--graphite)) 100%)",
        }}
      >
        <div className="flex h-full items-end justify-start p-6">
          <span className="mono text-xs uppercase tracking-[0.3em] text-graphite">
            {BRAND.name}
          </span>
        </div>
      </div>
    </>
  );
}
