-- =========================================================
-- AurAppStack - Esquema inicial
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =========================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;  -- búsqueda por texto

-- =========================================================
-- ENUMS
-- =========================================================
create type user_role as enum ('buyer', 'developer', 'admin');
create type app_status as enum ('draft', 'pending_review', 'live', 'rejected', 'paused');
create type delivery_type as enum ('saas', 'download', 'service');
create type purchase_status as enum ('pending', 'completed', 'refunded', 'failed');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

-- =========================================================
-- PROFILES (extiende auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role user_role not null default 'buyer',
  bio text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Crea profile automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- DEVELOPER_PROFILES (perfil extendido para devs)
-- =========================================================
create table public.developer_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text,
  stripe_account_id text unique,
  stripe_onboarding_completed boolean default false,
  verified boolean default false,
  total_sales_count int default 0,
  total_revenue_cents bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- CATEGORIES
-- =========================================================
create table public.categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  icon text,
  description text,
  display_order int default 0,
  created_at timestamptz default now()
);

insert into public.categories (slug, name, icon, display_order) values
  ('whatsapp-bots', 'Bots de WhatsApp', 'MessageCircle', 1),
  ('pos', 'Punto de Venta (POS)', 'ShoppingCart', 2),
  ('crm', 'CRM', 'Users', 3),
  ('automations', 'Automatizaciones', 'Workflow', 4),
  ('ai-agents', 'Agentes IA', 'Bot', 5),
  ('ecommerce', 'E-commerce', 'Store', 6),
  ('analytics', 'Analítica', 'BarChart3', 7),
  ('productivity', 'Productividad', 'Zap', 8),
  ('templates', 'Plantillas', 'Layout', 9),
  ('other', 'Otros', 'Package', 10);

-- =========================================================
-- APPS (productos del marketplace)
-- =========================================================
create table public.apps (
  id uuid primary key default uuid_generate_v4(),
  developer_id uuid not null references public.profiles(id) on delete cascade,
  category_id int references public.categories(id),

  title text not null,
  slug text not null unique,
  tagline text not null,                  -- 1 línea para cards
  description text not null,              -- markdown
  icon_url text,
  cover_url text,                          -- imagen grande

  price_cents int not null default 0,     -- 0 = gratis
  currency text not null default 'USD',

  delivery_type delivery_type not null default 'saas',
  demo_url text,
  documentation_url text,
  support_email text not null,            -- correo de soporte del dev

  status app_status not null default 'draft',
  rejection_reason text,

  -- Stats
  views_count int default 0,
  purchases_count int default 0,
  average_rating numeric(2,1) default 0,
  reviews_count int default 0,

  tags text[] default '{}',

  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_apps_status on public.apps(status) where status = 'live';
create index idx_apps_category on public.apps(category_id) where status = 'live';
create index idx_apps_developer on public.apps(developer_id);
create index idx_apps_search on public.apps using gin (
  to_tsvector('spanish', title || ' ' || tagline || ' ' || description)
);

-- =========================================================
-- APP_SCREENSHOTS
-- =========================================================
create table public.app_screenshots (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references public.apps(id) on delete cascade,
  url text not null,
  caption text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- =========================================================
-- APP_VERSIONS (historial de versiones para descargas)
-- =========================================================
create table public.app_versions (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references public.apps(id) on delete cascade,
  version text not null,
  changelog text,
  file_url text,                          -- para apps tipo 'download'
  released_at timestamptz default now()
);

-- =========================================================
-- PURCHASES (transacciones)
-- =========================================================
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(id),
  app_id uuid not null references public.apps(id),
  developer_id uuid not null references public.profiles(id),

  amount_cents int not null,
  commission_cents int not null,          -- comisión del marketplace
  developer_payout_cents int not null,    -- lo que recibe el dev
  currency text not null default 'USD',

  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_transfer_id text,

  status purchase_status not null default 'pending',
  access_key text,                        -- token para SaaS / link descarga firmado

  created_at timestamptz default now(),
  completed_at timestamptz,
  refunded_at timestamptz
);

create index idx_purchases_buyer on public.purchases(buyer_id);
create index idx_purchases_app on public.purchases(app_id);
create index idx_purchases_developer on public.purchases(developer_id);

-- =========================================================
-- REVIEWS
-- =========================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references public.apps(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  purchase_id uuid references public.purchases(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (app_id, buyer_id)
);

-- Recalcula rating promedio cuando hay nueva review
create or replace function public.update_app_rating()
returns trigger as $$
begin
  update public.apps set
    average_rating = (select avg(rating)::numeric(2,1) from public.reviews where app_id = coalesce(new.app_id, old.app_id)),
    reviews_count = (select count(*) from public.reviews where app_id = coalesce(new.app_id, old.app_id))
  where id = coalesce(new.app_id, old.app_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger reviews_after_change
  after insert or update or delete on public.reviews
  for each row execute function public.update_app_rating();

-- =========================================================
-- SUPPORT_TICKETS (comprador -> desarrollador)
-- =========================================================
create table public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(id),
  app_id uuid not null references public.apps(id),
  developer_id uuid not null references public.profiles(id),
  subject text not null,
  status ticket_status not null default 'open',
  priority text default 'normal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.support_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  message text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- NEWSLETTER
-- =========================================================
create table public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  categories_interest int[] default '{}',  -- ids de categories
  receive_new_apps boolean default true,
  receive_discounts boolean default true,
  unsubscribed_at timestamptz,
  created_at timestamptz default now()
);

-- =========================================================
-- COUPONS (descuentos)
-- =========================================================
create table public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  app_id uuid references public.apps(id) on delete cascade,  -- null = global
  discount_pct int check (discount_pct between 1 and 100),
  discount_cents int,
  max_uses int,
  used_count int default 0,
  expires_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================
alter table public.profiles enable row level security;
alter table public.developer_profiles enable row level security;
alter table public.apps enable row level security;
alter table public.app_screenshots enable row level security;
alter table public.app_versions enable row level security;
alter table public.purchases enable row level security;
alter table public.reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.coupons enable row level security;

-- PROFILES: cualquiera ve perfiles públicos, solo el dueño edita
create policy "Profiles públicos en lectura" on public.profiles
  for select using (true);
create policy "Solo dueño edita su profile" on public.profiles
  for update using (auth.uid() = id);

-- DEVELOPER_PROFILES: idem
create policy "Developer profiles públicos" on public.developer_profiles
  for select using (true);
create policy "Solo dev edita su perfil dev" on public.developer_profiles
  for all using (auth.uid() = id);

-- APPS: live es público, draft/pending solo del dev y admin
create policy "Apps live son públicas" on public.apps
  for select using (status = 'live' or developer_id = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Dev crea/edita su app" on public.apps
  for all using (developer_id = auth.uid());
create policy "Admin gestiona todas las apps" on public.apps
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- APP_SCREENSHOTS y VERSIONS: heredan de apps
create policy "Screenshots públicos si app live" on public.app_screenshots
  for select using (exists (select 1 from public.apps where id = app_id and (status = 'live' or developer_id = auth.uid())));
create policy "Dev gestiona sus screenshots" on public.app_screenshots
  for all using (exists (select 1 from public.apps where id = app_id and developer_id = auth.uid()));

create policy "Versions públicas si app live" on public.app_versions
  for select using (exists (select 1 from public.apps where id = app_id and (status = 'live' or developer_id = auth.uid())));
create policy "Dev gestiona sus versions" on public.app_versions
  for all using (exists (select 1 from public.apps where id = app_id and developer_id = auth.uid()));

-- PURCHASES: comprador y dev ven las suyas
create policy "Comprador ve sus compras" on public.purchases
  for select using (buyer_id = auth.uid());
create policy "Dev ve ventas de sus apps" on public.purchases
  for select using (developer_id = auth.uid());
create policy "Admin ve todas" on public.purchases
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- REVIEWS: lectura pública, solo comprador escribe
create policy "Reviews públicas" on public.reviews
  for select using (true);
create policy "Solo comprador crea review" on public.reviews
  for insert with check (buyer_id = auth.uid() and
    exists (select 1 from public.purchases where buyer_id = auth.uid() and app_id = reviews.app_id and status = 'completed'));
create policy "Comprador edita su review" on public.reviews
  for update using (buyer_id = auth.uid());

-- SUPPORT_TICKETS: comprador, dev y admin del ticket
create policy "Ticket: comprador y dev" on public.support_tickets
  for all using (buyer_id = auth.uid() or developer_id = auth.uid());
create policy "Admin ve todos los tickets" on public.support_tickets
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Mensajes: solo participantes" on public.support_messages
  for all using (exists (select 1 from public.support_tickets where id = ticket_id
    and (buyer_id = auth.uid() or developer_id = auth.uid())));

-- NEWSLETTER: cualquiera se suscribe, solo dueño ve/edita
create policy "Suscribirse al newsletter" on public.newsletter_subscribers
  for insert with check (true);
create policy "Ver mi suscripción" on public.newsletter_subscribers
  for select using (user_id = auth.uid() or user_id is null);
create policy "Editar mi suscripción" on public.newsletter_subscribers
  for update using (user_id = auth.uid());

-- COUPONS: público leer activos, admin/dev del app crean
create policy "Cupones leibles" on public.coupons
  for select using (true);
create policy "Admin crea cupones globales" on public.coupons
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- =========================================================
-- STORAGE: buckets
-- =========================================================
insert into storage.buckets (id, name, public) values
  ('app-icons', 'app-icons', true),
  ('app-screenshots', 'app-screenshots', true),
  ('app-files', 'app-files', false),       -- privado: descargas tras compra
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Upload avatars autenticados" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');
create policy "Lectura pública avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Devs suben iconos/screenshots" on storage.objects
  for insert to authenticated with check (bucket_id in ('app-icons','app-screenshots'));
create policy "Lectura pública assets apps" on storage.objects
  for select using (bucket_id in ('app-icons','app-screenshots'));

create policy "Devs suben archivos privados" on storage.objects
  for insert to authenticated with check (bucket_id = 'app-files');
create policy "Solo comprador descarga app-files" on storage.objects
  for select using (
    bucket_id = 'app-files'
    and exists (select 1 from public.purchases p
      join public.apps a on a.id = p.app_id
      where p.buyer_id = auth.uid() and p.status = 'completed'
      and storage.objects.name like a.id::text || '/%')
  );
