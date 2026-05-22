import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-3">{APP_NAME}</h3>
          <p className="text-sm text-muted-foreground">
            Marketplace de aplicaciones listas para usar.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Explorar</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/apps" className="hover:text-primary">Todas las apps</Link></li>
            <li><Link href="/categories" className="hover:text-primary">Categorías</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Para devs</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/sell" className="hover:text-primary">Vender tu app</Link></li>
            <li><Link href="/developer/apps" className="hover:text-primary">Panel dev</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/terms" className="hover:text-primary">Términos</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Privacidad</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
