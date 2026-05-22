import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Download, Mail, ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyButton } from "./buy-button";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const revalidate = 300; // ISR cada 5 min

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: app } = await supabase.from("apps").select("title, tagline").eq("slug", slug).single();
  if (!app) return {};
  return { title: app.title, description: app.tagline };
}

export default async function AppDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("apps")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .single();

  if (!app) notFound();

  const [{ data: developer }, { data: screenshots }, { data: reviews }, { data: category }, { data: { user: viewer } }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", app.developer_id).single(),
    supabase.from("app_screenshots").select("*").eq("app_id", app.id).order("display_order"),
    supabase.from("reviews").select("*, profiles(full_name, avatar_url)").eq("app_id", app.id).order("created_at", { ascending: false }).limit(10),
    app.category_id ? supabase.from("categories").select("*").eq("id", app.category_id).single() : Promise.resolve({ data: null }),
    supabase.auth.getUser(),
  ]);

  let viewerRole: "buyer" | "developer" | "admin" | null = null;
  if (viewer) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", viewer.id)
      .single();
    viewerRole = viewerProfile?.role ?? null;
  }
  const isOwnApp = viewer?.id === app.developer_id;

  // Incrementa contador de vistas (fire-and-forget)
  supabase.rpc("increment_app_views", { app_id_param: app.id }).then(() => {});

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-start gap-4">
            {app.icon_url && (
              <Image src={app.icon_url} alt={app.title} width={80} height={80} className="rounded-xl shrink-0" />
            )}
            <div className="space-y-2">
              {category && <Badge variant="secondary">{category.name}</Badge>}
              <h1 className="text-3xl font-bold">{app.title}</h1>
              <p className="text-lg text-muted-foreground">{app.tagline}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {app.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{app.average_rating.toFixed(1)}</span>
                    <span>({app.reviews_count} reseñas)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {app.purchases_count} ventas
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          {screenshots && screenshots.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {screenshots.map((s) => (
                <div key={s.id} className="aspect-video rounded-lg overflow-hidden border bg-muted relative">
                  <Image src={s.url} alt={s.caption ?? ""} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="prose prose-slate max-w-none">
            <h2>Descripción</h2>
            <p className="whitespace-pre-wrap">{app.description}</p>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Reseñas</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{r.profiles?.full_name ?? "Anónimo"}</span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aún no hay reseñas. ¡Sé el primero!</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6 sticky top-20 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Precio</p>
              <p className="text-3xl font-bold">
                {app.price_cents === 0 ? "Gratis" : formatPrice(app.price_cents, app.currency)}
              </p>
            </div>

            <BuyButton
              appId={app.id}
              priceCents={app.price_cents}
              viewerRole={viewerRole}
              isOwnApp={isOwnApp}
            />

            {app.demo_url && (
              <a href={app.demo_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" /> Ver demo
                </Button>
              </a>
            )}

            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Publicado: {app.published_at ? new Date(app.published_at).toLocaleDateString("es") : "—"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Soporte: {app.support_email}
              </div>
            </div>

            {developer && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Desarrollado por</p>
                <div className="flex items-center gap-2">
                  {developer.avatar_url && (
                    <Image src={developer.avatar_url} alt="" width={32} height={32} className="rounded-full" />
                  )}
                  <p className="font-medium text-sm">{developer.full_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
