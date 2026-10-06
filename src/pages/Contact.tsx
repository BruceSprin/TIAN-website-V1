import { usePageTheme } from "@/hooks/usePageTheme";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocalized } from "@/hooks/useLocalized";
import { BRAND, brandTitle } from "@/data/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { OpenRoles } from "@/components/contact/OpenRoles";
import { Footer } from "@/components/chrome/Footer";

export default function Contact() {
  usePageTheme("light");
  const { text } = useLocalized();
  useDocumentMeta(
    brandTitle("Contact"),
    `Tell us about your project. ${BRAND.name} works from ${BRAND.cityShort} with teams everywhere.`
  );

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Two-column start */}
      <section className="grid gap-12 px-[clamp(1rem,2vw,1.5rem)] pb-16 pt-32 md:grid-cols-12 md:pt-40">
        {/* Left status column */}
        <div className="md:col-span-5">
          <h1 className="text-display mb-10">
            START A
            <br />
            SIGNAL
          </h1>

          <div className="mb-8 flex items-center gap-3">
            <span className="signal-dot h-2.5 w-2.5 rounded-full bg-signal-amber" aria-hidden />
            <span className="label">{text(BRAND.availability)}</span>
          </div>

          <div className="space-y-5 border-t border-foreground/18 pt-6">
            {[
              { k: "Based in", v: BRAND.city },
              { k: "Time zone", v: BRAND.timezone },
              { k: "Response", v: BRAND.responseTime },
            ]
              .filter((row) => row.v)
              .map((row) => (
                <div key={row.k} className="flex items-baseline justify-between gap-4">
                  <span className="label text-mid">{row.k}</span>
                  <span className="mono text-sm">{row.v}</span>
                </div>
              ))}
            {BRAND.email && (
              <div className="flex items-baseline justify-between gap-4 border-t border-foreground/18 pt-5">
                <span className="label text-mid">Direct</span>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="mono text-sm underline decoration-signal-amber underline-offset-4 transition-colors hover:text-signal-amber"
                >
                  {BRAND.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right form column */}
        <div className="md:col-span-6 md:col-start-7">
          <ContactForm />
        </div>
      </section>

      {/* Open roles */}
      <section className="px-[clamp(1rem,2vw,1.5rem)] py-24">
        <div className="grid gap-8 md:grid-cols-12">
          <p className="label text-mid md:col-span-3">Open Roles</p>
          <div className="md:col-span-9">
            <OpenRoles />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
