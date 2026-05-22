"use client";

import Link from "next/link";
import { LogOut, Settings, ShoppingBag, Store, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

const roleConfig = {
  buyer: {
    label: "Comprador",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: ShoppingBag,
    dashboardHref: "/dashboard",
    dashboardLabel: "Mi cuenta",
  },
  developer: {
    label: "Vendedor",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Store,
    dashboardHref: "/developer/apps",
    dashboardLabel: "Mis ventas",
  },
  admin: {
    label: "Admin",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: Shield,
    dashboardHref: "/admin",
    dashboardLabel: "Panel admin",
  },
} as const;

export function UserMenu({ profile }: { profile: Profile }) {
  const config = roleConfig[profile.role];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Link href={config.dashboardHref}>
        <Button variant="ghost" size="sm" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{config.dashboardLabel}</span>
        </Button>
      </Link>

      <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full border bg-background">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.color}`}>
          {config.label}
        </span>
        <span className="text-sm font-medium pr-1">
          {profile.full_name?.split(" ")[0] ?? "Usuario"}
        </span>
      </div>

      <Link href="/dashboard/settings">
        <Button variant="ghost" size="icon" title="Configuración">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>

      <form action="/auth/signout" method="POST">
        <Button variant="ghost" size="icon" type="submit" title="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
