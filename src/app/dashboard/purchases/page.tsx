import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function PurchasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, apps(title, slug, icon_url, delivery_type, support_email)")
    .eq("buyer_id", user!.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis compras</h1>
      {purchases && purchases.length > 0 ? (
        <div className="space-y-3">
          {purchases.map((p: any) => (
            <div key={p.id} className="border rounded-lg p-4 flex items-center gap-4">
              {p.apps?.icon_url && (
                <img src={p.apps.icon_url} alt="" className="w-12 h-12 rounded-lg" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{p.apps?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Comprado el {new Date(p.completed_at).toLocaleDateString("es")} · {formatPrice(p.amount_cents)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/purchases/${p.id}`}>
                  <Button size="sm">Ver trámite</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aún no has comprado ninguna app.</p>
          <Link href="/apps" className="text-primary hover:underline">Explorar apps →</Link>
        </div>
      )}
    </div>
  );
}
