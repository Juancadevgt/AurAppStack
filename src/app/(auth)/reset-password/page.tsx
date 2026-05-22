import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Nueva contraseña" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay sesión, el link expiró o nunca se generó
  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enlace inválido o expirado</CardTitle>
          <CardDescription>
            No pudimos verificar tu enlace de recuperación. Es posible que haya expirado o ya
            se haya usado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {params.error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
              {params.error}
            </div>
          )}
          <Link href="/forgot-password" className="text-primary hover:underline block">
            → Solicitar un nuevo enlace
          </Link>
          <Link href="/login" className="text-primary hover:underline block">
            ← Volver al inicio de sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Establece tu nueva contraseña</CardTitle>
        <CardDescription>
          Hola {user.email} — elige una contraseña segura (mínimo 8 caracteres).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
