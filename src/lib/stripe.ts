import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY no configurado");
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// Compatibilidad: export stripe como proxy lazy
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const COMMISSION_PCT = Number(process.env.MARKETPLACE_COMMISSION_PCT ?? "20");

export function calculateCommission(amountCents: number) {
  const commission = Math.round((amountCents * COMMISSION_PCT) / 100);
  return {
    commission_cents: commission,
    developer_payout_cents: amountCents - commission,
  };
}
