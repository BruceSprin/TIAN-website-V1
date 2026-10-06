import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BRAND } from "@/data/site";
import { useNavItems } from "@/hooks/useSiteLabels";
import { useCursor, cursorHover } from "./CursorContext";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "@/components/language-switcher";

const NAV_INDEX: Record<string, string> = {
  "/work": "01",
  "/studio": "02",
  "/contact": "03",
};

export function FixedNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { setCursor } = useCursor();
  const navItems = useNavItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/work"
      ? location.pathname === "/work" || location.pathname.startsWith("/work/")
      : location.pathname === path;

  return (
    <>
      {/* ============ DESKTOP ============ */}
      {/* Left vertical brand rail */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-[70] hidden w-[52px] md:block">
        <div className="blend-diff flex h-full flex-col items-center justify-between py-5 text-bone">
          <Link
            to="/"
            {...cursorHover(setCursor, "link")}
            className="group pointer-events-auto flex flex-col items-center gap-3"
            aria-label={`${BRAND.spokenName} — ${t("nav.home")}`}
          >
            <span className="signal-dot h-2 w-2 rounded-full bg-signal-amber" aria-hidden />
            <span
              className="mono text-[11px] uppercase tracking-[0.3em] transition-[letter-spacing] duration-300 group-hover:tracking-[0.45em]"
              style={{ writingMode: "vertical-rl" }}
            >
              {BRAND.name}
            </span>
          </Link>
          <span
            className="mono text-[10px] uppercase tracking-[0.25em] text-bone/50"
            style={{ writingMode: "vertical-rl" }}
            aria-hidden
          >
            {BRAND.year}
          </span>
        </div>
      </div>

      {/* Top-right nav + language switcher */}
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed right-0 top-0 z-[70] hidden md:flex md:items-start"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-24 w-[520px]"
          style={{ background: "linear-gradient(200deg, rgba(8,9,10,0.5) 0%, transparent 70%)" }}
        />
        <div className="blend-diff relative flex items-start gap-7 px-[clamp(1rem,2vw,1.5rem)] py-5 text-bone">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                {...cursorHover(setCursor, "link")}
                className="group pointer-events-auto relative flex items-center gap-2 py-1"
              >
                {active && <span className="h-[2px] w-4 bg-signal-amber" aria-hidden />}
                <span className="label relative overflow-hidden">
                  <span className="relative z-10">{item.label}</span>
                  {/* scan-line sweep on hover */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-[1px] w-full -translate-x-full bg-signal-amber transition-transform duration-500 ease-out group-hover:translate-x-0"
                  />
                </span>
                <span className="mono text-[10px] text-signal-amber/80">
                  {active ? NAV_INDEX[item.path] : ""}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="pointer-events-auto py-4 pl-2 pr-[clamp(1rem,2vw,1.5rem)]">
          <LanguageSwitcher className="h-9 min-w-[116px] border-bone/25 bg-transparent text-[11px] uppercase tracking-[0.14em] text-bone" />
        </div>
      </nav>

      {/* ============ MOBILE ============ */}
      <div className="blend-diff pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 text-bone md:hidden">
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-2 text-sm font-black tracking-tight"
        >
          <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal-amber" aria-hidden />
          {BRAND.name}
        </Link>
        <button
          ref={hamburgerRef}
          type="button"
          aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="pointer-events-auto relative flex h-11 w-11 items-center justify-center"
        >
          <span
            className="absolute h-[2px] w-7 bg-bone transition-transform duration-300"
            style={{ transform: menuOpen ? "rotate(45deg)" : "translateY(-5px)" }}
          />
          <span
            className="absolute h-[2px] w-7 bg-bone transition-transform duration-300"
            style={{ transform: menuOpen ? "rotate(-45deg)" : "translateY(5px)" }}
          />
        </button>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        returnFocusTo={hamburgerRef}
      />
    </>
  );
}
