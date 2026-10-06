import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { RippleImage } from "@/components/media/RippleImage";
import { RevealText } from "@/components/work/RevealText";
import { useCursor, cursorHover } from "@/components/chrome/CursorContext";
import { useCategoryLabel } from "@/hooks/useSiteLabels";
import { useLocalized } from "@/hooks/useLocalized";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { bilibiliEmbedUrl, hasPlayerSource, isPlaceholder, type Work } from "@/data/works";

interface WorkCardProps {
  work: Work;
  /** Slug of the work whose video is currently playing, or null. */
  playing: string | null;
  onPlay: (slug: string | null) => void;
  className?: string;
  /** Eager-load the cover (use for the first card above the fold). */
  priority?: boolean;
}

/**
 * One work: a 16:9 media box that plays the MP4 in place, plus its metadata.
 * A work with no `video` yet renders the poster and a pending label instead of
 * a broken player.
 */
export function WorkCard({ work, playing, onPlay, className, priority }: WorkCardProps) {
  const { t } = useTranslation();
  const { text } = useLocalized();
  const categoryLabel = useCategoryLabel();
  const { setCursor } = useCursor();
  const reduced = useReducedMotion();
  const mediaRef = useRef<HTMLDivElement>(null);
  // A `video` path that 404s or uses an unplayable codec falls back to the
  // poster instead of leaving a black, broken player on the page.
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [work.video]);

  // The work pops in once, the first time it reaches the viewport: the frame
  // lifts into place while its cover settles out of a slight zoom. The title
  // and its meta line fade in on their own.
  useLayoutEffect(() => {
    const box = mediaRef.current;
    if (!box) return;
    const cover = box.querySelector("img");

    const settle = () => {
      gsap.set(box, { clearProps: "opacity,transform" });
      if (cover) gsap.set(cover, { clearProps: "transform" });
    };
    if (reduced) {
      settle();
      return;
    }

    gsap.set(box, { opacity: 0, y: 26 });
    if (cover) gsap.set(cover, { scale: 1.06 });

    let tl: gsap.core.Timeline | null = null;
    const play = () => {
      tl = gsap.timeline({ onComplete: settle });
      tl.to(box, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0);
      if (cover) tl.to(cover, { scale: 1, duration: 1.3, ease: "power3.out" }, 0);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        io.disconnect();
        // Filtered back into a slot above the fold: no second entrance.
        if (entry.boundingClientRect.top < 0) settle();
        else play();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(box);

    return () => {
      io.disconnect();
      tl?.kill();
    };
  }, [reduced]);

  const hasVideo = !!work.video && !failed;
  const embedUrl = work.bilibili ? bilibiliEmbedUrl(work.bilibili) : null;
  const canPlay = hasVideo || !!embedUrl;
  const isPlaying = playing === work.slug && canPlay;
  const title = text(work.title);
  const subtitle = work.subtitle ? text(work.subtitle) : "";

  return (
    <article className={className}>
      <div ref={mediaRef} className="relative aspect-video w-full overflow-hidden bg-graphite/60">
        {isPlaying && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            scrolling="no"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : isPlaying ? (
          <video
            src={work.video}
            controls
            autoPlay
            playsInline
            onError={() => {
              setFailed(true);
              onPlay(null);
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            {work.cover ? (
              <RippleImage
                base={work.cover}
                alt={work.coverAlt ? text(work.coverAlt) : title}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={priority}
                className="absolute inset-0"
                hoverRef={mediaRef}
              />
            ) : (
              /* Typographic title card until a real cover exists. */
              <div
                className="grain absolute inset-0 flex flex-col justify-between p-6"
                style={{
                  background: `linear-gradient(150deg, ${work.accent}2E 0%, rgba(8,9,10,0) 62%)`,
                }}
              >
                <span className="mono text-[11px] tabular-nums text-bone/70">
                  {work.id} · {work.duration}
                </span>
                <span className="text-h2 max-w-[86%] break-words leading-none text-bone">
                  {title}
                </span>
              </div>
            )}

            {/* Play affordance */}
            <div className="absolute inset-0 flex items-center justify-center">
              {canPlay ? (
                <button
                  type="button"
                  onClick={() => onPlay(work.slug)}
                  aria-label={`${t("player.play")} — ${title}`}
                  {...cursorHover(setCursor, "view")}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-bone/40 bg-graphite/45 text-bone backdrop-blur-sm transition-colors duration-300 hover:border-signal-amber hover:bg-signal-amber hover:text-graphite"
                >
                  <Play className="h-5 w-5" aria-hidden />
                </button>
              ) : (
                <span className="label border border-bone/25 bg-graphite/45 px-3 py-2 text-bone/70 backdrop-blur-sm">
                  {hasPlayerSource(work) ? t("player.unavailable") : t("player.pending")}
                </span>
              )}
            </div>

            {/* Corner index */}
            <span className="mono absolute left-4 top-4 text-[11px] tabular-nums text-bone/90 mix-blend-difference">
              {work.id}
            </span>
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-foreground/18 pt-4">
        <div className="min-w-0">
          <h3 className="text-h2 leading-none">
            <Link
              to={`/work/${work.slug}`}
              {...cursorHover(setCursor, "link")}
              className="transition-colors duration-300 hover:text-signal-amber"
            >
              <RevealText text={title} />
            </Link>
          </h3>
          {subtitle && <p className="body-lg mt-1 text-mid">{subtitle}</p>}
          <p className="mono mt-2 text-[11px] uppercase tracking-[0.14em] text-mid">
            <RevealText
              text={`${work.categories.map((category) => categoryLabel(category)).join(" · ")} · ${work.year}`}
            />
          </p>
        </div>
        {isPlaceholder(work) && (
          <span className="label shrink-0 text-signal-amber">{t("work.placeholderNote")}</span>
        )}
      </div>
    </article>
  );
}
