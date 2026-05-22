-- =========================================================
-- Marcar apps como DISPONIBLE / PRÓXIMAMENTE
-- Ejecuta DESPUÉS de la migration 006_app_availability.sql
-- =========================================================

-- Primero: TODAS las apps quedan como "próximamente"
update apps set availability = 'coming_soon';

-- Después: marcamos solo las que SÍ están listas
update apps set availability = 'available'
where slug in ('umdatax', 'servicio-sat');

-- Verificación
select
  title,
  slug,
  availability,
  case
    when availability = 'available' then '✅ DISPONIBLE'
    else '⏳ PRÓXIMAMENTE'
  end as estado
from apps
where status = 'live'
order by availability desc, title;
