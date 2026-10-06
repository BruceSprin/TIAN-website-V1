import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageTheme } from "@/hooks/usePageTheme";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCursor, cursorHover } from "@/components/chrome/CursorContext";
import { initGsap } from "@/lib/gsap";
import { useLocalized } from "@/hooks/useLocalized";
import { DISCIPLINES, STUDIO_COPY, brandTitle } from "@/data/site";
import { SmartImage } from "@/components/media/SmartImage";
import { Footer } from "@/components/chrome/Footer";

export default function Studio() {
  const { t } = useTranslation();
  usePageTheme("light");
  const { text } = useLocalized();
  useDocumentMeta(brandTitle(t("nav.studio")), text(STUDIO_COPY.metaDescription));
  const reduced = useReducedMotion();
  const { setCursor } = useCursor();
  const rootRef = useRef<HTMLDivElement>(null);
  const [openService, setOpenService] = useState<number | null>(0);

  const { about, process, whatWeDo } = STUDIO_COPY;
  const hasPortrait = !!about.portrait;

  useLayoutEffect(() => {
    if (reduced || !rootRef.current) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: () => (el.dataset.dir === "up" ? -60 : 60),
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
      // Staggered reveal for the process steps.
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const cards = group.querySelectorAll<HTMLElement>("[data-card]");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: group, start: "top 80%" },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <main ref={rootRef} className="min-h-screen bg-paper text-ink">
      {/* ===== HERO: manifesto + status column ===== */}
      <section className="grid gap-8 px-[clamp(1rem,2vw,1.5rem)] pb-24 pt-32 md:grid-cols-12 md:pt-44">
        {/* Sized so each manifesto line holds on one line at md and up —
            at text-giant every phrase wrapped after its first word. */}
        <h1 className="text-display md:col-span-9">
          {STUDIO_COPY.manifesto.map((line, i) => (
            <Fragment key={line.en}>
              {text(line)}
              {i < STUDIO_COPY.manifesto.length - 1 && <br />}
            </Fragment>
          ))}
        </h1>
        <div
          data-parallax
          data-dir="down"
          className="flex flex-col justify-end gap-6 md:col-span-3 md:col-start-10"
        >
          {STUDIO_COPY.statusRows.map((row) => (
            <div key={row.k.en} className="border-t border-foreground/18 pt-3">
              <span className="label mb-1 block text-mid">{text(row.k)}</span>
              <span className="mono text-sm">{text(row.v)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT: optional portrait + one composed statement ===== */}
      <section className="grid gap-10 px-[clamp(1rem,2vw,1.5rem)] py-20 md:grid-cols-12">
        {hasPortrait ? (
          <>
            <div className="md:col-span-4" data-parallax data-dir="up">
              <div className="grain relative aspect-[4/5] overflow-hidden">
                <SmartImage
                  base={about.portrait}
                  alt={text(about.portraitAlt)}
                  widths={[640, 960]}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-7 md:col-start-6 md:self-center">
              <p className="label mb-8 text-mid">{text(about.label)}</p>
              <p className="text-h2 leading-tight">{text(about.lead)}</p>
              <p className="body-lg mt-8 max-w-xl text-ink/75">{text(about.support)}</p>
            </div>
          </>
        ) : (
          <>
            <p className="label text-mid md:col-span-3">{text(about.label)}</p>
            <div className="md:col-span-8 md:col-start-4">
              <p className="text-h2 leading-tight">{text(about.lead)}</p>
              <p className="body-lg mt-8 max-w-xl text-ink/75">{text(about.support)}</p>
            </div>
          </>
        )}
      </section>

      {/* ===== WHAT I DO: expandable discipline track ===== */}
      <section className="px-[clamp(1rem,2vw,1.5rem)] py-20">
        <p className="label mb-10 text-mid">{text(whatWeDo.label)}</p>
        <div className="border-t border-foreground/18">
          {DISCIPLINES.map((d, i) => {
            const open = openService === i;
            return (
              <div key={d.title.en} className="border-b border-foreground/18">
                <button
                  type="button"
                  onClick={() => setOpenService(open ? null : i)}
                  {...cursorHover(setCursor, "link")}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left"
                  aria-expanded={open}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="mono text-sm text-signal-amber">0{i + 1}</span>
                    <span className="text-h2">{text(d.title)}</span>
                  </span>
                  <span
                    className="mono text-2xl transition-transform duration-300"
                    style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-500 ease-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <ul className="flex flex-wrap gap-x-8 gap-y-2 pb-8 pl-12">
                      {d.items.map((item) => (
                        <li key={item.en} className="body-lg text-ink/75">
                          {text(item)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== HOW I WORK: four method steps ===== */}
      <section className="px-[clamp(1rem,2vw,1.5rem)] py-20">
        <p className="label mb-10 text-mid">{text(process.label)}</p>
        <div data-stagger className="grid gap-x-6 gap-y-12 md:grid-cols-2">
          {process.steps.map((step, i) => (
            <div key={step.title.en} data-card className="border-t border-foreground/18 pt-6">
              <span className="mono mb-5 block text-sm text-signal-amber">0{i + 1}</span>
              <h3 className="text-h2 mb-4">{text(step.title)}</h3>
              <p className="body-lg max-w-lg text-ink/75">{text(step.body)}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
