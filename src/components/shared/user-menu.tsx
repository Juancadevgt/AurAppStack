"use client";

import Link from "next/link";
import { LayoutDashboard, Package, LogOut, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

export function UserMenu({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3">
      {profile.role === "developer" && (
        <Link href="/developer/apps">
          <Button variant="ghost" size="sm">
            <Package className="h-4 w-4" />
            Mis apps
          </Button>
        </Link>
      )}
      {profile.role === "admin" && (
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <Shield className="h-4 w-4" />
            Admin
          </Button>
        </Link>
      )}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
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
