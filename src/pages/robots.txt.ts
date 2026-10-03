import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() ?? "https://cleburnewire.com").replace(/\/$/, "");
  return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\nSitemap: ${base}/news-sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
};
