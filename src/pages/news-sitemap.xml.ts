import type { APIRoute } from "astro";
import { sb } from "../lib/db";
// Google News sitemap: local news stories from the last 2 days (Google only reads news entries up to 48 hours old).
// Original reporting and briefs only: no calendar items, weather, obituaries or the Wire's own guide teasers.
// Each story is listed under its own town, and only for launched towns.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? "https://cleburnewire.com").replace(/\/$/, "");
  const { data: towns } = await sb.from("towns").select("id,slug,name").eq("active", true).order("created_at");
  const slugOf = new Map<string, any>((towns ?? []).map((t: any) => [t.id, t]));
  const ids = [...slugOf.keys()];
  const { data: stories } = await sb.from("stories").select("id,title,published_at,town_ids,category,source_name").eq("status", "published")
    .not("local_checked_at", "is", null).not("category", "in", "(events,weather,obituaries,jobs,pets)").is("event_at", null)
    .gte("published_at", new Date(Date.now() - 2 * 864e5).toISOString()).or(`town_ids.eq.{},town_ids.ov.{${ids.join(",")}}`)
    .order("published_at", { ascending: false }).limit(500);
  const items = (stories ?? []).filter((s: any) => !/ Wire$/.test(s.source_name ?? "")).map((s: any) => {
    const t = (s.town_ids ?? []).map((id: string) => slugOf.get(id)).find(Boolean) ?? (s.town_ids?.length ? null : towns?.[0]);
    if (!t) return "";
    return `<url><loc>${base}/${t.slug}/s/${s.id}</loc><news:news><news:publication><news:name>${esc(t.name)} Wire</news:name><news:language>en</news:language></news:publication><news:publication_date>${new Date(s.published_at).toISOString()}</news:publication_date><news:title>${esc(s.title)}</news:title></news:news></url>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${items}</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=900" } });
};
