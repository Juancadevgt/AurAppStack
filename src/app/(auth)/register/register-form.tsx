"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Internamente "developer" = vendedor en la UI
  const [role, setRole] = useState<"buyer" | "developer">("buyer");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(
      role === "developer"
        ? "¡Cuenta de vendedor creada! Revisa tu correo."
        : "¡Cuenta creada! Revisa tu correo para confirmar.",
    );
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`p-3 rounded-md border text-sm transition-colors ${
            role === "buyer" ? "border-primary bg-primary/10" : "border-input"
          }`}
        >
          🛒 Comprador
          <p className="text-xs text-muted-foreground mt-1">Comprar apps</p>
        </button>
        <button
          type="button"
          onClick={() => setRole("developer")}
          className={`p-3 rounded-md border text-sm transition-colors ${
            role === "developer" ? "border-primary bg-primary/10" : "border-input"
          }`}
        >
          💼 Vendedor
          <p className="text-xs text-muted-foreground mt-1">Vender mis apps</p>
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input id="full_name" name="full_name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando..." : `Crear cuenta de ${role === "buyer" ? "comprador" : "vendedor"}`}
      </Button>
    </form>
  );
}
