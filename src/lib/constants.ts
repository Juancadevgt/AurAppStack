export const APP_NAME = "AurAppStack";
export const APP_DESCRIPTION =
  "Marketplace de aplicaciones: bots, POS, plantillas n8n y más. Compra software listo para usar.";

export const COMMISSION_PCT = Number(process.env.MARKETPLACE_COMMISSION_PCT ?? "20");

export const APP_CATEGORIES = [
  { slug: "whatsapp-bots", name: "Bots de WhatsApp", icon: "MessageCircle" },
  { slug: "pos", name: "Punto de Venta (POS)", icon: "ShoppingCart" },
  { slug: "crm", name: "CRM", icon: "Users" },
  { slug: "automations", name: "Automatizaciones (n8n, Make)", icon: "Workflow" },
  { slug: "ai-agents", name: "Agentes IA", icon: "Bot" },
  { slug: "ecommerce", name: "E-commerce", icon: "Store" },
  { slug: "analytics", name: "Analítica", icon: "BarChart3" },
  { slug: "productivity", name: "Productividad", icon: "Zap" },
  { slug: "templates", name: "Plantillas", icon: "Layout" },
  { slug: "other", name: "Otros", icon: "Package" },
] as const;

export const DELIVERY_TYPES = [
  { value: "saas", label: "SaaS / Acceso por login" },
  { value: "download", label: "Descarga (código/instalador)" },
  { value: "service", label: "Servicio (instalación a medida)" },
] as const;
