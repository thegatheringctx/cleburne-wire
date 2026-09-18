import { createClient } from "@supabase/supabase-js";
export const sb = createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY);

export async function getTown(slug: string) {
  const { data } = await sb.from("towns").select("*").eq("slug", slug).eq("active", true).maybeSingle(); return data;
}
export async function getTowns() {
  const { data } = await sb.from("towns").select("slug,name").eq("active", true).order("name"); return data ?? [];
}
export async function getCategories() {
  const { data } = await sb.from("categories").select("*").order("sort_order"); return data ?? [];
}
export async function getFeed(townId: string, category?: string, limit = 60) {
  let q = sb.from("stories").select("*").eq("status", "published")
    .or(`town_ids.cs.{${townId}},town_ids.eq.{}`).order("published_at", { ascending: false }).limit(limit);
  if (category) q = q.eq("category", category);
  const { data } = await q; return data ?? [];
}
export async function getAlerts(townId: string) {
  const { data } = await sb.from("stories").select("id,title,category,published_at").eq("status", "published")
    .in("category", ["weather", "roads"]).gte("score", 6)
    .gte("published_at", new Date(Date.now() - 12 * 3600e3).toISOString())
    .or(`town_ids.cs.{${townId}},town_ids.eq.{}`).order("published_at", { ascending: false }).limit(3);
  return data ?? [];
}
export async function getAds(townId: string, placement: string) {
  const { data } = await sb.from("ads").select("*").eq("active", true).eq("placement", placement)
    .or(`town_ids.cs.{${townId}},town_ids.eq.{}`);
  const list = data ?? []; const total = list.reduce((a, x) => a + x.weight, 0); let r = Math.random() * total;
  for (const a of list) { r -= a.weight; if (r <= 0) return a; }
  return list[0] ?? null;
}
export function timeGroup(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  if (h < 6) return "Just in"; if (h < 24) return "Today"; if (h < 48) return "Yesterday"; return "This week";
}
export const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
