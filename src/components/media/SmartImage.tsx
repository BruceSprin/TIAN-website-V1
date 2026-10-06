import { CSSProperties } from "react";

/**
 * Responsive WebP image. Source assets live in /img as
 * `<name>-<width>.webp` at widths 640/960/1440/1920 (capped at native size).
 * Pass the base path without extension, e.g. "/img/ai-h".
 *
 * An absolute URL is served as-is: a remote single-file asset has no width
 * variants to offer, so the srcSet is skipped rather than pointed at files
 * that do not exist.
 */
interface SmartImageProps {
  base: string;
  alt: string;
  /** Available widths for this asset, ascending. */
  widths?: number[];
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  draggable?: boolean;
}

const DEFAULT_WIDTHS = [640, 960, 1440, 1920];

export function SmartImage({
  base,
  alt,
  widths = DEFAULT_WIDTHS,
  sizes = "100vw",
  className,
  style,
  priority = false,
  draggable = false,
}: SmartImageProps) {
  const isRemote = /^https?:\/\//.test(base);
  const basePath = base.startsWith('/') ? `${import.meta.env.BASE_URL}${base.slice(1)}` : base;
  const srcSet = isRemote
    ? undefined
    : widths.map((w) => `${basePath}-${w}.webp ${w}w`).join(", ");
  const fallback = isRemote ? base : `${basePath}-${widths[widths.length - 1]}.webp`;

  return (
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      draggable={draggable}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}
