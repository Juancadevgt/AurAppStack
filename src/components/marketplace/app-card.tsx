import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { App } from "@/types/database";

export function AppCard({ app }: { app: App }) {
  return (
    <Link href={`/apps/${app.slug}`} className="group">
      <div className="rounded-lg border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        {app.cover_url ? (
          <div className="aspect-video relative bg-muted">
            <Image src={app.cover_url} alt={app.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            {app.icon_url && (
              <Image src={app.icon_url} alt={app.title} width={64} height={64} className="rounded-xl" />
            )}
          </div>
        )}
        <div className="p-4 space-y-2">
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
          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary">
              {app.price_cents === 0 ? "Gratis" : formatPrice(app.price_cents, app.currency)}
            </Badge>
            <span className="text-xs text-muted-foreground">{app.purchases_count} ventas</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
