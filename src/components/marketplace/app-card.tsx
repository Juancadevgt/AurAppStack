import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { App } from "@/types/database";

type AppWithExtras = App & {
  has_variants?: boolean;
  min_price_cents?: number | null;
  availability?: "available" | "coming_soon";
};

export function AppCard({ app }: { app: AppWithExtras }) {
  const isComingSoon = app.availability === "coming_soon";

  const priceLabel = (() => {
    if (isComingSoon) return "Próximamente";
    if (app.has_variants) {
      if (app.min_price_cents != null && app.min_price_cents > 0) {
        return `Desde ${formatPrice(app.min_price_cents, app.currency)}`;
      }
      return "Por cotización";
    }
    return app.price_cents === 0
      ? "Gratis"
      : formatPrice(app.price_cents, app.currency);
  })();

  return (
    <Link href={`/apps/${app.slug}`} className="group">
      <div className={`relative rounded-lg border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col ${isComingSoon ? "opacity-90" : ""}`}>
        {/* Badge de disponibilidad en esquina superior derecha */}
        <div className="absolute top-2 right-2 z-10">
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">
              ⏳ Próximamente
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-green-100 text-green-800 border border-green-300 shadow-sm">
              ✓ Disponible
            </span>
          )}
        </div>

        {app.cover_url ? (
          <div className={`aspect-video relative bg-muted ${isComingSoon ? "grayscale-[60%]" : ""}`}>
            <Image src={app.cover_url} alt={app.title} fill className="object-cover" />
          </div>
        ) : (
          <div className={`aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center ${isComingSoon ? "grayscale-[60%]" : ""}`}>
            {app.icon_url && (
              <Image src={app.icon_url} alt={app.title} width={64} height={64} className="rounded-xl" />
            )}
          </div>
        )}
        <div className="p-4 space-y-2 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {app.title}
            </h3>
            {app.average_rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {app.average_rating.toFixed(1)}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {app.tagline}
          </p>
          <div className="flex items-center justify-between pt-2 mt-auto">
            <Badge variant={isComingSoon ? "outline" : "secondary"}>{priceLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              {isComingSoon ? "—" : app.has_variants ? "Multi-opción" : `${app.purchases_count} ventas`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
