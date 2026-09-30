import type { APIRoute } from "astro";
import { sb } from "../lib/db";
// Sitemap: every active town's sections and guide categories, its published local stories, and its active listings.
// Stories and listings are only included for active towns and under their own town's URL, so a town that isn't
// launched yet never appears, and nothing is filed under the wrong town.
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? "https://cleburnewire.com").replace(/\/$/, "");
  const { data: towns } = await sb.from("towns").select("id,slug").eq("active", true);
  const townSlug = new Map<string, string>((towns ?? []).map((t: any) => [t.id, t.slug]));
  const ids = [...townSlug.keys()];
  const [{ data: stories }, { data: bizzes }, { data: cats }, { data: ex }] = await Promise.all([
    sb.from("stories").select("id,town_ids,published_at").eq("status", "published").not("local_checked_at", "is", null)
      .or(`town_ids.eq.{},town_ids.ov.{${ids.join(",")}}`).order("published_at", { ascending: false }).limit(3000),
    sb.from("businesses").select("slug,town_id,refreshed_at").eq("active", true).in("town_id", ids).limit(5000),
    sb.from("directory_categories").select("slug"),
    sb.from("explainers").select("slug,town_id").eq("active", true),
  ]);
  const urls: { loc: string; lastmod?: string; priority?: string }[] = [];
  for (const x of ["advertise", "about", "submit", "privacy", "terms"]) urls.push({ loc: `${base}/${x}`, priority: "0.3" });
  for (const t of towns ?? []) {
    urls.push({ loc: `${base}/${t.slug}`, priority: "1.0" });
    for (const p of ["guide", "homes", "weekend", "jobs", "obituaries", "events", "openings", "crime", "sports", "news", "government", "schools", "business", "community", "weather", "roads", "real-estate", "pets", "meetings", "officials", "101", "faith"]) {
      urls.push({ loc: `${base}/${t.slug}/${p}`, priority: "0.6" });
    }
    for (const c of cats ?? []) urls.push({ loc: `${base}/${t.slug}/guide/${(c as any).slug}`, priority: "0.7" });
    for (const e of (ex ?? []).filter((e: any) => !e.town_id || e.town_id === t.id)) urls.push({ loc: `${base}/${t.slug}/explain/${(e as any).slug}`, priority: "0.8" });
  }
  for (const s of stories ?? []) {
    const slug = (s.town_ids ?? []).map((id: string) => townSlug.get(id)).find(Boolean) ?? (s.town_ids?.length ? null : towns?.[0]?.slug);
    if (slug) urls.push({ loc: `${base}/${slug}/s/${s.id}`, lastmod: s.published_at, priority: "0.4" });
  }
  for (const b of bizzes ?? []) {
    const slug = townSlug.get((b as any).town_id);
    if (slug) urls.push({ loc: `${base}/${slug}/biz/${(b as any).slug}`, lastmod: (b as any).refreshed_at ?? undefined, priority: "0.5" });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}<priority>${u.priority ?? "0.5"}</priority></url>`).join("") +
    `</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" } });
};
