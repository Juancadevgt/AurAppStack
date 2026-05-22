export const APP_NAME = "AurAppStack";
export const APP_DESCRIPTION =
  "Apps y servicios para emprendedores. Punto de venta, bots, agentes IA, analítica, soporte técnico, desarrollo a medida y más.";
export const APP_TAGLINE = "El marketplace de apps y servicios para emprendedores";

export const COMMISSION_PCT = Number(process.env.MARKETPLACE_COMMISSION_PCT ?? "20");

export const APP_CATEGORIES = [
  { slug: "pos", name: "Puntos de venta", icon: "ShoppingCart", emoji: "🛒" },
  { slug: "bots", name: "Bots", icon: "Bot", emoji: "🤖" },
  { slug: "ai-agents", name: "Agentes IA", icon: "Sparkles", emoji: "✨" },
  { slug: "analytics", name: "Analítica", icon: "BarChart3", emoji: "📊" },
  { slug: "support", name: "Soporte técnico", icon: "Headphones", emoji: "🎧" },
  { slug: "tools", name: "Herramientas", icon: "Wrench", emoji: "🛠️" },
  { slug: "services", name: "Servicios", icon: "Briefcase", emoji: "💼" },
  { slug: "other", name: "Otros", icon: "Package", emoji: "📦" },
] as const;

export const DELIVERY_TYPES = [
  { value: "saas", label: "SaaS / Acceso por login" },
  { value: "download", label: "Descarga (código/instalador)" },
  { value: "service", label: "Servicio (instalación a medida)" },
] as const;
