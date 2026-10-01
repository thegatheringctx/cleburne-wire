import { sb } from "./db";
// Whether the morning email is currently going out (app_settings.email_sending, via email_live()). Signup copy only
// promises a 7 a.m. email while it is on. Cached for 5 minutes per server instance.
// (Selling email sponsorships is a separate switch, app_settings.email_sales, read by the advertise page.)
let cache: { on: boolean; at: number } | null = null;
export async function emailSendingOn() {
  if (cache && Date.now() - cache.at < 300_000) return cache.on;
  const { data } = await sb.rpc("email_live");
  cache = { on: data !== false, at: Date.now() };
  return cache.on;
}
