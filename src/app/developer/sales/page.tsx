import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function SalesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sales } = await supabase
    .from("purchases")
    .select("*, apps(title, slug), profiles!purchases_buyer_id_fkey(full_name, email)")
    .eq("developer_id", user!.id)
    .order("created_at", { ascending: false });

  const totals = sales?.reduce(
    (acc, s: any) => {
      if (s.status === "completed") {
        acc.gross += s.amount_cents;
        acc.net += s.developer_payout_cents;
        acc.count += 1;
      }
      return acc;
    },
    { gross: 0, net: 0, count: 0 },
  ) ?? { gross: 0, net: 0, count: 0 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis ventas</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total ventas</p>
          <p className="text-2xl font-bold">{totals.count}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Ingresos brutos</p>
          <p className="text-2xl font-bold">{formatPrice(totals.gross)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Ingresos netos (a ti)</p>
          <p className="text-2xl font-bold text-primary">{formatPrice(totals.net)}</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-left">
              <th className="p-3">Fecha</th>
              <th className="p-3">App</th>
              <th className="p-3">Comprador</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Tu ganancia</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sales?.map((s: any) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">{new Date(s.created_at).toLocaleDateString("es")}</td>
                <td className="p-3">{s.apps?.title}</td>
                <td className="p-3">{s.profiles?.full_name ?? s.profiles?.email}</td>
                <td className="p-3">{formatPrice(s.amount_cents)}</td>
                <td className="p-3 font-medium text-primary">{formatPrice(s.developer_payout_cents)}</td>
                <td className="p-3 capitalize">{s.status}</td>
              </tr>
            ))}
            {(!sales || sales.length === 0) && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aún no tienes ventas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
