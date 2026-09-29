import type { APIRoute } from "astro";
import { sb } from "../../../lib/db";
// Add-to-calendar: a standard .ics file any phone or calendar app opens.
export const GET: APIRoute = async ({ params }) => {
  if (!/^[0-9a-f-]{36}$/.test(params.id ?? "")) return new Response("Not found", { status: 404 });
  const { data: e } = await sb.from("stories").select("id,title,summary,event_at,location").eq("id", params.id).maybeSingle();
  if (!e?.event_at) return new Response("Not found", { status: 404 });
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => (s ?? "").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  const start = new Date(e.event_at), end = new Date(start.getTime() + 60 * 6e4);
  const url = `https://cleburnewire.com/cleburne/s/${e.id}`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cleburne Wire//Events//EN", "BEGIN:VEVENT", `UID:${e.id}@cleburnewire.com`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc((e.summary ?? "") + "\n\n" + url)}`, e.location ? `LOCATION:${esc(e.location)}` : "", `URL:${url}`, "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
  const name = e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) || "event";
  return new Response(ics, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${name}.ics"` } });
};
