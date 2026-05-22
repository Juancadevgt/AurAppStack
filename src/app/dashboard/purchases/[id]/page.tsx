import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Calendar, FileText, Package, CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { FULFILLMENT_STATUS, type FulfillmentStatus, FULFILLMENT_FLOW } from "@/lib/tramite-status";
import { UploadDocumentsForm } from "./upload-documents-form";

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: purchase } = await supabase
    .from("purchases")
    .select(`
      *,
      apps(title, slug, support_email, icon_url),
      app_variants(*)
    `)
    .eq("id", id)
    .eq("buyer_id", user!.id)
    .single();

  if (!purchase) notFound();

  const { data: activity } = await supabase
    .from("purchase_activity")
    .select("*, profiles(full_name, role)")
    .eq("purchase_id", id)
    .eq("is_internal", false)
    .order("created_at", { ascending: false });

  const status = FULFILLMENT_STATUS[purchase.fulfillment_status as FulfillmentStatus] ?? FULFILLMENT_STATUS.received;
  const variant: any = purchase.app_variants;
  const requiresDocs: any[] = variant?.requires_documents ?? [];
  const fulfillmentData: any = purchase.fulfillment_data ?? {};

  const currentStepIndex = FULFILLMENT_FLOW.indexOf(purchase.fulfillment_status as any);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/purchases" className="text-sm text-muted-foreground hover:text-primary">
          ← Volver a mis compras
        </Link>
        <h1 className="text-2xl font-bold mt-1">{purchase.apps?.title}</h1>
        {variant?.name && <p className="text-muted-foreground">{variant.name}</p>}
      </div>

      {/* Progress timeline */}
      <div className="border rounded-lg p-5">
        <h2 className="font-bold mb-4">Estado de tu trámite</h2>
        <div className="flex items-center justify-between mb-2">
          {FULFILLMENT_FLOW.map((s, idx) => {
            const config = FULFILLMENT_STATUS[s];
            const isPast = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={s} className="flex-1 flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isPast ? "bg-primary text-primary-foreground" :
                  isCurrent ? "bg-primary/20 ring-4 ring-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {isPast ? <CheckCircle2 className="h-5 w-5" /> : config.emoji}
                </div>
                <p className={`text-xs mt-2 ${isCurrent ? "font-bold" : ""}`}>{config.label}</p>
              </div>
            );
          })}
        </div>
        {variant?.estimated_delivery && purchase.fulfillment_status !== "completed" && (
          <p className="text-sm text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
            <Clock className="h-4 w-4" /> Entrega estimada: {variant.estimated_delivery}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documentos a entregar */}
          {requiresDocs.length > 0 && purchase.fulfillment_status !== "completed" && (
            <div className="border rounded-lg p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documentos que necesitamos
              </h2>
              {variant?.fulfillment_instructions && (
                <p className="text-sm bg-blue-50 text-blue-900 p-3 rounded mb-4">
                  {variant.fulfillment_instructions}
                </p>
              )}
              <UploadDocumentsForm
                purchaseId={purchase.id}
                requiresDocuments={requiresDocs}
                fulfillmentData={fulfillmentData}
              />
            </div>
          )}

          {/* Resultado completado */}
          {purchase.fulfillment_status === "completed" && (
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-5">
              <h2 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> ¡Trámite completado!
              </h2>
              <p className="text-sm text-green-800">
                Tu trámite fue procesado exitosamente. Revisa los detalles abajo.
              </p>
            </div>
          )}

          {/* Activity / mensajes */}
          <div className="border rounded-lg p-5">
            <h2 className="font-bold mb-3">Mensajes y actualizaciones</h2>
            {activity && activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((a: any) => (
                  <div key={a.id} className={`border-l-4 pl-3 py-2 ${
                    a.type === "completion" ? "border-green-500 bg-green-50" :
                    a.type === "status_change" ? "border-blue-300" :
                    "border-primary"
                  } rounded-r`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium">
                        {a.profiles?.full_name ?? (a.actor_role === "system" ? "Sistema" : "Administrador")}
                      </span>
                      <span>·</span>
                      <span>{new Date(a.created_at).toLocaleString("es")}</span>
                    </div>
                    {a.message && <p className="text-sm whitespace-pre-wrap">{a.message}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay mensajes. Espera contacto del equipo.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" /> Detalles
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pagado</span>
                <span className="font-medium">{formatPrice(purchase.amount_cents)}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Fecha
                </span>
                <span>{new Date(purchase.completed_at ?? purchase.created_at).toLocaleDateString("es")}</span>
              </div>
              {variant?.estimated_delivery && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entrega est.</span>
                  <span>{variant.estimated_delivery}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-5 space-y-2">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" /> ¿Dudas?
            </h3>
            <p className="text-xs text-muted-foreground">
              Contacta al vendedor: <a href={`mailto:${purchase.apps?.support_email}`} className="text-primary hover:underline">{purchase.apps?.support_email}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
