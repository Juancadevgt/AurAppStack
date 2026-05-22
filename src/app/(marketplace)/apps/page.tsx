import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/marketplace/app-card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Explorar apps",
  description: "Todas las aplicaciones del marketplace",
};

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function AppsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("apps").select("*").eq("status", "live");

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,tagline.ilike.%${params.q}%`);
  }

  const sort = params.sort ?? "popular";
  if (sort === "newest") query = query.order("published_at", { ascending: false });
  else if (sort === "price-low") query = query.order("price_cents", { ascending: true });
  else if (sort === "price-high") query = query.order("price_cents", { ascending: false });
  else query = query.order("purchases_count", { ascending: false });

  const { data: apps } = await query;
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Todas las apps</h1>
        <form className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Buscar apps..."
            defaultValue={params.q}
            className="pl-10"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <Link href="/apps">
            <Badge variant={!params.category ? "default" : "outline"}>Todas</Badge>
          </Link>
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <Badge variant="outline">{cat.name}</Badge>
            </Link>
          ))}
        </div>
      </div>

      {apps && apps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map((app) => <AppCard key={app.id} app={app} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No hay apps que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
