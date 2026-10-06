import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createDitherRenderer, loadDitherCover } from "@/lib/dither";
import { cn } from "@/lib/utils";

/** Radius of the torn-open patch that follows the pointer, in CSS pixels. */
const REVEAL_RADIUS = 150;

interface Props {
  text: string;
  /** Artwork that fills the letterforms; the pointer tears it open in colour. */
  image?: string;
  /** `fill` squashes the whole artwork in; `cover` crops it. */
  fit?: "cover" | "fill";
  className?: string;
}

/**
 * Draws the text into an offscreen canvas at the size and font the heading
 * actually renders at, so the shader can use it as an alpha mask.
 */
function buildMask(host: HTMLElement, text: string, dpr: number) {
  const rect = host.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const styles = window.getComputedStyle(host);
  ctx.scale(dpr, dpr);
  ctx.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
    styles.letterSpacing;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";

  const metrics = ctx.measureText(text);
  const ascent = metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent || 0;
  const descent = metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent || 0;
  const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize);
  // The line box centres the glyphs with half-leading, so the baseline sits
  // this far below the top of the box.
  ctx.fillText(text, 0, (lineHeight - ascent - descent) / 2 + ascent);
  return canvas;
}

/**
 * The wordmark, filled with a cover. At rest it is almost solid ink, with the
 * cover showing through only as a sparse scatter of halftone dots; when the
 * pointer crosses it the dots ripple and tear open onto the full-colour image.
 * All of it happens in one fragment shader.
 *
 * The heading stays in the DOM for layout and screen readers, and turns
 * invisible once the canvas is drawing. Without WebGL, or with reduced motion,
 * it simply stays a plain heading.
 */
export function DitherTitle({ text, image, fit = "cover", className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const host = textRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !host || !canvas || !image) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const renderer = createDitherRenderer(canvas);
    if (!renderer) return;

    const ink = window.getComputedStyle(wrap).color.match(/[\d.]+/g);
    if (ink && ink.length >= 3) {
      renderer.setInk([Number(ink[0]) / 255, Number(ink[1]) / 255, Number(ink[2]) / 255]);
    }
    renderer.setFit(fit === "fill");

    let frame = 0;
    let visible = true;
    let ready = false;
    let cancelled = false;
    const start = performance.now();

    const paintMask = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.resize(rect.width, rect.height, dpr);
      renderer.setRevealRadius(REVEAL_RADIUS * dpr);
      const mask = buildMask(host, text, dpr);
      if (mask) renderer.setMask(mask);
    };

    // The shader only runs while it has something to show; once the pointer has
    // left and the surface has gone still, the last frame simply stays put.
    const tick = () => {
      frame = 0;
      if (!visible || !ready) return;
      renderer.frame((performance.now() - start) / 1000);
      if (!renderer.isSettled()) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && visible && ready) frame = requestAnimationFrame(tick);
    };

    paintMask();
    document.fonts?.ready.then(() => {
      if (!cancelled) paintMask();
    });

    loadDitherCover(image, (source) => {
      if (cancelled) return;
      renderer.setImage(source, source.naturalWidth, source.naturalHeight);
      ready = true;
      // Draw once before the heading goes transparent, so the swap is unseen.
      renderer.frame(0);
      setLive(true);
      wake();
    });

    const move = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      renderer.setPointer(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height
      );
    };
    const enter = () => {
      renderer.setHovered(true);
      wake();
    };
    const leave = () => renderer.setHovered(false);
    wrap.addEventListener("pointerenter", enter);
    wrap.addEventListener("pointerleave", leave);
    wrap.addEventListener("pointermove", move);

    const ro = new ResizeObserver(paintMask);
    ro.observe(wrap);

    const io = new IntersectionObserver((entries) => {
      visible = !!entries[0]?.isIntersecting;
      if (visible) wake();
    });
    io.observe(wrap);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointerenter", enter);
      wrap.removeEventListener("pointerleave", leave);
      wrap.removeEventListener("pointermove", move);
      renderer.dispose();
      setLive(false);
    };
  }, [fit, image, text]);

  return (
    <div ref={wrapRef} className={cn("relative inline-block align-top", className)}>
      {/* The heading keeps the layout and the accessible name; the canvas draws
          it. `opacity-0` rather than `text-transparent`, which tailwind-merge
          would read as a colour and let win over `text-giant`. */}
      <h1 ref={textRef} className={cn("text-giant", live && "select-none opacity-0")}>
        {text}
      </h1>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: live ? 1 : 0 }}
      />
    </div>
  );
}
