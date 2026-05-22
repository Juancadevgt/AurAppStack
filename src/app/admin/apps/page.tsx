import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ModerationActions } from "./moderation-actions";

export default async function AdminAppsPage() {
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("apps")
    .select("*, profiles(full_name, email), categories(name)")
    .in("status", ["pending_review", "rejected"])
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moderación de apps</h1>

      <div className="space-y-3">
        {apps?.map((app: any) => (
          <div key={app.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{app.title}</h3>
                  <Badge variant={app.status === "rejected" ? "destructive" : "warning"}>
                    {app.status === "pending_review" ? "Pendiente" : "Rechazada"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{app.tagline}</p>
                <p className="text-xs text-muted-foreground">
                  Por {app.profiles?.full_name} ({app.profiles?.email}) · {app.categories?.name}
                </p>
              </div>
              <ModerationActions appId={app.id} status={app.status} />
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-primary">Ver descripción</summary>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{app.description}</p>
            </details>
          </div>
        ))}
        {(!apps || apps.length === 0) && (
          <p className="text-muted-foreground text-center py-12">No hay apps pendientes.</p>
        )}
      </div>
    </div>
  );
}
