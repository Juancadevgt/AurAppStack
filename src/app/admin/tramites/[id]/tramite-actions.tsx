"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { FULFILLMENT_STATUS, type FulfillmentStatus, FULFILLMENT_FLOW } from "@/lib/tramite-status";

interface Props {
  purchaseId: string;
  currentStatus: FulfillmentStatus;
  buyerEmail?: string | null;
  tramiteName: string;
}

export function TramiteActions({ purchaseId, currentStatus, buyerEmail, tramiteName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [completionMessage, setCompletionMessage] = useState("");

  async function changeStatus(newStatus: FulfillmentStatus) {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("purchases")
      .update({
        fulfillment_status: newStatus,
        fulfillment_updated_by: user?.id,
      })
      .eq("id", purchaseId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Estado cambiado a: ${FULFILLMENT_STATUS[newStatus].label}`);
      router.refresh();
    }
    setLoading(false);
  }

  async function sendMessage(internal = false) {
    if (!message.trim() && !internalNote.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("purchase_activity").insert({
      purchase_id: purchaseId,
      actor_id: user?.id,
      actor_role: "admin",
      type: internal ? "note" : "message",
      message: internal ? internalNote : message,
      is_internal: internal,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(internal ? "Nota interna agregada" : "Mensaje enviado");
      if (internal) setInternalNote("");
      else setMessage("");
      router.refresh();
    }
    setLoading(false);
  }

  async function completeTramite() {
    if (!completionMessage.trim()) {
      toast.error("Escribe un mensaje de entrega");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Crear activity con la entrega
    await supabase.from("purchase_activity").insert({
      purchase_id: purchaseId,
      actor_id: user?.id,
      actor_role: "admin",
      type: "completion",
      message: completionMessage,
    });

    // 2. Cambiar estado a completado
    const { error } = await supabase
      .from("purchases")
      .update({
        fulfillment_status: "completed",
        fulfillment_updated_by: user?.id,
      })
      .eq("id", purchaseId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Trámite completado y comprador notificado");
      setCompletionMessage("");
      router.refresh();
    }
    setLoading(false);
  }

  const statusConfig = FULFILLMENT_STATUS[currentStatus];

  return (
    <div className="border rounded-lg p-5 space-y-5 bg-muted/20">
      <h2 className="font-bold">Acciones del trámite</h2>

      {/* Cambiar estado rápido */}
      <div>
        <p className="text-sm font-medium mb-2">Cambiar estado</p>
        <div className="flex flex-wrap gap-2">
          {FULFILLMENT_FLOW.map((s) => {
            const config = FULFILLMENT_STATUS[s];
            const active = s === currentStatus;
            return (
              <Button
                key={s}
                size="sm"
                variant={active ? "default" : "outline"}
                disabled={loading || active}
                onClick={() => changeStatus(s)}
              >
                {config.emoji} {config.label}
              </Button>
            );
          })}
          <Button
            size="sm"
            variant="outline"
            disabled={loading || currentStatus === "on_hold"}
            onClick={() => changeStatus("on_hold")}
            className="text-orange-700 border-orange-300"
          >
            ⏸️ Pausar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={loading || currentStatus === "cancelled"}
            onClick={() => changeStatus("cancelled")}
            className="text-red-700 border-red-300"
          >
            ❌ Cancelar
          </Button>
        </div>
      </div>

      {/* Mensaje al comprador */}
      <div className="border-t pt-4 space-y-2">
        <p className="text-sm font-medium">Mensaje al comprador ({buyerEmail})</p>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ej: Por favor envíame el DPI por WhatsApp al 502..."
          rows={3}
        />
        <Button onClick={() => sendMessage(false)} disabled={loading || !message.trim()}>
          Enviar mensaje
        </Button>
      </div>

      {/* Nota interna */}
      <div className="border-t pt-4 space-y-2">
        <p className="text-sm font-medium">Nota interna (solo admin la ve)</p>
        <Textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder="Ej: Cliente ya envió docs por WhatsApp, falta dirección"
          rows={2}
        />
        <Button variant="outline" onClick={() => sendMessage(true)} disabled={loading || !internalNote.trim()}>
          Agregar nota
        </Button>
      </div>

      {/* Completar */}
      {currentStatus !== "completed" && currentStatus !== "cancelled" && (
        <div className="border-t pt-4 space-y-2 bg-green-50 -m-5 mt-4 p-5 rounded-b-lg">
          <p className="text-sm font-medium">Completar trámite ({tramiteName})</p>
          <p className="text-xs text-muted-foreground">
            Escribe el resultado final (ej: NIT generado, credenciales, link al comprobante).
            El comprador lo verá en su panel.
          </p>
          <Textarea
            value={completionMessage}
            onChange={(e) => setCompletionMessage(e.target.value)}
            placeholder="Ej: Tu NIT es 12345678. Aquí tu constancia: https://..."
            rows={3}
          />
          <Button onClick={completeTramite} disabled={loading || !completionMessage.trim()}>
            ✅ Marcar como completado
          </Button>
        </div>
      )}
    </div>
  );
}
