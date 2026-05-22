import { notFound } from "next/navigation";
import { AppCard } from "@/components/marketplace/app-card";
import { createClient } from "@/lib/supabase/server";

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase.from("categories").select("*").eq("slug", name).single();
  if (!category) notFound();

  const { data: apps } = await supabase
    .from("apps")
    .select("*")
    .eq("status", "live")
    .eq("category_id", category.id)
    .order("purchases_count", { ascending: false });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      <p className="text-muted-foreground mb-8">{apps?.length ?? 0} apps disponibles</p>
      {apps && apps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map((app) => <AppCard key={app.id} app={app} />)}
        </div>
      ) : (
        <p className="text-muted-foreground">No hay apps en esta categoría aún.</p>
      )}
    </div>
  );
}
