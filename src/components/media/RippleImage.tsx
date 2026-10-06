import { useEffect, useRef, type RefObject } from "react";
import { SmartImage } from "@/components/media/SmartImage";
import { acquireRipple } from "@/lib/ripple";
import { loadImageSource } from "@/lib/image-source";
import { cn } from "@/lib/utils";

interface Props {
  base: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /** Positions the cover. The wrapper takes the same box as the plain image. */
  className?: string;
  /**
   * What counts as "over the cover". Defaults to the image box itself; pass the
   * enclosing media box when something else (a play button) sits on top of it.
   */
  hoverRef?: RefObject<HTMLElement | null>;
}

/**
 * A cover that turns to water under the pointer: the image gains a shader layer
 * that ripples where the cursor passes and swells on its own. The layer is only
 * built on the first hover and is taken away again on the way out, so an
 * unhovered grid costs nothing.
 */
export function RippleImage({ base, alt, sizes, priority, className, hoverRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hoverRef?.current ?? wrap;
    const image = wrap?.querySelector("img");
    if (!wrap || !host || !image) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ripple = acquireRipple();
    if (!ripple) return;
    const { canvas, renderer } = ripple;

    let frame = 0;
    let timer = 0;
    let intensity = 0;
    let target = 0;
    let ready = false;
    let start = performance.now();

    const elapsed = () => (performance.now() - start) / 1000;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      intensity += (target - intensity) * 0.12;
      if (!ready) return;
      renderer.setIntensity(intensity);
      renderer.frame(elapsed());
    };

    const enter = () => {
      window.clearTimeout(timer);
      const rect = host.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      if (canvas.parentElement !== wrap) wrap.appendChild(canvas);
      start = performance.now();
      renderer.reset();
      intensity = 0;
      ready = false;
      target = 1;
      const area = rect.width * rect.height;
      renderer.resize(rect.width, rect.height, Math.min(window.devicePixelRatio || 1, area > 1_200_000 ? 1 : 2));

      const url = image.currentSrc || image.src;
      loadImageSource(url, (source) => {
        // The pointer may have left again while the cover was being fetched.
        if (!target || canvas.parentElement !== wrap) return;
        renderer.setSource(source, source.naturalWidth, source.naturalHeight);
        ready = true;
        canvas.style.opacity = "1";
      });

      if (!frame) frame = requestAnimationFrame(tick);
    };

    const leave = () => {
      target = 0;
      canvas.style.opacity = "0";
      timer = window.setTimeout(() => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        intensity = 0;
        ready = false;
        canvas.remove();
      }, 600);
    };

    const move = (event: PointerEvent) => {
      if (!ready) return;
      const rect = host.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      renderer.moveTo(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
        elapsed()
      );
    };

    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointermove", move);

    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointermove", move);
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      canvas.remove();
    };
  }, [hoverRef]);

  return (
    <div ref={wrapRef} className={cn("overflow-hidden", className)}>
      <SmartImage
        base={base}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
