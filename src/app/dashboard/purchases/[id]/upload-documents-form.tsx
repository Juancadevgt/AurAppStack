"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface RequiredDocument {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "image";
  required?: boolean;
  placeholder?: string;
}

interface Props {
  purchaseId: string;
  requiresDocuments: RequiredDocument[];
  fulfillmentData: Record<string, any>;
}

export function UploadDocumentsForm({ purchaseId, requiresDocuments, fulfillmentData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any>>(fulfillmentData ?? {});

  async function handleFileUpload(docName: string, file: File) {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `${purchaseId}/${docName}-${Date.now()}.${file.name.split(".").pop()}`;
    const { data: uploaded, error } = await supabase.storage
      .from("app-files")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error(`Error subiendo: ${error.message}`);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("app-files").getPublicUrl(uploaded.path);
    const newData = { ...data, [docName]: publicUrl };
    setData(newData);

    await saveData(newData);
    setLoading(false);
  }

  async function handleTextChange(docName: string, value: string) {
    setData({ ...data, [docName]: value });
  }

  async function saveData(newData: Record<string, any>) {
    const supabase = createClient();
    const { error } = await supabase
      .from("purchases")
      .update({ fulfillment_data: newData })
      .eq("id", purchaseId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Guardado");
      router.refresh();
    }
  }

  async function handleSubmitAll() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("purchases").update({ fulfillment_data: data }).eq("id", purchaseId);

    await supabase.from("purchase_activity").insert({
      purchase_id: purchaseId,
      actor_id: user?.id,
      actor_role: "buyer",
      type: "document_upload",
      message: "He enviado todos los documentos solicitados.",
    });

    await supabase
      .from("purchases")
      .update({ fulfillment_status: "documents_received", fulfillment_updated_by: user?.id })
      .eq("id", purchaseId);

    toast.success("Documentos enviados. Pronto procesaremos tu trámite.");
    router.refresh();
    setLoading(false);
  }

  const allRequiredFilled = requiresDocuments
    .filter((d) => d.required)
    .every((d) => data[d.name]);

  return (
    <div className="space-y-4">
      {requiresDocuments.map((doc) => {
        const value = data[doc.name];
        const submitted = !!value;
        return (
          <div key={doc.name} className="space-y-1">
            <Label className="flex items-center gap-2">
              {doc.label} {doc.required && "*"}
              {submitted && <Check className="h-4 w-4 text-green-600" />}
            </Label>
            {doc.type === "image" ? (
              <div className="space-y-1">
                {submitted && (
                  <div className="text-xs">
                    <a href={value} target="_blank" rel="noopener" className="text-primary hover:underline">
                      ✓ Imagen subida (click para ver)
                    </a>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(doc.name, file);
                  }}
                />
              </div>
            ) : doc.type === "textarea" ? (
              <Textarea
                value={value ?? ""}
                onChange={(e) => handleTextChange(doc.name, e.target.value)}
                onBlur={() => saveData(data)}
                placeholder={doc.placeholder}
                rows={3}
              />
            ) : (
              <Input
                type={doc.type}
                value={value ?? ""}
                onChange={(e) => handleTextChange(doc.name, e.target.value)}
                onBlur={() => saveData(data)}
                placeholder={doc.placeholder}
              />
            )}
          </div>
        );
      })}

      <Button onClick={handleSubmitAll} disabled={loading || !allRequiredFilled} className="w-full gap-2">
        <Upload className="h-4 w-4" />
        {loading ? "Guardando..." : "Enviar todos los documentos"}
      </Button>
      {!allRequiredFilled && (
        <p className="text-xs text-muted-foreground text-center">
          Llena todos los campos obligatorios antes de enviar.
        </p>
      )}
    </div>
  );
}
