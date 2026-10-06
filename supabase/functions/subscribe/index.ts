import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const schema = z.object({
  name: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email().max(200),
  // honeypot
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
      console.log("subscribe validation failed");
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

    const { error } = await supabase
      .from("subscribers")
      .insert({ name: d.name || null, email: d.email });

    if (error) {
      // Unique violation = already subscribed. Treat as success (idempotent).
      if (error.code === "23505") {
        console.log("subscribe duplicate email");
        return new Response(
          JSON.stringify({ ok: true, duplicate: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      console.error("subscribe insert error", error.message);
      return new Response(
        JSON.stringify({ ok: false, error: "server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("subscriber stored");
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("subscribe unexpected error", String(e));
    return new Response(
      JSON.stringify({ ok: false, error: "server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
