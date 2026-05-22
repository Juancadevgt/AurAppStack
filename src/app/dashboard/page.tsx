import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  const { count: purchasesCount } = await supabase
    .from("purchases")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", user!.id)
    .eq("status", "completed");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hola, {profile?.full_name} 👋</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Mis compras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{purchasesCount ?? 0}</p>
            <Link href="/dashboard/purchases" className="text-sm text-primary hover:underline">Ver todas →</Link>
          </CardContent>
        </Card>

        {profile?.role === "developer" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Panel vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/developer/apps" className="text-primary hover:underline">Gestionar mis apps →</Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
