import { ReactNode } from "react";
import { usePageTheme } from "@/hooks/usePageTheme";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Footer } from "@/components/chrome/Footer";
import { BRAND, brandTitle } from "@/data/site";

interface Props {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalLayout({ title, updated, children }: Props) {
  usePageTheme("light");
  useDocumentMeta(
    brandTitle(title.charAt(0) + title.slice(1).toLowerCase()),
    `Legal information for ${BRAND.name}, an independent creative studio.`
  );
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="px-[clamp(1rem,2vw,1.5rem)] pb-16 pt-32 md:pt-44">
        <h1 className="text-giant">{title}</h1>
        <p className="label mt-8 text-mid">{updated}</p>
      </section>
      <section className="px-[clamp(1rem,2vw,1.5rem)] pb-32">
        <div className="mx-auto max-w-3xl space-y-10">{children}</div>
      </section>
      <Footer />
    </main>
  );
}

export function LegalBlock({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="border-t border-foreground/16 pt-8">
      <h2 className="text-h2 mb-4">{heading}</h2>
      <p className="body-lg text-ink/80">{body}</p>
    </div>
  );
}
