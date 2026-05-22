import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  appId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  formData: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const service = createServiceClient();

    const { data: quote, error } = await service
      .from("quote_requests")
      .insert({
        app_id: data.appId,
        variant_id: data.variantId ?? null,
        user_id: user?.id ?? null,
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        message: data.message ?? null,
        form_data: data.formData ?? {},
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creando quote:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: enviar email al vendedor con los datos de la cotización
    // (cuando Resend esté configurado)

    return NextResponse.json({ ok: true, id: quote.id });
  } catch (err: any) {
    console.error("Quote error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
