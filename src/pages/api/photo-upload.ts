import type { APIRoute } from "astro";
import { sb } from "../../lib/db";
// Reader photo upload: stored in pending/ (images only, 8 MB), then reviewed automatically before it can appear.
export const POST: APIRoute = async ({ request, redirect }) => {
  const f = await request.formData(); const town = String(f.get("town") ?? "cleburne");
  if (String(f.get("company") ?? "")) return redirect(`/${town}/photos`);
  const file = f.get("photo") as File | null; const email = String(f.get("email") ?? "").trim();
  if (!file || !file.size || file.size > 8 * 1024 * 1024 || !/image\/(jpeg|png|webp)/.test(file.type) || f.get("ok") !== "1") return new Response("Please choose a JPG, PNG or WebP photo under 8 MB, and confirm you took it.", { status: 400 });
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `pending/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("reader-photos").upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (error) return new Response("Upload failed. Please try again.", { status: 500 });
  const { data: id } = await sb.rpc("submit_photo", { p_path: path, p_caption: String(f.get("caption") ?? "").slice(0, 200), p_credit: String(f.get("credit") ?? "").slice(0, 60), p_email: email });
  return id ? redirect(`/${town}/photos?sent=1`) : new Response("We couldn't accept that photo. Check your email address, or try again tomorrow.", { status: 400 });
};
