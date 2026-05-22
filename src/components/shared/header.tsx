import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {APP_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/apps" className="hover:text-primary transition-colors">Explorar apps</Link>
            <Link href="/categories" className="hover:text-primary transition-colors">Categorías</Link>
            <Link href="/sell" className="hover:text-primary transition-colors">Vender en AurAppStack</Link>
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
