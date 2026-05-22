import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("developer_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let stripeAccountId = profile?.stripe_account_id;

  // Crea cuenta Stripe Express si no existe
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { user_id: user.id },
    });
    stripeAccountId = account.id;

    await supabase.from("developer_profiles").upsert({
      id: user.id,
      stripe_account_id: stripeAccountId,
    });
  }

  // Crea link de onboarding
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/developer/payouts`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/developer/payouts?onboarded=1`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url, { status: 303 });
}
