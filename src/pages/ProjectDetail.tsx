import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { bilibiliEmbedUrl, getNextWork, getWork, hasPlayerSource, isPlaceholder, titleWeight } from "@/data/works";
import { brandTitle } from "@/data/site";
import { RippleImage } from "@/components/media/RippleImage";
import { Footer } from "@/components/chrome/Footer";
import { useCursor, cursorHover } from "@/components/chrome/CursorContext";
import { useCategoryLabel } from "@/hooks/useSiteLabels";
import { useLocalized } from "@/hooks/useLocalized";
import { usePageTheme } from "@/hooks/usePageTheme";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-foreground/18 py-4">
      <span className="label mb-1 block text-mid">{label}</span>
      <span className="block text-sm leading-snug">{value}</span>
    </div>
  );
}

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const { text } = useLocalized();
  const categoryLabel = useCategoryLabel();
  const { setCursor } = useCursor();
  const work = getWork(slug);
  const mediaRef = useRef<HTMLDivElement>(null);
  // A missing or unplayable file falls back to the poster instead of a black player.
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [work?.video]);

  usePageTheme("dark");
  useDocumentMeta(
    brandTitle(
      work
        ? work.subtitle
          ? `${text(work.title)} — ${text(work.subtitle)}`
          : text(work.title)
        : t("work.title")
    ),
    work ? text(work.blurb) : t("work.meta.description")
  );

  if (!work) {
    return (
      <main className="flex min-h-screen flex-col justify-center bg-graphite px-[clamp(1rem,2vw,1.5rem)] text-bone">
        <h1 className="text-giant">{t("notFound.title")}</h1>
        <p className="body-lg mt-6 text-bone/70">{t("notFound.body")}</p>
        <Link
          to="/work"
          {...cursorHover(setCursor, "link")}
          className="label mt-10 inline-flex w-fit items-center gap-2 border-b border-bone/40 pb-1 transition-colors hover:text-signal-amber"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("work.title")}
        </Link>
      </main>
    );
  }

  const title = text(work.title);
  const subtitle = work.subtitle ? text(work.subtitle) : "";
  // Long CJK titles overflow the display size, so they step down one level.
  const fitsDisplay = titleWeight(title) <= 8;
  const embedUrl = work.bilibili ? bilibiliEmbedUrl(work.bilibili) : null;
  const next = getNextWork(work.slug);

  return (
    <main className="min-h-screen bg-graphite text-bone">
      {/* ===== HEADER ===== */}
      <section className="px-[clamp(1rem,2vw,1.5rem)] pb-14 pt-28 md:pt-36">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="mono text-[11px] tabular-nums text-mid">
            {work.id} · {work.year} · {work.duration}
          </span>
          <span className="label" style={{ color: work.accent }}>
            {work.categories.map((category) => categoryLabel(category)).join(" · ")}
          </span>
          {isPlaceholder(work) && (
            <span className="label text-signal-amber">{t("work.placeholderNote")}</span>
          )}
        </div>

        <h1 className={`mt-8 break-words ${fitsDisplay ? "text-giant" : "text-h1"}`}>{title}</h1>
        {subtitle && <p className="text-h2 mt-4 text-mid">{subtitle}</p>}
        <p className="body-lg mt-8 max-w-2xl text-bone/75">{text(work.blurb)}</p>
      </section>

      {/* ===== PLAYER ===== */}
      <section className="px-[clamp(1rem,2vw,1.5rem)] pb-20">
        <div ref={mediaRef} className="relative aspect-video w-full overflow-hidden bg-graphite/60">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              scrolling="no"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : work.video && !failed ? (
            <video
              src={work.video}
              controls
              playsInline
              preload="metadata"
              onError={() => setFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              {work.cover ? (
                <RippleImage
                  base={work.cover}
                  alt={work.coverAlt ? text(work.coverAlt) : title}
                  sizes="100vw"
                  priority
                  className="absolute inset-0"
                  hoverRef={mediaRef}
                />
              ) : (
                <div
                  className="grain absolute inset-0 flex flex-col justify-between p-8"
                  style={{
                    background: `linear-gradient(150deg, ${work.accent}2E 0%, rgba(8,9,10,0) 62%)`,
                  }}
                >
                  <span className="mono text-[11px] tabular-nums text-bone/70">
                    {work.id} · {work.duration}
                  </span>
                  <span
                    className={`break-words leading-none text-bone ${fitsDisplay ? "text-display" : "text-h1"}`}
                  >
                    {title}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="label inline-flex items-center gap-3 border border-bone/25 bg-graphite/45 px-4 py-3 text-bone/70 backdrop-blur-sm">
                  <Play className="h-4 w-4" aria-hidden />
                  {hasPlayerSource(work) ? t("player.unavailable") : t("player.pending")}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== DETAIL ===== */}
      <section className="grid gap-12 px-[clamp(1rem,2vw,1.5rem)] pb-24 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="label mb-6 text-mid">{t("detail.about")}</p>
          <p className="text-h2 leading-tight">{text(work.description)}</p>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <MetaRow label={t("detail.category")} value={work.categories.map((category) => categoryLabel(category)).join(", ")} />
          <MetaRow label={t("detail.role")} value={text(work.role)} />
          <MetaRow label={t("detail.year")} value={`${work.year} · ${work.duration}`} />
        </div>
      </section>

      {/* ===== NEXT ===== */}
      <section className="border-t border-foreground/18 px-[clamp(1rem,2vw,1.5rem)] py-16">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Link
            to="/work"
            {...cursorHover(setCursor, "link")}
            className="label group inline-flex items-center gap-2 text-mid transition-colors hover:text-signal-amber"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("detail.backToWork")}
          </Link>

          <Link
            to={`/work/${next.slug}`}
            {...cursorHover(setCursor, "link")}
            className="group text-right"
          >
            <span className="label block text-mid">{t("detail.next")}</span>
            <span className="text-h1 mt-3 inline-flex items-center gap-4 transition-colors group-hover:text-signal-amber">
              {text(next.title)}
              <ArrowRight
                className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2"
                aria-hidden
              />
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
