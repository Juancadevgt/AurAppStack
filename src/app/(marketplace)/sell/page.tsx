import Link from "next/link";
import { ArrowRight, DollarSign, Globe, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMMISSION_PCT } from "@/lib/constants";

export const metadata = {
  title: "Vende tu app en AurAppStack",
  description: "Convierte tu app en ingresos. Llegamos a miles de compradores y manejamos los pagos.",
};

export default function SellPage() {
  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl font-bold">
          Vende tu app a miles de personas
        </h1>
        <p className="text-xl text-muted-foreground">
          Tú creas la app, nosotros te traemos compradores. Comisión solo del {COMMISSION_PCT}% por venta.
        </p>
        <Link href="/register">
          <Button size="lg" className="gap-2">
            Empezar a vender <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Llegada global</h3>
          <p className="text-muted-foreground">
            Tu app visible en buscadores. Posicionamos tus apps en Google con SEO optimizado.
          </p>
        </div>
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Pagos automáticos</h3>
          <p className="text-muted-foreground">
            Stripe Connect transfiere a tu cuenta el {100 - COMMISSION_PCT}% del precio automáticamente.
          </p>
        </div>
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Tú das el soporte</h3>
          <p className="text-muted-foreground">
            Eres el experto de tu app. Los compradores te contactan directo via tickets.
          </p>
        </div>
        <div className="border rounded-lg p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Sin riesgo</h3>
          <p className="text-muted-foreground">
            No pagas mensualidad. Solo nos quedamos {COMMISSION_PCT}% cuando vendes.
          </p>
        </div>
      </div>
    </div>
  );
}
