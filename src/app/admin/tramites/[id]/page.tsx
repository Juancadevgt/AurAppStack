import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Calendar, FileText, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { FULFILLMENT_STATUS, type FulfillmentStatus } from "@/lib/tramite-status";
import { TramiteActions } from "./tramite-actions";

export default async function AdminTramiteDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: purchase } = await supabase
    .from("purchases")
    .select(`
      *,
      apps(title, slug, support_email),
      app_variants(*),
      buyer:profiles!purchases_buyer_id_fkey(email, full_name, avatar_url),
      seller:profiles!purchases_developer_id_fkey(email, full_name)
    `)
    .eq("id", id)
    .single();

  if (!purchase) notFound();

  const { data: activity } = await supabase
    .from("purchase_activity")
    .select("*, profiles(full_name, role)")
    .eq("purchase_id", id)
    .order("created_at", { ascending: false });

  const status = FULFILLMENT_STATUS[purchase.fulfillment_status as FulfillmentStatus] ?? FULFILLMENT_STATUS.received;
  const variant: any = purchase.app_variants;
  const requiresDocs: any[] = variant?.requires_documents ?? [];
  const fulfillmentData: any = purchase.fulfillment_data ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/tramites" className="text-sm text-muted-foreground hover:text-primary">
            ← Volver a trámites
          </Link>
          <h1 className="text-2xl font-bold mt-1">{purchase.apps?.title}</h1>
          {variant?.name && <p className="text-muted-foreground">{variant.name}</p>}
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border ${status.color}`}>
          {status.emoji} {status.label}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documentos requeridos / recibidos */}
          {requiresDocs.length > 0 && (
            <div className="border rounded-lg p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documentos requeridos
              </h2>
              {variant?.fulfillment_instructions && (
                <p className="text-sm text-muted-foreground mb-4 italic">
                  {variant.fulfillment_instructions}
                </p>
              )}
              <div className="space-y-2">
                {requiresDocs.map((doc: any) => {
                  const submitted = fulfillmentData[doc.name];
                  return (
                    <div key={doc.name} className="flex items-start justify-between gap-3 py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Tipo: {doc.type} · {doc.required ? "Obligatorio" : "Opcional"}
                        </p>
                        {submitted && doc.type !== "image" && (
                          <p className="text-sm mt-1 bg-muted/50 p-2 rounded">{String(submitted)}</p>
                        )}
                        {submitted && doc.type === "image" && (
                          <a href={submitted} target="_blank" rel="noopener" className="text-sm text-primary hover:underline">
                            Ver imagen ↗
                          </a>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        submitted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {submitted ? "✓ Recibido" : "Pendiente"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acciones admin */}
          <TramiteActions
            purchaseId={purchase.id}
            currentStatus={purchase.fulfillment_status}
            buyerEmail={purchase.buyer?.email}
            tramiteName={`${purchase.apps?.title} — ${variant?.name ?? ""}`}
          />

          {/* Activity log */}
          <div className="border rounded-lg p-5">
            <h2 className="font-bold mb-3">Historial</h2>
            {activity && activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((a: any) => (
                  <div key={a.id} className="border-l-2 border-primary pl-3 py-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">
                        {a.profiles?.full_name ?? (a.actor_role === "system" ? "Sistema" : "Usuario")}
                      </span>
                      <span>·</span>
                      <span>{new Date(a.created_at).toLocaleString("es")}</span>
                      <span>·</span>
                      <span className="capitalize">{a.type.replace("_", " ")}</span>
                      {a.is_internal && (
                        <span className="bg-yellow-100 text-yellow-800 px-1.5 rounded text-[10px]">Interno</span>
                      )}
                    </div>
                    {a.message && <p className="text-sm mt-1">{a.message}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin actividad todavía.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <User className="h-4 w-4" /> Comprador
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{purchase.buyer?.full_name ?? "—"}</p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {purchase.buyer?.email}
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" /> Detalle de compra
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto</span>
                <span className="font-medium">{formatPrice(purchase.amount_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tu comisión</span>
                <span className="font-medium">{formatPrice(purchase.commission_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Para vendedor</span>
                <span className="font-medium">{formatPrice(purchase.developer_payout_cents)}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Fecha
                </span>
                <span>{new Date(purchase.created_at).toLocaleDateString("es")}</span>
              </div>
              {variant?.estimated_delivery && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entrega est.</span>
                  <span>{variant.estimated_delivery}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
