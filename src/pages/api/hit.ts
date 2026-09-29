import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// Privacy-friendly page view: path, traffic source, a random per-browser id, device class. No cookies, no IP stored.
export const POST: APIRoute = async ({ request }) => {
  try { const b = await request.json(); await sb.rpc("record_hit", { p_path: String(b.p ?? ""), p_source: String(b.s ?? "direct"), p_visitor: String(b.v ?? ""), p_device: String(b.d ?? "") }); } catch {}
  return new Response(null, { status: 204 });
};
