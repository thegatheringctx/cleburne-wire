import type { APIRoute } from "astro";
export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData();
  const email = String(f.get("email") ?? "").trim();
  const town = String(f.get("town") ?? "cleburne");
  const ref = String(f.get("ref") ?? "").trim();
  if (!email.includes("@")) return new Response("bad email", { status: 400 });
  const FN = import.meta.env.PUBLIC_SUPABASE_URL + "/functions/v1";
  let code = "";
  try { const r = await fetch(`${FN}/subscribe`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, town, ref }) }); code = (await r.json()).code ?? ""; } catch {}
  return redirect(`/thanks${code ? `?c=${code}` : ""}`);
};
