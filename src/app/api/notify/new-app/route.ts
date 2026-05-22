import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendNewAppNotification } from "@/lib/email/transactional";

export async function POST(req: Request) {
  try {
    const { appId } = await req.json();
    const supabase = createServiceClient();

    const { data: app } = await supabase
      .from("apps")
      .select("title, tagline, slug, category_id")
      .eq("id", appId)
      .single();

    if (!app) return NextResponse.json({ error: "App no encontrada" }, { status: 404 });

    // Suscriptores que quieran recibir nuevas apps de esta categoría (o sin filtro)
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("receive_new_apps", true)
      .is("unsubscribed_at", null)
      .or(
        app.category_id
          ? `categories_interest.cs.{${app.category_id}},categories_interest.eq.{}`
          : "categories_interest.eq.{}",
      );

    if (subscribers && subscribers.length > 0) {
      const emails = subscribers.map((s) => s.email);
      // Resend permite máximo 100 por batch
      for (let i = 0; i < emails.length; i += 100) {
        await sendNewAppNotification(emails.slice(i, i + 100), app);
      }
    }

    return NextResponse.json({ sent: subscribers?.length ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
