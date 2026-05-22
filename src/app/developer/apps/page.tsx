import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

const statusLabels: Record<string, { label: string; variant: any }> = {
  draft: { label: "Borrador", variant: "secondary" },
  pending_review: { label: "En revisión", variant: "warning" },
  live: { label: "Publicada", variant: "success" },
  rejected: { label: "Rechazada", variant: "destructive" },
  paused: { label: "Pausada", variant: "outline" },
};

export default async function DeveloperAppsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: apps } = await supabase
    .from("apps")
    .select("*, categories(name)")
    .eq("developer_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis apps</h1>
          <p className="text-muted-foreground text-sm">Gestiona tus aplicaciones publicadas</p>
        </div>
        <Link href="/developer/apps/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Nueva app
          </Button>
        </Link>
      </div>

      {apps && apps.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left text-sm">
                <th className="p-3">App</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Ventas</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app: any) => {
                const status = statusLabels[app.status] ?? statusLabels.draft;
                return (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{app.title}</p>
                        <p className="text-xs text-muted-foreground">{app.categories?.name}</p>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                    <td className="p-3 text-sm">{app.price_cents === 0 ? "Gratis" : formatPrice(app.price_cents)}</td>
                    <td className="p-3 text-sm">{app.purchases_count}</td>
                    <td className="p-3 text-right space-x-2">
                      {app.status === "live" && (
                        <Link href={`/apps/${app.slug}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        </Link>
                      )}
                      <Link href={`/developer/apps/${app.id}/edit`}>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <h3 className="font-semibold mb-2">Aún no tienes apps</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Publica tu primera app y empieza a vender.
          </p>
          <Link href="/developer/apps/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Crear primera app</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
