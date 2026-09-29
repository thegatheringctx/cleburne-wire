import type { APIRoute } from "astro";
import { sb } from "../lib/db";
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? "https://cleburnewire.com").replace(/\/$/, "");
  const [{ data: towns }, { data: stories }, { data: bizzes }, { data: cats }] = await Promise.all([
    sb.from("towns").select("slug").eq("active", true),
    sb.from("stories").select("id,town_ids,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(2000),
    sb.from("businesses").select("slug,town_id").limit(2000),
    sb.from("directory_categories").select("slug"),
  ]);
  const townSlug = new Map<string, string>();
  (towns ?? []).forEach((t: any) => {});
  const { data: townRows } = await sb.from("towns").select("id,slug").eq("active", true);
  (townRows ?? []).forEach((t: any) => townSlug.set(t.id, t.slug));

  const urls: { loc: string; lastmod?: string; priority?: string }[] = [];
  urls.push({ loc: `${base}/`, priority: "1.0" });
  for (const x of ["advertise", "about", "submit"]) urls.push({ loc: `${base}/${x}`, priority: "0.4" });
  const { data: ex } = await sb.from("explainers").select("slug,town_id").eq("active", true);
  for (const t of towns ?? []) {
    urls.push({ loc: `${base}/${t.slug}`, priority: "0.9" });
    for (const p of ["guide", "homes", "weekend", "jobs", "obituaries", "events", "openings", "crime", "sports", "news", "government", "schools", "business", "community", "weather", "roads", "real-estate", "pets", "meetings", "officials", "101", "faith"]) {
      urls.push({ loc: `${base}/${t.slug}/${p}`, priority: "0.6" });
    }
    for (const c of cats ?? []) urls.push({ loc: `${base}/${t.slug}/guide/${(c as any).slug}`, priority: "0.5" });
    for (const e of ex ?? []) urls.push({ loc: `${base}/${t.slug}/explain/${(e as any).slug}`, priority: "0.8" });
  }
  for (const s of stories ?? []) {
    const tid = (s.town_ids ?? [])[0]; const slug = tid ? townSlug.get(tid) ?? "cleburne" : "cleburne";
    urls.push({ loc: `${base}/${slug}/s/${s.id}`, lastmod: s.published_at, priority: "0.4" });
  }
  for (const b of bizzes ?? []) {
    const slug = townSlug.get((b as any).town_id) ?? "cleburne";
    urls.push({ loc: `${base}/${slug}/biz/${(b as any).slug}`, priority: "0.3" });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0,10)}</lastmod>` : ""}<priority>${u.priority ?? "0.5"}</priority></url>`).join("") +
    `</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml" } });
};
