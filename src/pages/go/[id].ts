import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
export const GET: APIRoute = async ({ params, request }) => {
  const { data: ad } = await sb.from("ads").select("click_url").eq("id", params.id!).maybeSingle();
  if (!ad) return new Response("not found", { status: 404 });
  await sb.rpc("record_ad_event", { p_ad: params.id, p_kind: "click", p_town: null, p_page: request.headers.get("referer") });
  return Response.redirect(ad.click_url, 302);
};
