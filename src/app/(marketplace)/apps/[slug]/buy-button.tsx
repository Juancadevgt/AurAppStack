"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function BuyButton({ appId, priceCents }: { appId: string; priceCents: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
