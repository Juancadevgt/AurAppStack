-- =========================================================
-- Migration 007: Sistema de gestión de trámites
-- Tracking de pedidos, documentos requeridos, log de actividad
-- =========================================================

-- 1. Agregar campos de fulfillment a purchases
alter table public.purchases
  add column if not exists fulfillment_status text default 'received'
    check (fulfillment_status in (
      'received',              -- recibido, pendiente de pedir docs
      'documents_requested',   -- esperando docs del comprador
      'documents_received',    -- docs recibidos, pendiente iniciar
      'in_progress',           -- trámite en proceso
      'completed',             -- trámite completado
      'cancelled',             -- cancelado/reembolsado
      'on_hold'                -- pausado (esperando algo del comprador)
    )),
  add column if not exists fulfillment_data jsonb default '{}',  -- documentos enviados, resultado
  add column if not exists fulfillment_updated_at timestamptz,
  add column if not exists fulfillment_updated_by uuid references public.profiles(id);

-- 2. Documentos requeridos en cada variante (qué pedir al cliente)
alter table public.app_variants
  add column if not exists requires_documents jsonb default '[]',
  add column if not exists fulfillment_instructions text,
  add column if not exists estimated_delivery text;  -- "24-48 horas", etc.

-- 3. Log de actividad por purchase (chat entre comprador, vendedor y admin)
create table if not exists public.purchase_activity (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  actor_role text,  -- 'buyer', 'developer', 'admin', 'system'

  type text not null check (type in (
    'status_change',     -- cambio de estado
    'message',           -- mensaje texto entre partes
    'document_request',  -- admin solicita docs
    'document_upload',   -- comprador sube docs
    'note',              -- nota interna (solo admin/vendedor)
    'completion'         -- entrega final con resultado
  )),
  message text,
  metadata jsonb default '{}',
  is_internal boolean default false,  -- true = solo admin/dev lo ven

  created_at timestamptz default now()
);

create index if not exists idx_purchase_activity_purchase on public.purchase_activity(purchase_id, created_at desc);
create index if not exists idx_purchases_fulfillment_status on public.purchases(fulfillment_status) where fulfillment_status != 'completed';

-- 4. RLS para purchase_activity
alter table public.purchase_activity enable row level security;

drop policy if exists "Comprador ve su activity" on public.purchase_activity;
create policy "Comprador ve su activity no interna" on public.purchase_activity
  for select using (
    exists (select 1 from public.purchases where id = purchase_id and buyer_id = auth.uid())
    and is_internal = false
  );

drop policy if exists "Dev ve activity de sus ventas" on public.purchase_activity;
create policy "Dev ve toda activity de sus ventas" on public.purchase_activity
  for select using (
    exists (select 1 from public.purchases where id = purchase_id and developer_id = auth.uid())
  );

drop policy if exists "Admin ve todo activity" on public.purchase_activity;
create policy "Admin gestiona toda activity" on public.purchase_activity
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Insert activity participantes" on public.purchase_activity;
create policy "Participantes insertan activity" on public.purchase_activity
  for insert with check (
    exists (
      select 1 from public.purchases
      where id = purchase_id
        and (buyer_id = auth.uid() or developer_id = auth.uid())
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 5. Trigger: cuando cambia fulfillment_status, registrar en activity
create or replace function public.log_fulfillment_status_change()
returns trigger as $$
begin
  if (new.fulfillment_status is distinct from old.fulfillment_status) then
    insert into public.purchase_activity (
      purchase_id, actor_id, actor_role, type, message, metadata
    )
    select
      new.id,
      new.fulfillment_updated_by,
      coalesce((select role::text from public.profiles where id = new.fulfillment_updated_by), 'system'),
      'status_change',
      'Estado cambió a: ' || new.fulfillment_status,
      jsonb_build_object('from', old.fulfillment_status, 'to', new.fulfillment_status);

    new.fulfillment_updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists purchases_log_status_change on public.purchases;
create trigger purchases_log_status_change
  before update on public.purchases
  for each row execute function public.log_fulfillment_status_change();
