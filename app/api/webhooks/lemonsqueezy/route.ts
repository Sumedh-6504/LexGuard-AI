/**
 * POST /api/webhooks/lemonsqueezy
 *
 * Receives and verifies Lemon Squeezy webhook events, then syncs the user's
 * plan in Supabase. This is the source of truth for plan changes — never trust
 * the client redirect alone.
 *
 * Handled events:
 *   • subscription_created   → set the user's plan to "pro" (+ store customer id)
 *   • subscription_resumed   → set the user's plan to "pro"
 *   • subscription_unpaused  → set the user's plan to "pro"
 *   • subscription_expired   → revert the user's plan to "free"
 *
 * Note on cancellation: Lemon Squeezy's `subscription_cancelled` fires when a
 * user cancels, but they keep access until the end of the paid period. The plan
 * is only reverted on `subscription_expired`, when access has actually ended.
 *
 * Security: every request is verified by computing an HMAC-SHA256 of the raw
 * body with LEMONSQUEEZY_WEBHOOK_SECRET and comparing it (constant-time)
 * against the `X-Signature` header. Unverified requests are rejected with 400.
 *
 * NOTE: the raw (unparsed) body is required for signature verification, which
 * is why we read `req.text()` and never `req.json()` here.
 */

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServerClient } from "@/lib/supabase/server";
import { LS_WEBHOOK_SECRET } from "@/lib/lemonsqueezy";

// Signature verification needs Node's crypto + the raw body.
export const runtime = "nodejs";

const PRO_EVENTS = new Set(["subscription_created", "subscription_resumed", "subscription_unpaused"]);
const FREE_EVENTS = new Set(["subscription_expired"]);

/** Constant-time comparison of the request signature against our HMAC. */
function isValidSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", LS_WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest("hex");
  const digestBuf = Buffer.from(digest, "hex");
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  if (digestBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(digestBuf, sigBuf);
}

/** Set a user's plan, locating them by id first, then by LS customer id. */
async function setUserPlan(
  opts: { userId?: string | null; customerId?: string | null; plan: "pro" | "free"; customerIdToStore?: string | null }
) {
  const supabase = createServerClient();
  const updates: Record<string, unknown> = {
    plan: opts.plan,
    updated_at: new Date().toISOString(),
  };
  if (opts.customerIdToStore) {
    updates.ls_customer_id = opts.customerIdToStore;
  }

  if (opts.userId) {
    const { error } = await supabase
      .from("users")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updates as any)
      .eq("id", opts.userId);
    if (!error) return true;
    console.error("setUserPlan by userId failed:", error);
  }

  if (opts.customerId) {
    const { error } = await supabase
      .from("users")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updates as any)
      .eq("ls_customer_id", opts.customerId);
    if (!error) return true;
    console.error("setUserPlan by customerId failed:", error);
  }

  return false;
}

export async function POST(req: Request) {
  if (!LS_WEBHOOK_SECRET) {
    console.error("Webhook error: LEMONSQUEEZY_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: { user_id?: string } };
    data?: { attributes?: { customer_id?: number | string; status?: string } };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const userId = payload.meta?.custom_data?.user_id ?? null;
  const rawCustomerId = payload.data?.attributes?.customer_id;
  const customerId = rawCustomerId != null ? String(rawCustomerId) : null;

  if (!eventName) {
    return NextResponse.json({ error: "Missing event name" }, { status: 400 });
  }

  try {
    if (PRO_EVENTS.has(eventName)) {
      const ok = await setUserPlan({
        userId,
        customerId,
        plan: "pro",
        customerIdToStore: customerId,
      });
      if (!ok) {
        console.error(`${eventName}: could not match a user`, { userId, customerId });
      }
    } else if (FREE_EVENTS.has(eventName)) {
      const ok = await setUserPlan({ userId, customerId, plan: "free" });
      if (!ok) {
        console.error(`${eventName}: could not match a user`, { userId, customerId });
      }
    }
    // Other events are acknowledged without action.
  } catch (err) {
    console.error(`Webhook handler error for ${eventName}:`, err);
    // Return 500 so Lemon Squeezy retries — the event was valid, processing failed.
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
