import { useState } from "react";
import { OPEN_ROLES } from "@/data/site";
import { useCursor, cursorHover } from "@/components/chrome/CursorContext";

export function OpenRoles() {
  const { setCursor } = useCursor();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {OPEN_ROLES.map((role, i) => {
        const isOpen = open === i;
        return (
          <div key={role.title} className="border-t border-foreground/16">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              {...cursorHover(setCursor, "link")}
              className="flex w-full items-center justify-between gap-4 py-6 text-left"
              aria-expanded={isOpen}
              aria-controls={`role-panel-${i}`}
            >
              <span className="text-h2">{role.title}</span>
              <span
                className="relative flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-300"
                style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                aria-hidden
              >
                <span className="absolute h-[2px] w-5 bg-current" />
                <span className="absolute h-5 w-[2px] bg-current" />
              </span>
            </button>
            <div
              id={`role-panel-${i}`}
              role="region"
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <p className="body-lg max-w-2xl pb-8 text-ink/80">{role.body}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div className="border-t border-foreground/16" />
    </div>
  );
}
