import { defineMiddleware } from "astro:middleware";
// Instant pages: for public, cacheable HTML, let Netlify's CDN serve the last copy immediately and refresh it in the background.
export const onRequest = defineMiddleware(async (ctx, next) => {
  const res = await next();
  const cc = res.headers.get("cache-control") ?? "";
  if (ctx.request.method === "GET" && /public/.test(cc) && !/no-store|private/.test(cc) && (res.headers.get("content-type") ?? "").includes("text/html")) {
    const s = Number(cc.match(/s-maxage=(\d+)/)?.[1] ?? 300);
    res.headers.set("Netlify-CDN-Cache-Control", `public, durable, s-maxage=${s}, stale-while-revalidate=${Math.max(3600, s * 12)}`);
  }
  return res;
});
