import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// One-tap poll voting from the morning email: each answer is a link carrying the poll, the choice and the reader's
// private email token (so each subscriber has one vote, changeable). Records the vote and opens the results on the site.
export const GET: APIRoute = async ({ url, redirect }) => {
  const p = String(url.searchParams.get("p") ?? "").slice(0, 40), c = Number(url.searchParams.get("c")), t = String(url.searchParams.get("t") ?? "").slice(0, 40);
  const town = String(url.searchParams.get("town") ?? "cleburne").replace(/[^a-z-]/g, "");
  if (/^[0-9a-f-]{36}$/.test(p) && Number.isInteger(c) && c >= 0 && /^[0-9a-f-]{36}$/.test(t)) {
    await sb.rpc("vote_poll", { p_poll: p, p_voter: `email:${t}`, p_choice: c });
  }
  return redirect(`/${town}?voted=${encodeURIComponent(p)}&utm_source=email&utm_medium=newsletter#poll`, 302);
};
