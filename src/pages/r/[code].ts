import type { APIRoute } from "astro";
export const GET: APIRoute = ({ params }) => {
  const code = /^[0-9a-f]{8}$/.test(params.code ?? "") ? params.code : "";
  return new Response(null, { status: 302, headers: { location: "/cleburne?welcome=1", "set-cookie": code ? `cw_ref=${code}; Path=/; Max-Age=2592000; SameSite=Lax; Secure` : "cw_ref=; Path=/; Max-Age=0" } });
};
