import { Link } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { BRAND, SOCIALS } from "@/data/site";
import { SmartImage } from "@/components/media/SmartImage";
import { useNavItems } from "@/hooks/useSiteLabels";
import { useCursor, cursorHover } from "./CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { initGsap } from "@/lib/gsap";

/** Frame behind the closing block. */
const BACKDROP =
  "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/0ff3eb9e.png";

export function Footer() {
  const { t } = useTranslation();
  const { setCursor } = useCursor();
  const navItems = useNavItems();
  const reduced = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced || !footerRef.current) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      // Footer content rises in, lightly bound to scroll.
      gsap.fromTo(
        contentRef.current,
        { y: 80, opacity: 0.4 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "top 50%",
            scrub: true,
          },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <footer
      ref={footerRef}
      className="relative isolate w-full overflow-hidden border-t border-foreground/16 bg-ink px-[clamp(1rem,2vw,1.5rem)] pb-24 pt-20 text-paper"
    >
      <SmartImage
        base={BACKDROP}
        alt=""
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover brightness-[0.7]"
      />
      {/* Scrim: the frame is neon on near-black, so it needs holding back to
          keep the giant nav and the form labels off it. */}
      <div aria-hidden className="absolute inset-0 bg-ink/50" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/20 to-ink/75"
      />

      <div ref={contentRef} className="relative mx-auto max-w-[1920px]">
        {/* Giant nav */}
        <nav className="flex flex-col" aria-label="Footer">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              {...cursorHover(setCursor, "link")}
              className="text-giant leading-[0.9] text-paper transition-colors duration-300 hover:text-signal"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Socials — a link once the account URL exists */}
        <div className="mt-20 flex flex-col items-start gap-3 md:items-end">
          <p className="label mb-3 text-mid">{t("footer.social")}</p>
          {SOCIALS.map((social) =>
            social.href ? (
              <a
                key={social.short}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                {...cursorHover(setCursor, "link")}
                className="group text-h2 leading-none text-paper transition duration-300 hover:text-signal active:scale-[0.96] active:text-signal"
              >
                {/* The whole label stays put: the handle is the point of the
                    row, so it is never swapped away on hover. */}
                {social.full} · {social.handle}
              </a>
            ) : (
              <span key={social.short} className="text-h2 leading-none text-paper/45">
                {social.full} · {social.handle}
              </span>
            )
          )}
        </div>

        {/* Bottom line */}
        <div className="mt-20 flex flex-col gap-4 border-t border-paper/16 pt-6 text-mid md:flex-row md:items-center md:justify-between">
          <p className="label">
            &copy; {BRAND.year} {BRAND.name}. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              {...cursorHover(setCursor, "link")}
              className="label transition-colors hover:text-paper"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              to="/terms"
              {...cursorHover(setCursor, "link")}
              className="label transition-colors hover:text-paper"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
