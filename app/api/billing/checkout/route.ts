/**
 * POST /api/billing/checkout
 *
 * Creates a Lemon Squeezy checkout for the authenticated user to upgrade to
 * the Pro ($5/month) plan, then returns the hosted checkout URL for the client
 * to redirect to.
 *
 * Flow:
 *   1. Require an authenticated session.
 *   2. Look up the user; bail early if they're already Pro.
 *   3. Create a checkout for the Pro variant, pre-filling the user's email and
 *      stamping their LexGuard user id into `custom` data so the webhook can
 *      map the resulting subscription back to the right user.
 *   4. Return the checkout URL.
 *
 * Unlike Stripe, Lemon Squeezy creates the customer at purchase time, so there
 * is no customer to pre-create here. The customer id is captured later from the
 * `subscription_created` webhook and stored as `ls_customer_id`.
 */

import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { LS_STORE_ID, LS_PRO_VARIANT_ID, LS_TEST_MODE } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!LS_STORE_ID || !LS_PRO_VARIANT_ID) {
    console.error("Checkout error: LEMONSQUEEZY_STORE_ID / LEMONSQUEEZY_PRO_VARIANT_ID not configured.");
    return NextResponse.json({ error: "Billing is not configured" }, { status: 500 });
  }

  try {
    const supabase = createServerClient();
    const userId = session.user.id;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, plan")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan === "pro") {
      return NextResponse.json({ error: "Already on the Pro plan" }, { status: 400 });
    }

    // Resolve the base URL for the post-purchase redirect.
    const origin =
      process.env.NEXTAUTH_URL ??
      req.headers.get("origin") ??
      new URL(req.url).origin;

    const checkout = await createCheckout(LS_STORE_ID, LS_PRO_VARIANT_ID, {
      checkoutData: {
        email: user.email,
        // Custom data is echoed back in the webhook's `meta.custom_data`.
        custom: { user_id: userId },
      },
      productOptions: {
        redirectUrl: `${origin}/plans?checkout=success`,
      },
      checkoutOptions: {
        embed: false,
      },
      testMode: LS_TEST_MODE,
    });

    if (checkout.error) {
      console.error("Lemon Squeezy checkout error:", checkout.error);
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 502 });
    }

    const url = checkout.data?.data.attributes.url;
    if (!url) {
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
