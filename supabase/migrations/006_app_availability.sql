-- =========================================================
-- Migration 006: Estado de disponibilidad de apps
-- Permite marcar apps como "disponible" o "próximamente"
-- =========================================================

alter table public.apps
  add column if not exists availability text default 'available'
  check (availability in ('available', 'coming_soon'));

-- Index para filtrar rápido apps disponibles
create index if not exists idx_apps_availability on public.apps(availability) where status = 'live';
