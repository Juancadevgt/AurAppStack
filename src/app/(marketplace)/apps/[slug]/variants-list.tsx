"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Clock, FileText, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface QuoteFormField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "tel" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface Variant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  original_price_cents: number | null;
  type: "fixed" | "quote" | "coming_soon";
  quote_form_fields: QuoteFormField[];
  quote_instructions: string | null;
}

interface VariantsListProps {
  variants: Variant[];
  appId: string;
  appSlug: string;
  viewerRole: "buyer" | "developer" | "admin" | null;
  isOwnApp: boolean;
}

export function VariantsList({ variants, appId, appSlug, viewerRole, isOwnApp }: VariantsListProps) {
  return (
    <div id="opciones" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {variants.map((v) => (
        <VariantCard
          key={v.id}
          variant={v}
          appId={appId}
          appSlug={appSlug}
          viewerRole={viewerRole}
          isOwnApp={isOwnApp}
        />
      ))}
    </div>
  );
}

function VariantCard({ variant, appId, appSlug, viewerRole, isOwnApp }: {
  variant: Variant;
  appId: string;
  appSlug: string;
  viewerRole: "buyer" | "developer" | "admin" | null;
  isOwnApp: boolean;
}) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  return (
    <div className="border rounded-lg p-5 flex flex-col gap-3 hover:border-primary transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-lg leading-tight">{variant.name}</h3>
        {variant.type === "coming_soon" && (
          <Badge variant="warning" className="gap-1 shrink-0">
            <Clock className="h-3 w-3" /> Próximamente
          </Badge>
        )}
        {variant.type === "quote" && (
          <Badge variant="outline" className="gap-1 shrink-0">
            <FileText className="h-3 w-3" /> Cotizar
          </Badge>
        )}
      </div>

      {variant.description && (
        <p className="text-sm text-muted-foreground line-clamp-3">{variant.description}</p>
      )}

      {variant.type === "fixed" && variant.price_cents != null && (
        <div className="flex items-baseline gap-2 mt-1">
          {variant.original_price_cents && variant.original_price_cents > variant.price_cents && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(variant.original_price_cents)}
            </span>
          )}
          <span className="text-2xl font-bold text-primary">
            {formatPrice(variant.price_cents)}
          </span>
        </div>
      )}

      <div className="mt-auto pt-2">
        {variant.type === "fixed" && (
          <BuyVariantButton
            appId={appId}
            variantId={variant.id}
            priceCents={variant.price_cents ?? 0}
            viewerRole={viewerRole}
            isOwnApp={isOwnApp}
          />
        )}
        {variant.type === "quote" && (
          <Button
            onClick={() => setShowQuoteForm(!showQuoteForm)}
            variant={showQuoteForm ? "outline" : "default"}
            className="w-full"
          >
            {showQuoteForm ? "Cancelar" : "Solicitar cotización"}
          </Button>
        )}
        {variant.type === "coming_soon" && (
          <Button disabled className="w-full">
            No disponible aún
          </Button>
        )}
      </div>

      {showQuoteForm && variant.type === "quote" && (
        <QuoteForm
          appId={appId}
          variantId={variant.id}
          fields={variant.quote_form_fields ?? []}
          instructions={variant.quote_instructions ?? ""}
          onSuccess={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
}

function BuyVariantButton({ appId, variantId, priceCents, viewerRole, isOwnApp }: {
  appId: string;
  variantId: string;
  priceCents: number;
  viewerRole: "buyer" | "developer" | "admin" | null;
  isOwnApp: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isOwnApp) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Es tu app
      </div>
    );
  }

  if (viewerRole === "developer") {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Cuentas vendedor no compran
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
      body: JSON.stringify({ appId, variantId }),
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
    <Button onClick={handleBuy} disabled={loading} className="w-full gap-2">
      <ShoppingCart className="h-4 w-4" />
      {loading ? "Procesando..." : priceCents === 0 ? "Obtener" : "Comprar"}
    </Button>
  );
}

function QuoteForm({ appId, variantId, fields, instructions, onSuccess }: {
  appId: string;
  variantId: string;
  fields: QuoteFormField[];
  instructions: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("__name") as string;
    const email = formData.get("__email") as string;
    const phone = formData.get("__phone") as string;
    const message = formData.get("__message") as string;

    const customData: Record<string, any> = {};
    fields.forEach((f) => {
      customData[f.name] = formData.get(f.name);
    });

    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, variantId, name, email, phone, message, formData: customData }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Error al enviar cotización");
      setLoading(false);
      return;
    }

    toast.success("Cotización enviada — te respondemos por correo");
    setSubmitted(true);
    setLoading(false);
    setTimeout(onSuccess, 3000);
  }

  if (submitted) {
    return (
      <div className="border rounded-md p-4 bg-green-50 text-green-800 flex items-start gap-2 text-sm">
        <Check className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">¡Solicitud enviada!</p>
          <p>Te respondemos por correo en menos de 24 horas con el precio.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-t pt-4 mt-2 space-y-3">
      {instructions && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{instructions}</p>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label htmlFor={`name-${variantId}`}>Tu nombre *</Label>
          <Input id={`name-${variantId}`} name="__name" required />
        </div>
        <div>
          <Label htmlFor={`email-${variantId}`}>Email *</Label>
          <Input id={`email-${variantId}`} name="__email" type="email" required />
        </div>
        <div>
          <Label htmlFor={`phone-${variantId}`}>WhatsApp (opcional)</Label>
          <Input id={`phone-${variantId}`} name="__phone" type="tel" placeholder="+502 ..." />
        </div>

        {fields.map((f) => (
          <div key={f.name}>
            <Label htmlFor={`${f.name}-${variantId}`}>
              {f.label} {f.required && "*"}
            </Label>
            {f.type === "textarea" ? (
              <Textarea
                id={`${f.name}-${variantId}`}
                name={f.name}
                required={f.required}
                placeholder={f.placeholder}
                rows={3}
              />
            ) : f.type === "select" ? (
              <select
                id={`${f.name}-${variantId}`}
                name={f.name}
                required={f.required}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecciona...</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <Input
                id={`${f.name}-${variantId}`}
                name={f.name}
                type={f.type}
                required={f.required}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}

        <div>
          <Label htmlFor={`message-${variantId}`}>Mensaje adicional (opcional)</Label>
          <Textarea id={`message-${variantId}`} name="__message" rows={2} />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  );
}
