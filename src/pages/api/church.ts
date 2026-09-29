import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// Church self-service listing update via a narrow database function (times, languages, kids ministry, website only).
export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData();
  const town = String(f.get("town") ?? "cleburne");
  if (String(f.get("company") ?? "")) return redirect(`/${town}/faith`); // bot trap
  const clip = (v: FormDataEntryValue | null, n: number) => String(v ?? "").replace(/<[^>]*>/g, "").trim().slice(0, n);
  const { data: ok } = await sb.rpc("update_church_listing", {
    p_slug: clip(f.get("slug"), 200), p_times: clip(f.get("service_times"), 300), p_langs: clip(f.get("languages"), 60),
    p_kids: f.get("kids") === "1", p_website: clip(f.get("website"), 200), p_email: clip(f.get("email"), 200),
  });
  return ok ? redirect(`/${town}/faith/update?done=1`) : new Response("We couldn't save that update. Please try again tomorrow or email news@cleburnewire.com.", { status: 400 });
};
