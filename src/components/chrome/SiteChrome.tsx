import { ReactNode, useState, useCallback } from "react";
import Lenis from "lenis";
import { CursorProvider } from "./CursorContext";
import { LenisProvider, useLenisContext } from "./LenisContext";
import { Cursor } from "./Cursor";
import { FixedNav } from "./FixedNav";
import { Preloader } from "./Preloader";
import { PageTransition } from "./PageTransition";
import { useLenis } from "@/hooks/useLenis";

function ChromeInner({ children }: { children?: ReactNode }) {
  const { lenisRef } = useLenisContext();
  useLenis(lenisRef as React.MutableRefObject<Lenis | null>);

  // Full calibration on first visit of the session; a 500ms version afterwards.
  const [seen] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("ss-loaded") === "1";
  });
  const [done, setDone] = useState(false);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem("ss-loaded", "1");
    setDone(true);
  }, []);

  return (
    <>
      {!done && <Preloader onComplete={handleComplete} quick={seen} />}
      <Cursor />
      <FixedNav />
      <PageTransition />
    </>
  );
}

export function SiteChrome({ children }: { children?: ReactNode }) {
  return (
    <LenisProvider>
      <CursorProvider>
        <ChromeInner>{children}</ChromeInner>
      </CursorProvider>
    </LenisProvider>
  );
}
