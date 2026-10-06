import { useLayoutEffect } from "react";

type Theme = "light" | "dark";

/**
 * Sets the editorial theme (paper/ink background) on the document body before
 * paint. It does NOT reset on unmount — the next page sets its own theme, so
 * dark→dark and light→light transitions never flash the opposite background.
 */
export function usePageTheme(theme: Theme) {
  useLayoutEffect(() => {
    document.body.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }, [theme]);
}
