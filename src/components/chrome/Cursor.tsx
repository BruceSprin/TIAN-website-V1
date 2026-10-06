import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCursor } from "./CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { initGsap } from "@/lib/gsap";

export function Cursor() {
  const { t } = useTranslation();
  const { state } = useCursor();
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Decide up-front (synchronously) so the cursor DOM is present on first render
  // and the binding effect below can attach to real elements.
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: fine)").matches;
  });
  const [hidden, setHidden] = useState(false);

  // Keep `enabled` in sync with reduced-motion / pointer changes.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine && !reduced);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    // Refs are guaranteed mounted here because `enabled` is true on this render.
    if (!ringRef.current || !dotRef.current) return;
    document.documentElement.classList.add("custom-cursor-active");
    const { gsap } = initGsap();

    // quickTo gives elastic follow without React state churn on mousemove.
    const ringX = gsap.quickTo(ringRef.current, "x", { duration: 0.42, ease: "power3" });
    const ringY = gsap.quickTo(ringRef.current, "y", { duration: 0.42, ease: "power3" });
    const dotX = gsap.quickTo(dotRef.current, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dotRef.current, "y", { duration: 0.12, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    // Native cursor over inputs / editable / selectable text areas.
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const editable =
        t.closest("input, textarea, select, [contenteditable='true']") !== null;
      document.documentElement.classList.toggle("custom-cursor-active", !editable);
      setHidden(editable);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  const accent = "hsl(var(--signal-amber))";
  const ringSize = state === "view" ? 72 : state === "link" ? 44 : 32;
  const label = state === "view" ? t("cursor.view") : state === "link" ? "→" : "";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ opacity: hidden ? 0 : 1, transition: "opacity 0.2s ease" }}
    >
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full"
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          border: `1px solid ${accent}`,
          transition: "width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}
      >
        <span
          className="mono text-[10px] font-bold uppercase tracking-widest"
          style={{
            color: accent,
            opacity: label ? 1 : 0,
            transform: label ? "scale(1)" : "scale(0.6)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          {label}
        </span>
      </div>
      {/* Center dot */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 rounded-full"
        style={{
          width: 4,
          height: 4,
          marginLeft: -2,
          marginTop: -2,
          backgroundColor: accent,
          opacity: state === "default" ? 1 : 0,
          transition: "opacity 0.2s ease",
          willChange: "transform",
        }}
      />
    </div>
  );
}
