import Link from "next/link";
import { ArrowRight, DollarSign, Globe, MessageSquare, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMMISSION_PCT } from "@/lib/constants";

export const metadata = {
  title: "Vende tu app a miles de emprendedores",
  description:
    "Convierte tu app en ingresos recurrentes. Llegamos a emprendedores que necesitan tu solución. Tú creas, nosotros traemos los compradores.",
};

export default function SellPage() {
  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
          <Users className="h-3.5 w-3.5" />
          <span>Para vendedores</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          Vende tu app a{" "}
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            miles de emprendedores
          </span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Tú creas la app, nosotros te traemos compradores que la necesitan.
          Solo {COMMISSION_PCT}% de comisión por venta — sin mensualidad ni costos ocultos.
        </p>
        <Link href="/register">
          <Button size="lg" className="gap-2">
            Crear cuenta de vendedor <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Llegada a emprendedores</h3>
          <p className="text-muted-foreground">
            Tu app visible en buscadores y en nuestro newsletter de emprendedores activos.
            SEO optimizado en cada página.
          </p>
        </div>
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Pagos automáticos</h3>
          <p className="text-muted-foreground">
            Stripe Connect transfiere a tu cuenta el {100 - COMMISSION_PCT}% del precio
            automáticamente con cada venta. Sin trámites manuales.
          </p>
        </div>
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Tú das el soporte</h3>
          <p className="text-muted-foreground">
            Eres el experto de tu app. Los emprendedores te contactan directamente
            por nuestro sistema de tickets.
          </p>
        </div>
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Sin riesgo</h3>
          <p className="text-muted-foreground">
            No pagas mensualidad. Solo nos quedamos {COMMISSION_PCT}% cuando vendes.
            Si no vendes, no pagas nada.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">¿Qué tipo de apps puedes vender?</h2>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {["🛒 Puntos de venta", "🤖 Bots", "✨ Agentes IA", "📊 Analítica", "🎧 Soporte técnico", "🛠️ Herramientas"].map((c) => (
            <span key={c} className="px-3 py-1.5 rounded-full bg-muted">{c}</span>
          ))}
        </div>
        <p className="text-muted-foreground pt-4">
          Si construiste algo que ayuda a emprendedores a vender más, automatizar o escalar — tiene cabida aquí.
        </p>
      </div>
    </div>
  );
}
