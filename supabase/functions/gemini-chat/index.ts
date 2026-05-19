// @ts-ignore Deno runtime URL import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore Deno npm: import
import { z } from "npm:zod@3.25.76";

declare const Deno: {
  env: { get(name: string): string | undefined };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Content-Type": "application/json",
};

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(12000),
      }),
    )
    .min(1)
    .max(24),
  catalogContext: z.string().max(16000).optional(),
  pagePath: z.string().max(500).optional(),
});

const ASHLEY_SYSTEM = `You are Ashley, guest services for Tambua Africa (Nairobi-based East Africa tours and safaris).

Voice: warm, natural, concise, like an experienced travel consultant texting a client. Never sound robotic or list-heavy unless the user asks for a list.

Facts you may rely on (keep consistent with the live catalogue block the client sends you):
- Tambua arranges tailor-made safaris across Kenya, Tanzania, Uganda, Rwanda, and the coast.
- Beyond safaris, Tambua helps with domestic/international flight tickets and long-distance road tickets where useful.
- Tambua organises private road transfers (airports, hotels, park gates) and light-air hops when they fit the itinerary.
- Tambua helps book lodges, camps, and city hotels, curated to park, budget, and style.
- Primary contact: WhatsApp +254 751 223 828, emails info@tambua-africa.com, isaac@tambua-africa.com, jorim@tambua-africa.com, Contact form on the website.
- You do not process payments inside chat; guide people to Book Now / Contact / WhatsApp for confirmation.

Rules:
- Prefer facts from the provided live catalogue context and treat it as the source of truth for destination names, lodge/camp lists, service cards, counts, and current page paths.
- If a property, destination, or service is missing from the live catalogue context, say so plainly instead of guessing.
- Do not invent exact prices unless they appear in the catalogue context; otherwise speak in general terms or defer to the team.
- Keep answers under about 220 words unless the user explicitly wants more detail.
- If the user is on a specific page (pagePath), you may reference it briefly when it helps navigation.
- Handle follow-ups naturally: if the user asks a short follow-up like "how much?", "okay", or "and transfers?", infer likely context from recent messages instead of resetting to generic intros.
- Avoid repeating the same template wording across turns.
- Give a direct answer first, then add links only if helpful.
- Ask one practical follow-up question when needed (dates, route, budget, party size), not many at once.
- When the user asks about future website changes or updates, explain based on the current live snapshot and note that answers will track what is currently published.
- Keep tone human and consultative, not policy-like.`;

type GeminiPart = { text?: string };
type GeminiContent = { role?: string; parts?: GeminiPart[] };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

const toGeminiContents = (messages: { role: "user" | "assistant"; content: string }[]): GeminiContent[] => {
  const trimmed = [...messages];
  while (trimmed.length > 0 && trimmed[0].role === "assistant") {
    trimmed.shift();
  }
  if (trimmed.length === 0) return [];

  return trimmed.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY is not configured on the server." }, 503);
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const raw = await req.json();
    const res = bodySchema.safeParse(raw);
    if (!res.success) {
      return jsonResponse({ error: res.error.issues[0]?.message || "Invalid body" }, 400);
    }
    parsed = res.data;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const contents = toGeminiContents(parsed.messages);
  if (contents.length === 0) {
    return jsonResponse({ error: "No valid messages after normalisation." }, 400);
  }

  const contextBlock = [
    parsed.catalogContext?.trim() ? `Live catalogue snapshot from the website:\n${parsed.catalogContext.trim()}` : "",
    parsed.pagePath ? `Current page path: ${parsed.pagePath}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const systemText = contextBlock ? `${ASHLEY_SYSTEM}\n\n${contextBlock}` : ASHLEY_SYSTEM;

  const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];
  let lastErr = "Unknown error";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 1024,
            topP: 0.95,
          },
        }),
      });

      const geminiJson = await geminiRes.json();

      if (!geminiRes.ok) {
        lastErr = JSON.stringify(geminiJson);
        continue;
      }

      const text =
        geminiJson?.candidates?.[0]?.content?.parts?.map((p: GeminiPart) => p.text || "").join("")?.trim() || "";

      if (!text) {
        lastErr = "Empty model response";
        continue;
      }

      return jsonResponse({ reply: text });
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }

  return jsonResponse({ error: `Gemini request failed: ${lastErr}` }, 502);
});
