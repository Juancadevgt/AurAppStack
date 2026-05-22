import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppForm } from "../../_components/app-form";

export default async function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: app }, { data: categories }] = await Promise.all([
    supabase.from("apps").select("*").eq("id", id).eq("developer_id", user!.id).single(),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  if (!app) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar: {app.title}</h1>
      <AppForm app={app} categories={categories ?? []} />
    </div>
  );
}
