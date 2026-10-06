import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { PROJECT_TYPES, BUDGET_RANGES } from "@/data/site";
import { useCursor, cursorHover } from "@/components/chrome/CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { initGsap } from "@/lib/gsap";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  company: z.string().min(1, "Please tell us your company or brand."),
  website: z.string().optional(),
  projectType: z.string().min(1, "Please choose a project type."),
  budget: z.string().min(1, "Please choose a budget range."),
  message: z.string().min(10, "Please tell us a little about the project."),
  company_url: z.string().max(0).optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

/** Bottom-line input with a label that floats up on focus/fill. */
function Field({
  id,
  label,
  type = "text",
  register,
  error,
  required,
}: {
  id: keyof FormValues;
  label: string;
  type?: string;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="relative pt-6">
      <input
        id={id}
        type={type}
        placeholder=" "
        aria-invalid={!!error}
        {...register(id)}
        className="peer w-full border-b border-ink/25 bg-transparent py-2 text-ink transition-colors focus:border-signal-amber focus:outline-none"
      />
      <label
        htmlFor={id}
        className="label pointer-events-none absolute left-0 top-6 text-mid transition-all duration-200 peer-focus:top-0 peer-focus:text-signal-amber peer-[:not(:placeholder-shown)]:top-0"
      >
        {label}
        {required ? "*" : ""}
      </label>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  register,
  error,
}: {
  id: keyof FormValues;
  label: string;
  options: readonly string[];
  register: ReturnType<typeof useForm<FormValues>>["register"];
  error?: string;
}) {
  return (
    <div className="relative pt-6">
      <span className="label absolute left-0 top-0 text-mid">{label}</span>
      <select
        id={id}
        defaultValue=""
        aria-invalid={!!error}
        {...register(id)}
        className="w-full border-b border-ink/25 bg-transparent py-2 text-ink transition-colors focus:border-signal-amber focus:outline-none"
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-paper text-ink">
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const { setCursor } = useCursor();
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const btnRef = useRef<HTMLButtonElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Magnetic button: pull toward the cursor while hovering.
  const onBtnMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced || !btnRef.current) return;
    const { gsap } = initGsap();
    const r = btnRef.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(btnRef.current, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: "power3.out" });
  };
  const onBtnLeave = () => {
    setCursor("default");
    if (reduced || !btnRef.current) return;
    const { gsap } = initGsap();
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
  };

  const onSubmit = async (data: FormValues) => {
    setStatus("idle");
    try {
      const { data: res, error } = await supabase.functions.invoke("submit-contact", {
        body: data,
        headers: { "Content-Type": "application/json" },
      });
      if (error || !res?.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="py-16" role="status" aria-live="polite">
        <p className="text-h1 text-ink">Thank you.</p>
        <p className="body-lg mt-4 text-ink/70">Your signal is on its way.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          {...cursorHover(setCursor, "link")}
          className="label mt-8 inline-flex items-center gap-2 hover:text-ink/60"
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Honeypot */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company_url">Company URL</label>
        <input id="company_url" type="text" tabIndex={-1} autoComplete="off" {...register("company_url")} />
      </div>

      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
        <Field id="fullName" label="Full Name" register={register} error={errors.fullName?.message} required />
        <Field id="email" label="Email" type="email" register={register} error={errors.email?.message} required />
        <Field id="company" label="Company / Brand" register={register} error={errors.company?.message} required />
        <Field id="website" label="Website or social" register={register} error={errors.website?.message} />
        <SelectField id="projectType" label="Project type" options={PROJECT_TYPES} register={register} error={errors.projectType?.message} />
        <SelectField id="budget" label="Budget range" options={BUDGET_RANGES} register={register} error={errors.budget?.message} />
      </div>

      <div className="relative pt-6">
        <textarea
          id="message"
          rows={4}
          placeholder=" "
          aria-invalid={!!errors.message}
          {...register("message")}
          className="peer w-full resize-none border-b border-ink/25 bg-transparent py-2 text-ink transition-colors focus:border-signal-amber focus:outline-none"
        />
        <label
          htmlFor="message"
          className="label pointer-events-none absolute left-0 top-6 text-mid transition-all duration-200 peer-focus:top-0 peer-focus:text-signal-amber peer-[:not(:placeholder-shown)]:top-0"
        >
          Tell us about the project
        </label>
        {errors.message && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          Something went wrong. Please check your details and try again.
        </p>
      )}

      <div className="pt-6">
        <button
          ref={btnRef}
          type="submit"
          disabled={isSubmitting}
          onMouseEnter={() => setCursor("link")}
          onMouseMove={onBtnMove}
          onMouseLeave={onBtnLeave}
          className="group inline-flex items-center gap-3 border-b-2 border-ink pb-2 text-h2 transition-colors hover:text-ink/60 disabled:opacity-50"
        >
          {isSubmitting ? "SENDING" : "SUBMIT PROJECT"}
          <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
        </button>
      </div>
    </form>
  );
}
