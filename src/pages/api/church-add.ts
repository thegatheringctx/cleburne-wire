import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData();
  const town = String(f.get("town") ?? "cleburne");
  if (String(f.get("company") ?? "")) return redirect(`/${town}/faith`);
  const c = (k: string, n: number) => String(f.get(k) ?? "").replace(/<[^>]*>/g, "").trim().slice(0, n);
  const { data: slug } = await sb.rpc("add_church_listing", { p_name: c("name", 80), p_address: c("address", 160), p_website: c("website", 200), p_times: c("service_times", 300), p_email: c("email", 200) });
  return slug ? redirect(`/${town}/faith/update?c=${slug}&added=1`) : new Response("We couldn't add that listing. Please check the name and address, or email news@cleburnewire.com.", { status: 400 });
};
