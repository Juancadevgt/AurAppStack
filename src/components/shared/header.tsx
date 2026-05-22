import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let pendingAppsCount = 0;

  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;

    if (profile?.role === "admin") {
      const { count } = await supabase
        .from("apps")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_review");
      pendingAppsCount = count ?? 0;
    }
  }

  // Navegación según rol
  const publicNav = (
    <>
      <Link href="/apps" className="hover:text-primary transition-colors">Explorar apps</Link>
      <Link href="/categories" className="hover:text-primary transition-colors">Categorías</Link>
      <Link href="/sell" className="hover:text-primary transition-colors">Vender en AurAppStack</Link>
    </>
  );

  const buyerNav = (
    <>
      <Link href="/apps" className="hover:text-primary transition-colors">Explorar apps</Link>
      <Link href="/categories" className="hover:text-primary transition-colors">Categorías</Link>
      <Link href="/dashboard/purchases" className="hover:text-primary transition-colors">Mis compras</Link>
    </>
  );

  const developerNav = (
    <>
      <Link href="/developer/apps" className="hover:text-primary transition-colors">Mis apps</Link>
      <Link href="/developer/sales" className="hover:text-primary transition-colors">Ventas</Link>
      <Link href="/developer/payouts" className="hover:text-primary transition-colors">Pagos</Link>
      <Link href="/developer/support" className="hover:text-primary transition-colors">Soporte</Link>
    </>
  );

  const adminNav = (
    <>
      <Link href="/admin/apps" className="hover:text-primary transition-colors flex items-center gap-1">
        Moderación
        {pendingAppsCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold bg-destructive text-destructive-foreground rounded-full">
            {pendingAppsCount}
          </span>
        )}
      </Link>
      <Link href="/admin/users" className="hover:text-primary transition-colors">Usuarios</Link>
      <Link href="/admin" className="hover:text-primary transition-colors">Reportes</Link>
    </>
  );

  let navContent = publicNav;
  if (profile?.role === "buyer") navContent = buyerNav;
  else if (profile?.role === "developer") navContent = developerNav;
  else if (profile?.role === "admin") navContent = adminNav;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={profile?.role === "developer" ? "/developer/apps" : profile?.role === "admin" ? "/admin" : "/"}
                className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {APP_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navContent}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Crear cuenta</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
