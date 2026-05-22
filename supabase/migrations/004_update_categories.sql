-- =========================================================
-- Actualizar categorías al tema "Apps para emprendedores"
-- Ejecuta este SQL en Supabase SQL Editor
-- =========================================================

-- Si tienes apps que referencian categorías antiguas, primero las dejamos sin categoría
update public.apps
set category_id = null
where category_id in (
  select id from public.categories
  where slug not in ('pos', 'bots', 'ai-agents', 'analytics', 'support', 'tools', 'other')
);

-- Borrar categorías antiguas que ya no aplican
delete from public.categories
where slug not in ('pos', 'bots', 'ai-agents', 'analytics', 'support', 'tools', 'other');

-- Insertar / actualizar las nuevas categorías
insert into public.categories (slug, name, icon, display_order) values
  ('pos', 'Puntos de venta', 'ShoppingCart', 1),
  ('bots', 'Bots', 'Bot', 2),
  ('ai-agents', 'Agentes IA', 'Sparkles', 3),
  ('analytics', 'Analítica', 'BarChart3', 4),
  ('support', 'Soporte técnico', 'Headphones', 5),
  ('tools', 'Herramientas', 'Wrench', 6),
  ('other', 'Otros', 'Package', 7)
on conflict (slug) do update
  set name = excluded.name,
      icon = excluded.icon,
      display_order = excluded.display_order;
