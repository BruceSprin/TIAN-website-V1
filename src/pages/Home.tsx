import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { works } from "@/data/works";
import { BRAND, DISCIPLINES, brandTitle } from "@/data/site";
import { WorkCard } from "@/components/work/WorkCard";
import { SmartImage } from "@/components/media/SmartImage";
import { HomeHero } from "@/components/home/HomeHero";
import { DitherTitle } from "@/components/home/DitherTitle";
import { Footer } from "@/components/chrome/Footer";
import { useCursor, cursorHover } from "@/components/chrome/CursorContext";
import { useLocalized } from "@/hooks/useLocalized";
import { usePageTheme } from "@/hooks/usePageTheme";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { initGsap } from "@/lib/gsap";

/** Artwork that fills the hero wordmark, torn open in colour under the pointer. */
const WORDMARK_COVER =
  "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/9986d973.jpg";

/** Frame behind the closing call to action. */
const CTA_BACKDROP =
  "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/ae1468d5.png";

/** Frame behind the about block. */
const ABOUT_BACKDROP =
  "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/cb79da24.png";

/** Logo mark that sits in the empty left column of the about block. */
const ABOUT_MARK =
  "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/79729015.jpg";

export default function Home() {
  const { t } = useTranslation();
  const { text } = useLocalized();
  const { setCursor } = useCursor();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  usePageTheme("dark");
  useDocumentMeta(brandTitle(), t("home.meta.description"));

  useLayoutEffect(() => {
    if (reduced || !rootRef.current) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  const featured = works.slice(0, 3);

  return (
    <main ref={rootRef} className="min-h-screen bg-graphite text-bone">
      {/* ===== HERO: work covers behind the copy, cross-fading on a timer ===== */}
      <HomeHero>
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="signal-dot h-2 w-2 rounded-full bg-signal-amber" aria-hidden />
            <p className="label text-signal-amber">{t("home.hero.role")}</p>
          </div>

          {/* The wordmark is short enough that text-giant still leaves the whole
              hero — copy, links and status line — inside one viewport. It is
              filled with a cover, which the pointer tears open in colour. */}
          <DitherTitle
            text={t("home.hero.title")}
            image={WORDMARK_COVER}
            fit="fill"
            className="mt-8 md:mt-12"
          />

          <p className="body-lg mt-8 max-w-2xl text-bone/80">{t("home.hero.subtitle")}</p>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <Link
              to="/work"
              {...cursorHover(setCursor, "link")}
              className="label group inline-flex items-center gap-3 border-b border-bone/40 pb-2 transition-colors hover:border-signal-amber hover:text-signal-amber"
            >
              {t("common.viewWork")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>

            {BRAND.bilibili.url ? (
              <a
                href={BRAND.bilibili.url}
                target="_blank"
                rel="noopener noreferrer"
                {...cursorHover(setCursor, "link")}
                className="label text-mid transition duration-200 ease-out hover:text-signal-amber active:scale-[0.96] active:text-signal-amber"
              >
                {t("home.hero.bilibili")} · {BRAND.bilibili.handle}
              </a>
            ) : (
              <span className="label text-mid">
                {t("home.hero.bilibili")} · {BRAND.bilibili.handle}
              </span>
            )}
          </div>
        </div>

        {/* Bottom status line */}
        <div className="relative mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-foreground/18 pt-5">
          <span className="label text-mid">{text(BRAND.availability)}</span>
          <span className="mono text-[11px] tabular-nums text-mid">
            {works[0].id} — {String(works.length).padStart(2, "0")}
          </span>
        </div>
      </HomeHero>

      {/* ===== SELECTED WORK ===== */}
      <section className="px-[clamp(1rem,2vw,1.5rem)] py-24 md:py-32">
        <div data-reveal className="flex flex-wrap items-baseline justify-between gap-6">
          <h2 className="text-h1">{t("home.selected.title")}</h2>
          <Link
            to="/work"
            {...cursorHover(setCursor, "link")}
            className="label group inline-flex items-center gap-2 text-mid transition-colors hover:text-signal-amber"
          >
            {t("home.works.title")}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-16 md:grid-cols-2">
          {featured.map((work, index) => (
            <WorkCard
              key={work.slug}
              work={work}
              playing={playing}
              onPlay={setPlaying}
              priority={index === 0}
              className={index === 0 ? "md:col-span-2" : undefined}
            />
          ))}
        </div>
      </section>

      {/* ===== WHAT I DO ===== */}
      <section className="border-t border-foreground/18 px-[clamp(1rem,2vw,1.5rem)] py-24 md:py-32">
        <h2 data-reveal className="text-h1">
          {t("home.services.title")}
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {DISCIPLINES.map((discipline, index) => (
            <div
              key={discipline.title.en}
              data-reveal
              className="group relative aspect-[3/2] w-full overflow-hidden bg-graphite"
            >
              <SmartImage
                base={discipline.cover}
                alt=""
                sizes="(max-width: 768px) 100vw, 50vw"
                className="absolute inset-0 h-full w-full object-cover brightness-[0.68] transition-[filter] duration-700 ease-out group-hover:brightness-110"
              />

              {/* Scrim: a flat wash for the number, a floor of graphite for the
                  list, so the frame never fights the words on top of it. */}
              <div aria-hidden className="absolute inset-0 bg-graphite/35" />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-graphite/95 via-graphite/40 to-transparent"
              />

              <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6">
                <span className="mono text-[11px] text-signal-amber">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-h2 leading-none">{text(discipline.title)}</h3>
                  <ul className="mt-3 space-y-1">
                    {discipline.items.map((item) => (
                      <li key={item.en} className="body-lg text-bone/85">
                        {text(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="relative isolate overflow-hidden border-t border-foreground/18">
        <SmartImage
          base={ABOUT_BACKDROP}
          alt=""
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.7]"
        />
        <div aria-hidden className="absolute inset-0 bg-graphite/45" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-graphite/70 via-graphite/20 to-graphite/60"
        />

        <div className="relative grid gap-x-8 gap-y-10 px-[clamp(1rem,2vw,1.5rem)] py-24 md:grid-cols-12 md:py-32">
          <div data-reveal className="flex flex-col md:col-span-3">
            <p className="label text-mid">{t("home.about.title")}</p>
            {/* The mark leans in toward the copy, so the empty space gathers at
                the outer edge instead of between the two. */}
            <SmartImage
              base={ABOUT_MARK}
              alt=""
              className="mt-10 block aspect-square w-[clamp(140px,14vw,230px)] rounded-full object-cover transition-transform duration-500 ease-out hover:scale-105 md:ml-auto md:mr-6"
            />
          </div>
          <p data-reveal className="text-h2 leading-tight md:col-span-9">
            {t("home.about.body")}
          </p>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative isolate overflow-hidden border-t border-foreground/18">
        <SmartImage
          base={CTA_BACKDROP}
          alt=""
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[50%_35%] brightness-[0.6]"
        />
        {/* Scrim: both panels of the frame are bright, so the words need a
            floor of their own, deepest under the display line. */}
        <div aria-hidden className="absolute inset-0 bg-graphite/55" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-graphite/75 via-graphite/25 to-graphite/50"
        />

        <div
          data-reveal
          className="relative grid gap-8 px-[clamp(1rem,2vw,1.5rem)] py-24 md:grid-cols-12 md:items-end md:py-32"
        >
          <h2 className="text-display md:col-span-7">{t("home.cta.title")}</h2>
          <div className="md:col-span-4 md:col-start-9">
            {/* The frame behind this block is a crowd on their phones, so the
                ask closes on following the channel rather than getting in
                touch. Rendered as a link only once the profile URL exists. */}
            {BRAND.bilibili.url ? (
              <a
                href={BRAND.bilibili.url}
                target="_blank"
                rel="noopener noreferrer"
                {...cursorHover(setCursor, "link")}
                className="label group inline-flex items-center gap-3 border-b border-bone/40 pb-2 transition duration-200 ease-out hover:border-signal-amber hover:text-signal-amber active:scale-[0.94] active:border-signal-amber active:text-signal-amber"
              >
                {t("home.cta.follow")} · {BRAND.bilibili.handle}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </a>
            ) : (
              <span className="label text-bone/80">
                {t("home.cta.follow")} · {BRAND.bilibili.handle}
              </span>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
