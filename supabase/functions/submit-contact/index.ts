import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const schema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  company: z.string().min(1).max(160),
  website: z.string().max(200).optional().or(z.literal("")),
  projectType: z.string().min(1).max(80),
  budget: z.string().min(1).max(80),
  message: z.string().min(10).max(4000),
  // honeypot: must be empty
  company_url: z.string().max(0).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      console.log("contact validation failed", parsed.error.flatten().fieldErrors);
      return new Response(
        JSON.stringify({ ok: false, error: "validation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const d = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("contact_submissions").insert({
      full_name: d.fullName,
      email: d.email,
      company: d.company,
      website: d.website || null,
      project_type: d.projectType,
      budget: d.budget,
      message: d.message,
    });

    if (error) {
      console.error("contact insert error", error.message);
      return new Response(
        JSON.stringify({ ok: false, error: "server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("contact submission stored");
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("contact unexpected error", String(e));
    return new Response(
      JSON.stringify({ ok: false, error: "server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
