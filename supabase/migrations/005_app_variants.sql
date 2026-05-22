-- =========================================================
-- Migration 005: Variantes (sub-productos) y solicitudes de cotización
-- Ejecuta en Supabase SQL Editor
-- =========================================================

-- Tabla de variantes (sub-tarjetas dentro de una app/servicio)
create table if not exists public.app_variants (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references public.apps(id) on delete cascade,

  slug text not null,
  name text not null,
  description text,

  -- Precio
  price_cents int,                              -- null si type='quote' o 'coming_soon'
  original_price_cents int,                     -- para mostrar precio tachado con descuento
  discount_pct int,                             -- alternativa: porcentaje de descuento

  -- Tipo de variante
  type text not null default 'fixed'
    check (type in ('fixed', 'quote', 'coming_soon')),

  -- Configuración del formulario para variantes tipo 'quote'
  quote_form_fields jsonb default '[]',         -- [{name,label,type,required,placeholder}]
  quote_instructions text,

  display_order int default 0,
  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(app_id, slug)
);

-- Campos en apps
alter table public.apps add column if not exists has_variants boolean default false;
alter table public.apps add column if not exists min_price_cents int;

-- variant_id en purchases
alter table public.purchases add column if not exists variant_id uuid references public.app_variants(id);

-- Tabla de cotizaciones (para variantes tipo 'quote')
create table if not exists public.quote_requests (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references public.apps(id) on delete cascade,
  variant_id uuid references public.app_variants(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,

  name text not null,
  email text not null,
  phone text,

  form_data jsonb not null default '{}',
  message text,

  status text default 'new' check (status in ('new', 'reviewing', 'responded', 'closed')),
  response text,
  responded_at timestamptz,
  responded_by uuid references public.profiles(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices
create index if not exists idx_variants_app on public.app_variants(app_id);
create index if not exists idx_quote_requests_app on public.quote_requests(app_id);
create index if not exists idx_quote_requests_status on public.quote_requests(status);

-- RLS
alter table public.app_variants enable row level security;
alter table public.quote_requests enable row level security;

create policy "Variants públicos si app live" on public.app_variants
  for select using (
    exists (select 1 from public.apps where id = app_id and status = 'live')
    or exists (select 1 from public.apps where id = app_id and developer_id = auth.uid())
  );

create policy "Dev gestiona sus variants" on public.app_variants
  for all using (
    exists (select 1 from public.apps where id = app_id and developer_id = auth.uid())
  );

create policy "Admin gestiona todos variants" on public.app_variants
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Cualquiera crea quote request" on public.quote_requests
  for insert with check (true);

create policy "Dev ve quotes de sus apps" on public.quote_requests
  for select using (
    exists (select 1 from public.apps where id = app_id and developer_id = auth.uid())
  );

create policy "Admin ve todos quotes" on public.quote_requests
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Trigger: cuando cambian variantes, recalcula min_price y has_variants en la app
create or replace function public.update_app_pricing_from_variants()
returns trigger as $$
declare
  target_app_id uuid;
begin
  target_app_id := coalesce(new.app_id, old.app_id);

  update public.apps
  set min_price_cents = (
        select min(coalesce(price_cents, 0))
        from public.app_variants
        where app_id = target_app_id
          and is_active = true
          and type = 'fixed'
          and price_cents is not null
      ),
      has_variants = exists(
        select 1 from public.app_variants
        where app_id = target_app_id and is_active = true
      ),
      updated_at = now()
  where id = target_app_id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists variants_update_app_pricing on public.app_variants;
create trigger variants_update_app_pricing
  after insert or update or delete on public.app_variants
  for each row execute function public.update_app_pricing_from_variants();
