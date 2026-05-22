import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("developer_profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ error: "Sin cuenta Stripe" }, { status: 400 });
  }

  const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id);
  return NextResponse.redirect(loginLink.url, { status: 303 });
}
