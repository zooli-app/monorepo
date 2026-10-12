import { captchaMode } from "./config";

/** Cloudflare Turnstile (live) or a fixed dev token (mock). Never throws; returns false on any failure. */
export async function verifyCaptcha(token: string | undefined, ip: string): Promise<boolean> {
  if (!token) return false;
  if (captchaMode() === "mock") return token === "mock-pass";
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const j = (await r.json()) as { success?: boolean };
    return j.success === true;
  } catch { return false; }
}
