// "Find us on {Town} Wire" badge for businesses to put on their own websites. Town comes from the URL, never hardcoded.
import type { APIRoute } from "astro";
import { getTown } from "../../lib/db";
export const GET: APIRoute = async ({ params }) => {
  const town = await getTown(String(params.town ?? "").replace(/\.svg$/, ""));
  if (!town) return new Response("not found", { status: 404 });
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const name = esc(town.name);
  const w = Math.max(200, 118 + name.length * 9);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="56" viewBox="0 0 ${w} 56" role="img" aria-label="Find us on ${name} Wire">
<rect width="${w}" height="56" rx="6" fill="#0E2238"/><rect y="50" width="${w}" height="6" fill="#F4B400"/>
<text x="14" y="21" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" fill="#C9D5E3" letter-spacing=".5">FIND US ON</text>
<text x="14" y="42" font-family="'Arial Narrow',Arial,sans-serif" font-size="20" font-weight="900" fill="#fff">${name} <tspan fill="#F4B400">Wire</tspan></text></svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
};
