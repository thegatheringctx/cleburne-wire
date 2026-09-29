import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData();
  if (f.get("website")) return redirect("/submit?sent=1"); // honeypot
  const { data: t } = await sb.from("towns").select("id").eq("slug", String(f.get("town") ?? "cleburne")).maybeSingle();
  await sb.from("submissions").insert({ kind: String(f.get("kind")), town_id: t?.id, name: f.get("name"), email: f.get("email"), phone: f.get("phone"),
    payload: { title: f.get("title"), details: f.get("details"), when: f.get("when"), where: f.get("where") } });
  return redirect("/submit?sent=1");
};
