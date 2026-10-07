import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// Privacy-friendly page view: path, traffic source, a random per-browser id, device class. No cookies, no IP stored.
// Search-engine crawlers and other bots run the page's code too, so they're filtered out by user agent; otherwise a
// crawl of the whole site looks like hundreds of one-page "direct" visitors.
const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pagespeed|google-inspectiontool|googleother|facebookexternalhit|embedly|preview|monitor|uptime|python|curl|wget|axios|node-fetch|go-http/i;
export const POST: APIRoute = async ({ request }) => {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  try { const b = await request.json(); await sb.rpc("record_hit", { p_path: String(b.p ?? ""), p_source: String(b.s ?? "direct"), p_visitor: String(b.v ?? ""), p_device: String(b.d ?? "") }); } catch {}
  return new Response(null, { status: 204 });
};
