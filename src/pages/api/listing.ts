import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// Agent-submitted listing / open house. Times entered in Cleburne local time.
const ct = (v: string) => { if (!v) return null; const d = new Date(v + ":00"); if (isNaN(+d)) return null; const off = new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" })).getTime() - new Date(d.toLocaleString("en-US", { timeZone: "UTC" })).getTime(); return new Date(new Date(v + ":00Z").getTime() - off).toISOString(); };
export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData(); const town = String(f.get("town") ?? "cleburne");
  if (String(f.get("company") ?? "")) return redirect(`/${town}/homes`);
  const c = (k: string, n = 200) => String(f.get(k) ?? "").replace(/<[^>]*>/g, "").trim().slice(0, n);
  const num = (k: string) => { const v = Number(c(k).replace(/[^0-9.]/g, "")); return isFinite(v) && v > 0 ? v : 0; };
  const { data: id } = await sb.rpc("submit_listing", { p_address: c("address", 160), p_price: Math.round(num("price")), p_beds: num("beds"), p_baths: num("baths"), p_sqft: Math.round(num("sqft")),
    p_photo: c("photo", 500), p_url: c("url", 500), p_open_at: ct(c("open_at")), p_open_end: ct(c("open_end")), p_agent: c("agent", 80), p_brokerage: c("brokerage", 80), p_phone: c("phone", 30), p_email: c("email") });
  return id ? redirect(`/${town}/homes/list?done=1`) : new Response("We couldn't post that listing. Check that the address is in Cleburne and the agent, brokerage and email are filled in, or email news@cleburnewire.com.", { status: 400 });
};
