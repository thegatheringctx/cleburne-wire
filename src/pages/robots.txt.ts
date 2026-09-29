import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() ?? "https://cleburnewire.com").replace(/\/$/, "");
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
};
