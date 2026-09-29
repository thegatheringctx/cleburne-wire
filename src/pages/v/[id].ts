import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// Ad view beacon: fired once per page view for each sponsor slot that was actually shown in the browser.
export const POST: APIRoute = async ({ params, request }) => {
  if (!/^[0-9a-f-]{36}$/.test(params.id ?? "")) return new Response(null, { status: 204 });
  await sb.rpc("record_ad_event", { p_ad: params.id, p_kind: "impression", p_town: null, p_page: request.headers.get("referer") }).then(() => {}, () => {});
  return new Response(null, { status: 204 });
};
