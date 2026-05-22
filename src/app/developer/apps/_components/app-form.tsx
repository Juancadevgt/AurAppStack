"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { DELIVERY_TYPES } from "@/lib/constants";
import type { App, Category } from "@/types/database";

interface AppFormProps {
  app?: App;
  categories: Category[];
}

export function AppForm({ app, categories }: AppFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, action: "draft" | "submit") {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const title = formData.get("title") as string;
    const data = {
      developer_id: user!.id,
      title,
      slug: app?.slug ?? slugify(title) + "-" + Math.random().toString(36).slice(2, 6),
      tagline: formData.get("tagline") as string,
      description: formData.get("description") as string,
      category_id: Number(formData.get("category_id")),
      price_cents: Math.round(Number(formData.get("price")) * 100),
      delivery_type: formData.get("delivery_type") as any,
      demo_url: (formData.get("demo_url") as string) || null,
      documentation_url: (formData.get("documentation_url") as string) || null,
      support_email: formData.get("support_email") as string,
      tags: ((formData.get("tags") as string) ?? "").split(",").map((t) => t.trim()).filter(Boolean),
      icon_url: (formData.get("icon_url") as string) || null,
      cover_url: (formData.get("cover_url") as string) || null,
      status: action === "draft" ? "draft" : "pending_review",
    };

    const result = app
      ? await supabase.from("apps").update(data).eq("id", app.id).select().single()
      : await supabase.from("apps").insert(data).select().single();

    if (result.error) {
      toast.error(result.error.message);
      setLoading(false);
      return;
    }

    toast.success(action === "draft" ? "Borrador guardado" : "App enviada a revisión");
    router.push("/developer/apps");
    router.refresh();
  }

  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nombre de la app *</Label>
            <Input id="title" name="title" required defaultValue={app?.title} placeholder="Ej: WhatsApp Bot Pro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline * (1 línea para tarjetas)</Label>
            <Input id="tagline" name="tagline" required maxLength={120} defaultValue={app?.tagline} placeholder="Automatiza ventas por WhatsApp con IA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción completa * (Markdown soportado)</Label>
            <Textarea id="description" name="description" required rows={8} defaultValue={app?.description} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría *</Label>
              <select
                id="category_id"
                name="category_id"
                required
                defaultValue={app?.category_id ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecciona...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_type">Tipo de entrega *</Label>
              <select
                id="delivery_type"
                name="delivery_type"
                required
                defaultValue={app?.delivery_type ?? "saas"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {DELIVERY_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separados por coma)</Label>
            <Input id="tags" name="tags" defaultValue={app?.tags.join(", ")} placeholder="whatsapp, ia, ventas" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precio</CardTitle>
          <CardDescription>Establece 0 para apps gratuitas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="price">Precio (USD)</Label>
            <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={app ? app.price_cents / 100 : 0} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recursos e imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="icon_url">URL del ícono (cuadrado, 256x256)</Label>
            <Input id="icon_url" name="icon_url" type="url" defaultValue={app?.icon_url ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_url">URL de imagen portada (16:9)</Label>
            <Input id="cover_url" name="cover_url" type="url" defaultValue={app?.cover_url ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo_url">URL del demo</Label>
            <Input id="demo_url" name="demo_url" type="url" defaultValue={app?.demo_url ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentation_url">URL de documentación</Label>
            <Input id="documentation_url" name="documentation_url" type="url" defaultValue={app?.documentation_url ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Soporte</CardTitle>
          <CardDescription>Los compradores te contactarán a este correo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="support_email">Email de soporte *</Label>
            <Input id="support_email" name="support_email" type="email" required defaultValue={app?.support_email} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={(e) => handleSubmit(e as any, "draft")} disabled={loading}>
          Guardar borrador
        </Button>
        <Button type="button" onClick={(e) => handleSubmit(e as any, "submit")} disabled={loading}>
          {loading ? "Enviando..." : "Enviar a revisión"}
        </Button>
      </div>
    </form>
  );
}
