import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { BRAND } from "@/data/site";
import { useNavItems } from "@/hooks/useSiteLabels";
import { useLocalized } from "@/hooks/useLocalized";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLenisContext } from "./LenisContext";

interface Props {
  open: boolean;
  onClose: () => void;
  returnFocusTo: React.RefObject<HTMLElement>;
}

export function MobileMenu({ open, onClose, returnFocusTo }: Props) {
  const { t } = useTranslation();
  const navItems = useNavItems();
  const { text } = useLocalized();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { stop, start } = useLenisContext();

  // Lock scroll + Lenis while open, move focus in, restore on close.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      stop();
      // Focus the first link once the panel is interactive.
      const t = window.setTimeout(() => firstLinkRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
    document.body.style.overflow = "";
    start();
  }, [open, stop, start]);

  // Escape to close + focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        returnFocusTo.current?.focus();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])"
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, returnFocusTo]);

  const handleClose = () => {
    onClose();
    returnFocusTo.current?.focus();
  };

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className="fixed inset-0 z-40 flex flex-col justify-center bg-graphite px-6 transition-all duration-500 md:hidden"
      style={{
        clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
        pointerEvents: open ? "auto" : "none",
      }}
      aria-hidden={!open}
      // `inert` removes the whole subtree from tab order + a11y tree when closed.
      inert={!open}
    >
      <nav className="flex flex-col gap-2" aria-label="Mobile">
        {navItems.map((item, i) => (
          <Link
            key={item.path}
            ref={i === 0 ? firstLinkRef : undefined}
            to={item.path}
            onClick={handleClose}
            tabIndex={open ? 0 : -1}
            className="group flex items-baseline gap-4 transition-opacity"
            style={{
              transform: open ? "translateY(0)" : "translateY(2rem)",
              opacity: open ? 1 : 0,
              transitionDelay: open ? `${120 + i * 80}ms` : "0ms",
              transitionDuration: "500ms",
            }}
          >
            <span className="mono text-sm text-signal-amber">0{i + 1}</span>
            <span className="text-giant text-bone">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div
        className="mt-12 flex items-center gap-3 transition-opacity"
        style={{ opacity: open ? 1 : 0, transitionDelay: open ? "400ms" : "0ms", transitionDuration: "500ms" }}
      >
        <span className="signal-dot h-2 w-2 rounded-full bg-signal-amber" aria-hidden />
        <span className="label text-bone/70">{text(BRAND.availability)}</span>
      </div>
      <div
        className="mt-8 transition-opacity"
        style={{ opacity: open ? 1 : 0, transitionDelay: open ? "480ms" : "0ms", transitionDuration: "500ms" }}
      >
        <span className="label mb-3 block text-bone/50">{t("common.language")}</span>
        <LanguageSwitcher className="h-10 w-fit min-w-[140px] border-bone/25 bg-transparent text-xs text-bone" />
      </div>
    </div>
  );
}
