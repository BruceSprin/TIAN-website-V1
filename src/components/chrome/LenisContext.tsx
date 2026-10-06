import { createContext, useContext, useRef, useCallback, ReactNode } from "react";
import type Lenis from "lenis";

interface LenisContextValue {
  lenisRef: React.MutableRefObject<Lenis | null>;
  stop: () => void;
  start: () => void;
  scrollToTop: (immediate?: boolean) => void;
}

const LenisContext = createContext<LenisContextValue | null>(null);

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);
  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);
  const scrollToTop = useCallback((immediate = false) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <LenisContext.Provider value={{ lenisRef, stop, start, scrollToTop }}>
      {children}
    </LenisContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLenisContext() {
  const ctx = useContext(LenisContext);
  if (!ctx) {
    throw new Error("useLenisContext must be used within LenisProvider");
  }
  return ctx;
}
