import { createClient } from "@/lib/supabase/server";
import { AppForm } from "../_components/app-form";

export const metadata = { title: "Nueva app" };

export default async function NewAppPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publicar nueva app</h1>
        <p className="text-muted-foreground text-sm">
          Completa la información. Tu app pasará por revisión antes de publicarse.
        </p>
      </div>
      <AppForm categories={categories ?? []} />
    </div>
  );
}
