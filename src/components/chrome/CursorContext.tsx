import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type CursorState = "default" | "link" | "view";

interface CursorContextValue {
  state: CursorState;
  setCursor: (s: CursorState) => void;
}

const CursorContext = createContext<CursorContextValue>({
  state: "default",
  setCursor: () => {},
});

export function CursorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorState>("default");
  const setCursor = useCallback((s: CursorState) => setState(s), []);
  return (
    <CursorContext.Provider value={{ state, setCursor }}>
      {children}
    </CursorContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCursor() {
  return useContext(CursorContext);
}

/** Convenience props to attach cursor hover behaviour to any element. */
// eslint-disable-next-line react-refresh/only-export-components
export function cursorHover(setCursor: (s: CursorState) => void, s: CursorState) {
  return {
    onMouseEnter: () => setCursor(s),
    onMouseLeave: () => setCursor("default"),
  };
}
