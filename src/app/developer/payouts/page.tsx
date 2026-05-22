import Link from "next/link";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function PayoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const connected = devProfile?.stripe_onboarding_completed === true;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Pagos & Payouts</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connected ? (
              <><CheckCircle2 className="h-5 w-5 text-green-600" /> Cuenta conectada</>
            ) : (
              <><AlertCircle className="h-5 w-5 text-yellow-600" /> Pendiente de configuración</>
            )}
          </CardTitle>
          <CardDescription>
            Conecta tu cuenta Stripe para recibir tus ingresos automáticamente con cada venta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connected ? (
            <>
              <p className="text-sm text-muted-foreground">
                Tu cuenta está lista. El 80% de cada venta llega automáticamente a tu cuenta bancaria vía Stripe.
              </p>
              <form action="/api/stripe/connect/dashboard" method="POST">
                <Button type="submit" variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Abrir dashboard Stripe
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Para empezar a recibir pagos, completa el onboarding de Stripe Connect.
                Tarda 5-10 minutos. Necesitarás:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Documento de identidad</li>
                <li>Cuenta bancaria donde recibir</li>
                <li>Información fiscal</li>
              </ul>
              <form action="/api/stripe/connect/onboard" method="POST">
                <Button type="submit" className="gap-2">
                  Conectar Stripe <ExternalLink className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
