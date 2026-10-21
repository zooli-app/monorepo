// import { emailMode, smsMode } from "./config";

// export type Delivery = "sent" | "mock" | "skipped" | "failed";
// export type SmsKind = "otp" | "status" | "credentials";

// /**
//  * SMS. SMS_MODE=mock logs to the server console; SMS_MODE=live sends via SMS_PROVIDER.
//  * `vars` fill template placeholders (MSG91 / DLT templates use var1, var2, …); `text` is the
//  * full message used for mock logging and for Twilio.
//  */
// export async function sendSms(mobile10: string, kind: SmsKind, text: string, vars: string[] = []): Promise<Delivery> {
//   if (smsMode() === "mock") {
//     console.log(`[SMS mock → ${mobile10}] (${kind}) ${text}`);
//     return "mock";
//   }
//   try {
//     const provider = (process.env.SMS_PROVIDER || "msg91").toLowerCase();
//     if (provider === "twilio") {
//       const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM;
//       if (!sid || !token || !from) throw new Error("TWILIO_* env vars missing");
//       const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
//         method: "POST",
//         headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ To: `+91${mobile10}`, From: from, Body: text }),
//       });
//       if (!r.ok) throw new Error(`Twilio ${r.status}`);
//       return "sent";
//     }
//     // MSG91 flow API (India, DLT templates). Template ids: MSG91_TEMPLATE_OTP / _STATUS / _CREDENTIALS
//     const authkey = process.env.MSG91_AUTH_KEY, template = process.env[`MSG91_TEMPLATE_${kind.toUpperCase()}`];
//     if (!authkey || !template) throw new Error("MSG91_AUTH_KEY / MSG91_TEMPLATE_* env vars missing");
//     const r = await fetch("https://control.msg91.com/api/v5/flow/", {
//       method: "POST",
//       headers: { authkey, "Content-Type": "application/json", Accept: "application/json" },
//       body: JSON.stringify({
//         template_id: template, short_url: "0",
//         recipients: [{ mobiles: `91${mobile10}`, ...Object.fromEntries(vars.map((v, i) => [`var${i + 1}`, v])) }],
//       }),
//     });
//     if (!r.ok) throw new Error(`MSG91 ${r.status}`);
//     return "sent";
//   } catch (e) {
//     console.error("[SMS live] failed:", (e as Error).message);
//     return "failed";
//   }
// }

// /** Email. EMAIL_MODE=mock logs only; live sends via Resend. */
// export async function sendEmail(to: string | null | undefined, subject: string, text: string): Promise<Delivery> {
//   if (!to) return "skipped";
//   if (emailMode() === "mock") {
//     console.log(`[EMAIL mock → ${to}] ${subject}\n${text}`);
//     return "mock";
//   }
//   try {
//     const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
//     if (!key || !from) throw new Error("RESEND_API_KEY / EMAIL_FROM missing");
//     const r = await fetch("https://api.resend.com/emails", {
//       method: "POST",
//       headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
//       body: JSON.stringify({ from, to: [to], subject, text }),
//     });
//     if (!r.ok) throw new Error(`Resend ${r.status}`);
//     return "sent";
//   } catch (e) {
//     console.error("[EMAIL live] failed:", (e as Error).message);
//     return "failed";
//   }
// }


import { emailMode, smsMode } from "./config";

export type Delivery = "sent" | "mock" | "skipped" | "failed";
export type SmsKind = "otp" | "status" | "credentials";

/**
 * SMS. SMS_MODE=mock logs to the server console; SMS_MODE=live sends via SMS_PROVIDER.
 * `vars` fill template placeholders (MSG91 / DLT templates use var1, var2, …); `text` is the
 * full message used for mock logging and for Twilio. `out.error` receives the provider's message on failure.
 */
export async function sendSms(mobile10: string, kind: SmsKind, text: string, vars: string[] = [], out: { error?: string } = {}): Promise<Delivery> {
  if (smsMode() === "mock") {
    console.log(`[SMS mock → ${mobile10}] (${kind}) ${text}`);
    return "mock";
  }
  try {
    const provider = (process.env.SMS_PROVIDER || "msg91").toLowerCase();
    if (provider === "twilio") {
      const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM;
      if (!sid || !token || !from) throw new Error("TWILIO_* env vars missing");
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ To: `+91${mobile10}`, From: from, Body: text }),
      });
      if (!r.ok) throw new Error(`Twilio ${r.status}: ${(await r.text()).slice(0, 200)}`);
      return "sent";
    }
    // MSG91 flow API (India, DLT templates). Template ids: MSG91_TEMPLATE_OTP / _STATUS / _CREDENTIALS
    const authkey = process.env.MSG91_AUTH_KEY, template = process.env[`MSG91_TEMPLATE_${kind.toUpperCase()}`];
    if (!authkey || !template) throw new Error("MSG91_AUTH_KEY / MSG91_TEMPLATE_* env vars missing");
    const r = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: { authkey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        template_id: template, short_url: "0",
        recipients: [{ mobiles: `91${mobile10}`, ...Object.fromEntries(vars.map((v, i) => [`var${i + 1}`, v])) }],
      }),
    });
    if (!r.ok) throw new Error(`MSG91 ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return "sent";
  } catch (e) {
    out.error = (e as Error).message;
    console.error("[SMS live] failed:", out.error);
    return "failed";
  }
}

/**
 * Email. EMAIL_MODE=mock logs only; EMAIL_MODE=live sends via Resend.
 * On failure the reason from Resend (e.g. "The domain is not verified") is logged in the API's
 * Vercel runtime logs as "[EMAIL live] failed: …" and returned in `out.error`.
 */
export async function sendEmail(to: string | null | undefined, subject: string, text: string, out: { error?: string } = {}): Promise<Delivery> {
  if (!to) { out.error = "No email address on the application"; return "skipped"; }
  if (emailMode() === "mock") {
    console.log(`[EMAIL mock → ${to}] ${subject}\n${text}`);
    return "mock";
  }
  try {
    const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
    if (!key || !from) throw new Error("RESEND_API_KEY / EMAIL_FROM missing");
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
    return "sent";
  } catch (e) {
    out.error = (e as Error).message;
    console.error("[EMAIL live] failed:", out.error);
    return "failed";
  }
}