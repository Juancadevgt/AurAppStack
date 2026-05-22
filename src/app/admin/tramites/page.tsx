import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { FULFILLMENT_STATUS, type FulfillmentStatus } from "@/lib/tramite-status";

export const metadata = { title: "Gestión de trámites" };

export default async function AdminTramitesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("purchases")
    .select("*, apps(title, slug), app_variants(name), profiles!purchases_buyer_id_fkey(email, full_name)")
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (params.status) {
    query = query.eq("fulfillment_status", params.status);
  }

  const { data: purchases } = await query;

  // Conteo por estado
  const { data: allPurchases } = await supabase
    .from("purchases")
    .select("fulfillment_status")
    .eq("status", "completed");

  const counts = (allPurchases ?? []).reduce((acc: any, p: any) => {
    acc[p.fulfillment_status] = (acc[p.fulfillment_status] ?? 0) + 1;
    return acc;
  }, {});

  const statusKeys = Object.keys(FULFILLMENT_STATUS) as FulfillmentStatus[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de trámites</h1>
        <p className="text-muted-foreground text-sm">
          Todas las compras que requieren ser procesadas
        </p>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/tramites">
          <Badge variant={!params.status ? "default" : "outline"} className="cursor-pointer">
            Todos ({allPurchases?.length ?? 0})
          </Badge>
        </Link>
        {statusKeys.map((k) => {
          const config = FULFILLMENT_STATUS[k];
          const count = counts[k] ?? 0;
          return (
            <Link key={k} href={`/admin/tramites?status=${k}`}>
              <Badge variant={params.status === k ? "default" : "outline"} className="cursor-pointer">
                {config.emoji} {config.label} ({count})
              </Badge>
            </Link>
          );
        })}
      </div>

      {/* Tabla de trámites */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-left">
              <th className="p-3">Fecha</th>
              <th className="p-3">Trámite</th>
              <th className="p-3">Comprador</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {purchases?.map((p: any) => {
              const status = FULFILLMENT_STATUS[p.fulfillment_status as FulfillmentStatus] ?? FULFILLMENT_STATUS.received;
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(p.completed_at ?? p.created_at).toLocaleDateString("es")}
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{p.apps?.title}</p>
                      {p.app_variants?.name && (
                        <p className="text-xs text-muted-foreground">{p.app_variants.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{p.profiles?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(p.amount_cents)}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                      {status.emoji} {status.label}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/tramites/${p.id}`}>
                      <Button size="sm">Gestionar</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(!purchases || purchases.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No hay trámites {params.status ? "en este estado" : "todavía"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
