import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Únete a AurAppStack como comprador o vendedor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
