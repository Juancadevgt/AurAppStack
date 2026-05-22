import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/marketplace/app-card";
import { NewsletterSignup } from "@/components/marketplace/newsletter-signup";
import { createClient } from "@/lib/supabase/server";
import { APP_CATEGORIES } from "@/lib/constants";

export const revalidate = 60; // ISR cada 60s

export default async function HomePage() {
  const supabase = await createClient();

  // Si está logueado, redirige al panel correspondiente
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "developer") redirect("/developer/apps");
    if (profile?.role === "admin") redirect("/admin");
    // buyer se queda en la home pública
  }

  const { data: featuredApps } = await supabase
    .from("apps")
    .select("*")
    .eq("status", "live")
    .order("purchases_count", { ascending: false })
    .limit(8);

  const { data: newApps } = await supabase
    .from("apps")
    .select("*")
    .eq("status", "live")
    .order("published_at", { ascending: false })
    .limit(4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>El marketplace de apps listas para usar</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Compra software{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                listo para usar
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Bots de WhatsApp, sistemas POS, automatizaciones, agentes IA y más. Todo de desarrolladores verificados, con soporte directo.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/apps">
                <Button size="lg" className="gap-2">
                  Explorar apps <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Link href="/sell">
                  <Button size="lg" variant="outline">
                    Vender mi app
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Explora por categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {APP_CATEGORIES.slice(0, 10).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="p-4 rounded-lg border bg-background hover:border-primary transition-colors text-center"
              >
                <div className="text-2xl mb-2">📦</div>
                <p className="text-sm font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Apps más vendidas</h2>
              <p className="text-muted-foreground">Los favoritos de la comunidad</p>
            </div>
            <Link href="/apps">
              <Button variant="ghost" className="gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {featuredApps && featuredApps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredApps.map((app) => <AppCard key={app.id} app={app} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aún no hay apps publicadas. ¡Sé el primero!</p>
              {!user && (
                <Link href="/register" className="text-primary hover:underline">
                  Crear cuenta de desarrollador →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold">Listo para usar</h3>
              <p className="text-sm text-muted-foreground">
                Software probado. Sin meses de desarrollo: instalas, configuras y vendes.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold">Soporte del autor</h3>
              <p className="text-sm text-muted-foreground">
                Cada app tiene soporte directo del desarrollador que la creó.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold">Pagos seguros</h3>
              <p className="text-sm text-muted-foreground">
                Procesamos pagos con Stripe. Garantía de devolución.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW APPS */}
      {newApps && newApps.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Recién publicadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newApps.map((app) => <AppCard key={app.id} app={app} />)}
            </div>
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Suscríbete y recibe las nuevas apps + descuentos exclusivos
            </h2>
            <p className="text-muted-foreground">
              Sin spam. Solo notificaciones cuando hay apps nuevas que te puedan interesar.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </>
  );
}
