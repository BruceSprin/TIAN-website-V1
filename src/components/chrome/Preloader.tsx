import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenisContext } from "./LenisContext";
import { BRAND } from "@/data/site";

interface Props {
  onComplete: () => void;
  /** Shortened version for repeat visits within a session. */
  quick?: boolean;
}

const WORD = BRAND.name;
const SLICES = WORD.length; // one vertical slice per character

export function Preloader({ onComplete, quick = false }: Props) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const { stop, start } = useLenisContext();
  const [pct, setPct] = useState(0);
  const [assembled, setAssembled] = useState(false);
  const [scan, setScan] = useState(false);
  const [exit, setExit] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) {
      document.body.style.overflow = "";
      start();
      onComplete();
      return;
    }

    document.body.style.overflow = "hidden";
    stop();

    const total = quick ? 500 : 1900;
    const startTime = performance.now();
    let rafId = 0;
    const timers: number[] = [];

    // Drive a real percentage from elapsed time, but never show 100 until the
    // window 'load' (or a hard cap) has actually fired.
    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(1, elapsed / total);
      // Hold at 96% until resources are ready.
      const capped = !loaded && raw > 0.96 ? 0.96 : raw;
      setPct(Math.round(capped * 100));
      if (capped < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    const assembleAt = quick ? 200 : 1000;
    const scanAt = quick ? 320 : 1400;
    const exitAt = quick ? 380 : 1600;
    const doneAt = quick ? 500 : 2100;

    timers.push(window.setTimeout(() => setAssembled(true), assembleAt));
    timers.push(window.setTimeout(() => setScan(true), scanAt));
    timers.push(window.setTimeout(() => setExit(true), exitAt));
    timers.push(
      window.setTimeout(() => {
        document.body.style.overflow = "";
        start();
        onComplete();
      }, doneAt)
    );

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = "";
      start();
    };
  }, [reduced, quick, onComplete, stop, start]);

  if (reduced) return null;

  const easing = "cubic-bezier(0.83, 0, 0.17, 1)";
  // Three uneven exit panels.
  const panels = [
    { left: "0%", width: "38%", delay: 0 },
    { left: "38%", width: "34%", delay: 0.08 },
    { left: "72%", width: "28%", delay: 0.16 },
  ];

  return (
    <div ref={rootRef} className="fixed inset-0 z-[200] overflow-hidden" aria-hidden="true">
      {/* Exit panels (uneven widths) */}
      {panels.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 h-full bg-graphite"
          style={{
            left: p.left,
            width: p.width,
            transform: exit ? "translateY(-100%)" : "translateY(0)",
            transition: `transform 0.7s ${easing} ${p.delay}s`,
          }}
        />
      ))}

      {/* Content layer (fades as panels leave) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ opacity: exit ? 0 : 1, transition: "opacity 0.4s ease" }}
      >
        {/* Growing calibration line */}
        <div className="relative mb-8 h-px w-[min(60vw,520px)] overflow-hidden bg-bone/15">
          <div
            className="absolute inset-y-0 left-0 bg-signal-amber"
            style={{ width: `${pct}%`, transition: "width 0.1s linear" }}
          />
        </div>

        {/* Sliced wordmark */}
        <div className="relative flex" aria-label={WORD}>
          {WORD.split("").map((ch, i) => (
            <span
              key={i}
              className="text-display font-black text-bone"
              style={{
                display: "inline-block",
                transform: assembled ? "translateY(0)" : `translateY(${i % 2 === 0 ? -102 : 102}%)`,
                opacity: assembled ? 1 : 0,
                transition: `transform 0.6s ${easing} ${i * 0.03}s, opacity 0.4s ease ${i * 0.03}s`,
                color: ch === "&" ? "hsl(var(--signal-amber))" : undefined,
              }}
            >
              {ch}
            </span>
          ))}
          {/* Amber scan line sweeping across the wordmark */}
          <div
            className="pointer-events-none absolute inset-y-0 w-[3px] bg-signal-amber"
            style={{
              left: scan ? "100%" : "0%",
              opacity: scan ? 0 : 1,
              boxShadow: "0 0 18px 2px hsl(var(--signal-amber))",
              transition: "left 0.5s ease, opacity 0.5s ease 0.2s",
            }}
          />
        </div>

        {/* Status readout */}
        <div className="mono mt-8 flex w-[min(60vw,520px)] items-center justify-between text-[11px] uppercase tracking-[0.25em] text-bone/60">
          <span>{t("preloader.status")}</span>
          <span className="tabular-nums text-bone">{String(pct).padStart(3, "0")}</span>
        </div>
      </div>
    </div>
  );
}
