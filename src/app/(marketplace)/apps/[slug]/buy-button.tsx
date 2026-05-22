"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface BuyButtonProps {
  appId: string;
  priceCents: number;
  viewerRole?: "buyer" | "developer" | "admin" | null;
  isOwnApp?: boolean;
}

export function BuyButton({ appId, priceCents, viewerRole, isOwnApp }: BuyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Es la app del propio desarrollador
  if (isOwnApp) {
    return (
      <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Esta es tu app. No puedes comprarla.</span>
      </div>
    );
  }

  // Desarrolladores no pueden comprar
  if (viewerRole === "developer") {
    return (
      <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Las cuentas de desarrollador no pueden comprar apps. Crea una cuenta de comprador si necesitas adquirirla.</span>
      </div>
    );
  }

  async function handleBuy() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=/apps/${appId}`);
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Error al iniciar la compra");
      setLoading(false);
      return;
    }

    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <Button onClick={handleBuy} disabled={loading} size="lg" className="w-full gap-2">
      <ShoppingCart className="h-4 w-4" />
      {loading ? "Procesando..." : priceCents === 0 ? "Obtener gratis" : "Comprar ahora"}
    </Button>
  );
}
