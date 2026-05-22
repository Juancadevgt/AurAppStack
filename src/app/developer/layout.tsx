import { Package, DollarSign, CreditCard, MessageSquare, Settings } from "lucide-react";
import { Header } from "@/components/shared/header";
import { DashboardNav } from "@/components/shared/dashboard-nav";

const navItems = [
  { href: "/developer/apps", label: "Mis apps", icon: <Package className="h-4 w-4" /> },
  { href: "/developer/sales", label: "Ventas", icon: <DollarSign className="h-4 w-4" /> },
  { href: "/developer/payouts", label: "Pagos", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/developer/support", label: "Soporte", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/developer/settings", label: "Perfil", icon: <Settings className="h-4 w-4" /> },
];

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-6 flex-1 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Vendedor</p>
            <DashboardNav items={navItems} />
          </div>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">{children}</main>
      </div>
    </div>
  );
}
