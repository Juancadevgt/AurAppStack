import { NextResponse } from "next/server";
import { stripe, calculateCommission } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { appId } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data: app } = await supabase
      .from("apps")
      .select("*, developer_profiles!apps_developer_id_fkey(stripe_account_id, stripe_onboarding_completed)")
      .eq("id", appId)
      .eq("status", "live")
      .single();

    if (!app) return NextResponse.json({ error: "App no encontrada" }, { status: 404 });

    // App gratuita: crear purchase directo
    if (app.price_cents === 0) {
      const { commission_cents, developer_payout_cents } = calculateCommission(0);
      const { data: purchase } = await supabase
        .from("purchases")
        .insert({
          buyer_id: user.id,
          app_id: app.id,
          developer_id: app.developer_id,
          amount_cents: 0,
          commission_cents,
          developer_payout_cents,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      return NextResponse.json({ url: `/dashboard/purchases?success=${purchase?.id}` });
    }

    // Verifica que el dev tenga Stripe Connect listo
    const devProfile = (app as any).developer_profiles;
    if (!devProfile?.stripe_onboarding_completed || !devProfile.stripe_account_id) {
      return NextResponse.json(
        { error: "El vendedor no tiene pagos configurados aún" },
        { status: 400 },
      );
    }

    const { commission_cents } = calculateCommission(app.price_cents);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: app.currency.toLowerCase(),
            product_data: {
              name: app.title,
              description: app.tagline,
              images: app.icon_url ? [app.icon_url] : undefined,
            },
            unit_amount: app.price_cents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: commission_cents,
        transfer_data: { destination: devProfile.stripe_account_id },
        metadata: { app_id: app.id, buyer_id: user.id, developer_id: app.developer_id },
      },
      metadata: { app_id: app.id, buyer_id: user.id, developer_id: app.developer_id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/purchases?success={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/apps/${app.slug}?canceled=1`,
      customer_email: user.email,
    });

    // Pre-registra la purchase como pending
    await supabase.from("purchases").insert({
      buyer_id: user.id,
      app_id: app.id,
      developer_id: app.developer_id,
      amount_cents: app.price_cents,
      commission_cents,
      developer_payout_cents: app.price_cents - commission_cents,
      stripe_checkout_session_id: session.id,
      status: "pending",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
