import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData(); const town = String(f.get("town") ?? "cleburne"); const slug = String(f.get("slug") ?? "");
  if (String(f.get("company") ?? "")) return redirect(`/${town}/guide`);
  const c = (k: string, n: number) => String(f.get(k) ?? "").replace(/<[^>]*>/g, "").trim().slice(0, n);
  const w = c("website", 300); const website = w && !/^https?:\/\//i.test(w) ? `https://${w}` : w;
  const { data: ok } = await sb.rpc("update_business_listing", { p_slug: slug, p_website: website, p_photo: c("photo", 500), p_phone: c("phone", 30), p_desc: c("desc", 300), p_email: c("email", 200) });
  return ok ? redirect(`/${town}/biz/update?b=${encodeURIComponent(slug)}&done=1`) : new Response("We couldn't save that. Please try again tomorrow or email news@cleburnewire.com.", { status: 400 });
};
