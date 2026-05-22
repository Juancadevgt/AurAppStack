// Tipos de la base de datos AurAppStack
// Para tipos exactos, después de aplicar el SQL en Supabase regenera con:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type UserRole = "buyer" | "developer" | "admin";
export type AppStatus = "draft" | "pending_review" | "live" | "rejected" | "paused";
export type DeliveryType = "saas" | "download" | "service";
export type PurchaseStatus = "pending" | "completed" | "refunded" | "failed";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeveloperProfile {
  id: string;
  company_name: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_completed: boolean;
  verified: boolean;
  total_sales_count: number;
  total_revenue_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface App {
  id: string;
  developer_id: string;
  category_id: number | null;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  icon_url: string | null;
  cover_url: string | null;
  price_cents: number;
  currency: string;
  delivery_type: DeliveryType;
  demo_url: string | null;
  documentation_url: string | null;
  support_email: string;
  status: AppStatus;
  rejection_reason: string | null;
  views_count: number;
  purchases_count: number;
  average_rating: number;
  reviews_count: number;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppScreenshot {
  id: string;
  app_id: string;
  url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  app_id: string;
  developer_id: string;
  amount_cents: number;
  commission_cents: number;
  developer_payout_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  status: PurchaseStatus;
  access_key: string | null;
  created_at: string;
  completed_at: string | null;
  refunded_at: string | null;
}

export interface Review {
  id: string;
  app_id: string;
  buyer_id: string;
  purchase_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  buyer_id: string;
  app_id: string;
  developer_id: string;
  subject: string;
  status: TicketStatus;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  user_id: string | null;
  categories_interest: number[];
  receive_new_apps: boolean;
  receive_discounts: boolean;
  unsubscribed_at: string | null;
  created_at: string;
}

// Tipo Database permisivo. Para typing estricto, regenera con `supabase gen types`.
export type Database = any;
