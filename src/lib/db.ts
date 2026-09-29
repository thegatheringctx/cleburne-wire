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
    .or(`town_ids.cs.{${townId}},town_ids.eq.{}`)
    .or(`event_at.is.null,event_at.gte.${new Date(Date.now() - 864e5).toISOString()}`)
    .or("local_checked_at.not.is.null,category.in.(events,weather)")
    .gte("published_at", new Date(Date.now() - 90 * 864e5).toISOString())
    .order("published_at", { ascending: false }).limit(limit);
  if (category) q = q.eq("category", category);
  const { data } = await q; return data ?? [];
}
export async function getAlerts(townId: string) {
  const { data } = await sb.from("stories").select("id,title,category,published_at").eq("status", "published")
    .in("category", ["weather", "roads"]).gte("score", 6).not("title", "ilike", "% weather 20%")
    .gte("published_at", new Date(Date.now() - 12 * 3600e3).toISOString())
    .or(`town_ids.cs.{${townId}},town_ids.eq.{}`).order("published_at", { ascending: false }).limit(3);
  return data ?? [];
}
export async function getAds(townId: string, placement: string, section?: string | null) {
  let q = sb.from("ads").select("*").eq("active", true).eq("placement", placement)
    .or(`town_ids.cs.{${townId}},town_ids.eq.{}`)
    .or(`ends_on.is.null,ends_on.gte.${new Date().toISOString().slice(0, 10)}`);
  if (placement === "category-sponsor") q = q.eq("category", section ?? "__none__");
  const { data } = await q;
  const list = data ?? []; const total = list.reduce((a, x) => a + x.weight, 0); let r = Math.random() * total;
  for (const a of list) { r -= a.weight; if (r <= 0) return a; }
  return list[0] ?? null;
}
export async function getBoosts(townId: string) {
  const { data } = await sb.from("ads").select("*").eq("active", true).eq("placement", "event-boost")
    .or(`town_ids.cs.{${townId}},town_ids.eq.{}`).or(`ends_on.is.null,ends_on.gte.${new Date().toISOString().slice(0, 10)}`).limit(4);
  return data ?? [];
}
export function timeGroup(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  if (h < 6) return "Just in"; if (h < 24) return "Today"; if (h < 48) return "Yesterday"; return "This week";
}
export const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export async function getDirCategories() {
  const { data } = await sb.from("directory_categories").select("*").order("sort_order"); return data ?? [];
}
export async function getBusinesses(townId: string, category?: string, limit = 100) {
  let q = sb.from("businesses").select("*").eq("active", true).eq("town_id", townId)
    .order("tier", { ascending: false }).order("score", { ascending: false }).order("rating_count", { ascending: false }).limit(limit);
  if (category) q = q.eq("category", category);
  const { data } = await q; return data ?? [];
}
export async function getBusiness(slug: string) {
  const { data } = await sb.from("businesses").select("*").eq("slug", slug).maybeSingle(); return data;
}
export async function getLatestRate() {
  const { data } = await sb.from("rate_snapshots").select("*").order("as_of", { ascending: false }).limit(1).maybeSingle(); return data;
}
export const stars = (r?: number | null) => r == null ? "" : "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
export const price = (p?: number | null) => p == null ? "" : "$".repeat(p);

// Live status for a town's high-school radio broadcast (Mixlr public API). Never throws.
export async function radioLive(mixlrUser?: string | null): Promise<boolean> {
  if (!mixlrUser) return false;
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch(`https://api.mixlr.com/users/${mixlrUser}`, { signal: ctl.signal }); clearTimeout(t);
    return r.ok ? !!(await r.json()).is_live : false;
  } catch { return false; }
}

// Display-friendly titles for machine-made items (daily forecasts, all-caps alerts)
export function niceTitle(t: string) {
  const m = t.match(/^.*? weather \d{4}-\d{2}-\d{2}:\s*(.+)$/i);
  if (m) return "Today's forecast: " + m[1].toLowerCase().replace(/, high (\d+)°?$/, ", high of $1°");
  return t;
}

// 7-day forecast from the National Weather Service for the town's center point. Never throws.
export async function forecast(town: any): Promise<any[]> {
  try {
    const [a, b, c, d] = Array.isArray(town?.bbox) ? town.bbox : [32.26, -97.49, 32.43, -97.29];
    const lat = ((a + c) / 2).toFixed(4), lng = ((b + d) / 2).toFixed(4);
    const H = { "user-agent": "CleburneWire/1.0 (news@cleburnewire.com)", accept: "application/geo+json" };
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 4000);
    const pt = await (await fetch(`https://api.weather.gov/points/${lat},${lng}`, { headers: H, signal: ctl.signal })).json();
    const f = await (await fetch(pt.properties.forecast, { headers: H, signal: ctl.signal })).json(); clearTimeout(t);
    return (f.properties?.periods ?? []).slice(0, 14);
  } catch { return []; }
}

export const CAT_ICON: Record<string, string> = { restaurants: "utensils", bbq: "flame", mexican: "chef-hat", burgers: "sandwich", "pizza-italian": "pizza", breakfast: "egg-fried", coffee: "coffee", bakeries: "cake-slice", bars: "beer", shopping: "shopping-bag", antiques: "armchair", grocery: "shopping-cart", "things-to-do": "ticket", parks: "trees", kids: "party-popper", salons: "scissors", fitness: "dumbbell", "auto-repair": "wrench", "home-services": "hammer", pets: "paw-print", health: "stethoscope", "real-estate": "house", mortgage: "landmark", insurance: "shield-check", "car-dealers": "car", churches: "church", schools: "graduation-cap" };

export function phone(p?: string | null) {
  if (!p) return null; const d = String(p).split(/[;,/]/)[0].replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(p).trim();
}
