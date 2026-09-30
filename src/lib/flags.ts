import { sb } from "./db";
// Whether the morning email is currently sending (app_settings.email_sending). Signup copy only promises a 7 a.m.
// email while it is on. Cached for 5 minutes per server instance.
let cache: { on: boolean; at: number } | null = null;
export async function emailSendingOn() {
  if (cache && Date.now() - cache.at < 300_000) return cache.on;
  const { data } = await sb.rpc("email_sending_on");
  cache = { on: data !== false, at: Date.now() };
  return cache.on;
}
