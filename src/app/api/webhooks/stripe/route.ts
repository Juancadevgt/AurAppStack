import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPurchaseEmail, sendNewSaleEmail } from "@/lib/email/transactional";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Sin firma" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { data: purchase } = await supabase
        .from("purchases")
        .update({
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_checkout_session_id", session.id)
        .select("*, apps(title, slug), profiles!purchases_buyer_id_fkey(email, full_name)")
        .single();

      if (purchase) {
        // Incrementa contador de ventas
        await supabase.rpc("increment_app_purchases", { app_id_param: purchase.app_id });

        // Notifica al comprador y al dev
        await Promise.all([
          sendPurchaseEmail(purchase),
          sendNewSaleEmail(purchase),
        ]);
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const onboardingDone = account.details_submitted && account.charges_enabled;
      await supabase
        .from("developer_profiles")
        .update({ stripe_onboarding_completed: onboardingDone })
        .eq("stripe_account_id", account.id);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await supabase
        .from("purchases")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("stripe_payment_intent_id", charge.payment_intent as string);
      break;
    }

    default:
      // Otros eventos ignorados
      break;
  }

  return NextResponse.json({ received: true });
}
