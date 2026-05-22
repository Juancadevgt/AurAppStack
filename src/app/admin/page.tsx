import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: pendingApps },
    { count: totalApps },
    { count: totalUsers },
    { data: revenue },
  ] = await Promise.all([
    supabase.from("apps").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("apps").select("*", { count: "exact", head: true }).eq("status", "live"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("purchases").select("commission_cents").eq("status", "completed"),
  ]);

  const totalCommission = revenue?.reduce((sum, r) => sum + r.commission_cents, 0) ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel admin</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Apps en revisión</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{pendingApps ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Apps publicadas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalApps ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Usuarios totales</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalUsers ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Comisiones</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary">{formatPrice(totalCommission)}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
