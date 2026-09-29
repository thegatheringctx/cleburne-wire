import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// Reader interactions: pick'em picks, quiz scores, poll votes, photo votes. JSON in, JSON out.
export const POST: APIRoute = async ({ request }) => {
  let b: any = {}; try { b = await request.json(); } catch { return Response.json({ error: "bad request" }, { status: 400 }); }
  const s = (v: any, n: number) => String(v ?? "").slice(0, n);
  if (b.type === "pick") { const { data } = await sb.rpc("make_pick", { p_game: s(b.game, 40), p_email: s(b.email, 200).trim(), p_name: s(b.name, 60), p_us: Number(b.us), p_them: Number(b.them) }); return Response.json({ result: data }); }
  if (b.type === "quiz") { const { data } = await sb.rpc("record_quiz", { p_quiz: s(b.quiz, 40), p_score: Number(b.score) }); return Response.json(data ?? {}); }
  if (b.type === "poll") { const { data } = await sb.rpc("vote_poll", { p_poll: s(b.poll, 40), p_voter: s(b.voter, 64), p_choice: Number(b.choice) }); return Response.json(data ?? {}); }
  if (b.type === "photo") { const { data } = await sb.rpc("vote_photo", { p_photo: s(b.photo, 40), p_voter: s(b.voter, 64) }); return Response.json({ votes: data }); }
  return Response.json({ error: "unknown" }, { status: 400 });
};
