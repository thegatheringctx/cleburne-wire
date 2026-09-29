import type { APIRoute } from "astro";
import { sb } from "../../../lib/db";
export const POST: APIRoute = async ({ params }) => {
  if (/^[0-9a-f-]{36}$/.test(params.id ?? "")) await sb.rpc("bump_view", { p_id: params.id }).then(() => {}, () => {});
  return new Response(null, { status: 204 });
};
