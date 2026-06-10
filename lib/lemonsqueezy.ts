/**
 * Lemon Squeezy — Server Setup
 *
 * Configures the Lemon Squeezy SDK with the store API key and exports the
 * store / variant / webhook config used by the billing routes.
 *
 * Lemon Squeezy is a Merchant of Record: it is the legal seller, handles
 * global sales tax, and pays out to the store owner. We only ever talk to it
 * server-side — the API key must never reach the browser.
 *
 * ⚠️  Never import this file in a client component ("use client").
 */

import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

const apiKey = process.env.LEMONSQUEEZY_API_KEY;

if (!apiKey) {
  console.warn("[lemonsqueezy] LEMONSQUEEZY_API_KEY is not set — billing routes will fail.");
}

// Configure the SDK's module-level client. Safe to call on every import.
lemonSqueezySetup({
  apiKey: apiKey ?? "",
  onError: (err) => console.error("[lemonsqueezy] SDK error:", err),
});

/** The Lemon Squeezy Store ID that owns the Pro product. */
export const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID ?? "";

/** The Variant ID for the $5/month Pro subscription. */
export const LS_PRO_VARIANT_ID = process.env.LEMONSQUEEZY_PRO_VARIANT_ID ?? "";

/** Signing secret used to verify incoming webhook payloads (HMAC-SHA256). */
export const LS_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

/** Whether to create checkouts in test mode (test-mode store + API key). */
export const LS_TEST_MODE = process.env.LEMONSQUEEZY_TEST_MODE === "true";
