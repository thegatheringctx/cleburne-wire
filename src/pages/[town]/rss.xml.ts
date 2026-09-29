import type { APIRoute } from "astro";
import { getTown, getFeed } from "../../lib/db";
export const GET: APIRoute = async ({ params, site }) => {
  const town = await getTown(params.town!); if (!town) return new Response("not found", { status: 404 });
  const items = await getFeed(town.id, undefined, 40);
  const esc = (s: string) => (s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>${town.name} Wire</title><link>${site}/${town.slug}</link><description>Local news for ${town.name}, TX</description>${items.map((s) => `<item><title>${esc(s.title)}</title><link>${site}/${town.slug}/s/${s.id}</link><guid>${s.id}</guid><pubDate>${new Date(s.published_at).toUTCString()}</pubDate><description>${esc(s.summary ?? "")}</description></item>`).join("")}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml" } });
};
