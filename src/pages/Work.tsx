import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { WORK_CATEGORIES, works, type WorkCategory } from "@/data/works";
import { brandTitle } from "@/data/site";
import { WorkCard } from "@/components/work/WorkCard";
import { SmartImage } from "@/components/media/SmartImage";
import { Footer } from "@/components/chrome/Footer";
import { useCategoryLabel } from "@/hooks/useSiteLabels";
import { usePageTheme } from "@/hooks/usePageTheme";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, Flip } from "@/lib/gsap";

type Filter = "all" | WorkCategory;

/** Frame behind the page header and filter rail. */
const BACKDROP =
  "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/b0853486.png";

export default function Work() {
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<Filter>("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const flipRef = useRef<gsap.core.Timeline | null>(null);

  usePageTheme("dark");
  useDocumentMeta(brandTitle(t("work.title")), t("work.meta.description"));

  const visibleSlugs = useMemo(() => {
    return new Set(
      (active === "all" ? works : works.filter((w) => w.categories.includes(active))).map(
        (w) => w.slug
      )
    );
  }, [active]);

  useLayoutEffect(() => {
    if (!gridRef.current) return;
    const items = gridRef.current.querySelectorAll<HTMLElement>("[data-item]");

    const applyDisplay = () => {
      items.forEach((el) => {
        el.style.display = el.dataset.visible === "true" ? "" : "none";
      });
    };

    // Cancel any in-flight FLIP so rapid category clicks don't stack animations.
    if (flipRef.current) {
      flipRef.current.kill();
      flipRef.current = null;
    }

    if (firstRender.current || reduced) {
      firstRender.current = false;
      items.forEach((el) => {
        el.style.opacity = "1";
        el.style.display = el.dataset.visible === "true" ? "" : "none";
      });
      return;
    }

    const state = Flip.getState(items, { props: "opacity" });
    items.forEach((el) => {
      const show = el.dataset.visible === "true";
      el.style.display = "";
      el.style.opacity = show ? "1" : "0";
      el.style.transform = show ? "" : "scale(0.96)";
    });

    flipRef.current = Flip.from(state, {
      duration: 0.7,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      onEnter: (els) => Flip.fromTo(Flip.getState(els), { opacity: 0 }, { opacity: 1, duration: 0.4 }),
      onComplete: () => {
        items.forEach((el) => (el.style.transform = ""));
        applyDisplay();
        flipRef.current = null;
      },
    });
  }, [visibleSlugs, reduced]);

  const filters: Filter[] = ["all", ...WORK_CATEGORIES];

  return (
    <main className="min-h-screen bg-graphite text-bone">
      {/* ===== HEADER + FILTER, over one backdrop ===== */}
      <div className="relative isolate overflow-hidden">
        <SmartImage
          base={BACKDROP}
          alt=""
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.7]"
        />
        {/* Scrim, so the display line and the filter labels stay off the frame. */}
        <div aria-hidden className="absolute inset-0 bg-graphite/45" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-graphite/70 via-graphite/20 to-graphite/60"
        />

        <section className="relative px-[clamp(1rem,2vw,1.5rem)] pb-14 pt-28 md:pt-36">
          <h1 className="text-giant">{t("work.title")}</h1>
          <p className="body-lg mt-8 max-w-2xl text-bone/75">{t("work.intro")}</p>
        </section>

        {/* ===== FILTER RAIL ===== */}
        <section className="relative px-[clamp(1rem,2vw,1.5rem)] pb-14">
          <p className="label mb-8 text-mid">{t("work.filter")}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-foreground/18 pb-6">
            {filters.map((filter) => {
              const on = active === filter;
              const label = filter === "all" ? t("nav.work") : categoryLabel(filter);
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActive(filter)}
                  aria-pressed={on}
                  className="group flex items-center gap-2 py-1"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: on ? "hsl(var(--signal-amber))" : "transparent",
                      border: on ? "none" : "1px solid hsl(var(--bone) / 0.4)",
                    }}
                  />
                  <span
                    className="mono text-sm uppercase tracking-[0.14em] transition-colors duration-300"
                    style={{ color: on ? "hsl(var(--bone))" : "hsl(var(--mid))" }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ===== GRID ===== */}
      <section className="px-[clamp(1rem,2vw,1.5rem)] pb-32">
        {visibleSlugs.size === 0 ? (
          <p className="body-lg text-mid">{t("work.empty")}</p>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2">
            {works.map((work) => (
              <div
                key={work.slug}
                data-item
                data-visible={visibleSlugs.has(work.slug) ? "true" : "false"}
              >
                <WorkCard work={work} playing={playing} onPlay={setPlaying} />
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
