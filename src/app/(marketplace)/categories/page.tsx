import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APP_CATEGORIES } from "@/lib/constants";

export const metadata = {
  title: "Categorías",
  description: "Explora apps por categoría: puntos de venta, bots, agentes IA, analítica y más.",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Cuento cuántas apps live hay por categoría
  const { data: counts } = await supabase
    .from("apps")
    .select("category_id")
    .eq("status", "live");

  const countByCategory = new Map<number, number>();
  counts?.forEach((row: any) => {
    if (row.category_id != null) {
      countByCategory.set(row.category_id, (countByCategory.get(row.category_id) ?? 0) + 1);
    }
  });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (
    <div className="container py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold mb-3">Categorías</h1>
        <p className="text-lg text-muted-foreground">
          Encuentra apps para emprendedores organizadas por tipo de solución.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((cat: any) => {
          const emoji = APP_CATEGORIES.find((c) => c.slug === cat.slug)?.emoji ?? "📦";
          const count = countByCategory.get(cat.id) ?? 0;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group p-6 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">
                {emoji}
              </div>
              <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                {cat.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {count === 0 ? "Sin apps aún" : count === 1 ? "1 app disponible" : `${count} apps disponibles`}
              </p>
            </Link>
          );
        })}
      </div>

      {(!categories || categories.length === 0) && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No hay categorías cargadas todavía.</p>
        </div>
      )}
    </div>
  );
}
